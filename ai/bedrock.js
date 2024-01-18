const {
    BedrockRuntimeClient,
    InvokeModelCommand,
} = require("@aws-sdk/client-bedrock-runtime");
const container = require('../container');
const chats = container.get('chats');
console.log('bedrock: chats = ', chats);

const chat = async ({question, modelId, maxTokensToSample, temperature, topP, topK}) => {
    const input = {
        modelId: modelId ?? 'anthropic.claude-v2',
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
            prompt: `Human:\\nYour task is to answer questions. Follow the instruction closely, but don't mention the instructions in your reply. Your answer must be a properly formatted plain text. Do not add any additional remarks or notes. Do not act like a chatbot, but do act like a real person, and your name is 哈德韦 who dreams to be a LEGO master in the future and knows very much details about the LEGO group and the family. When you mention the LEGO®, please use the LEGO group, or the LEGO toy. You must remind that the LEGO is not a noun, and for legal reasons when mention the LEGO you should use it as an adjective if and only if the question contains the using of LEGO as a noun. If someone has to write the LEGO separately, do append the ® after it, as LEGO®. If the question content is English then respond with English. If the question content is in Chinese, then respond in Chinese. If it's in other language, then respond with the language too.\\nDo not lose the original meaning.\\nYou must keep the text as plain text and make it as short as possible without any line breaks as the text will be sent back to wechat official accounts in the wechat app, the space is limited. Don't think too long, respond quickly with short text is totally OK.\\n\\nContent:\\n${question}\\n\\nAssistant:`,
            max_tokens_to_sample: maxTokensToSample ?? 2000,
            temperature: temperature ?? 1,
            top_p: topP ?? 1,
            top_k: topK ?? 250
        })
    }

    const client = container.get('BedrockRuntimeClient') ?? new BedrockRuntimeClient({
        region: "us-east-1",
        "credentials": {
            "accessKeyId": process.env.AWSAccessKeyId,
            "secretAccessKey": process.env.AWSSecretAccessKey
        }
    });

    try {
        const command = new InvokeModelCommand(input);
        const response = await client.send(command);

        const rawRes = response.body;
        const jsonString = new TextDecoder().decode(rawRes);

        console.log("-------------------------");
        // Answers are in parsedResponse.completion
        console.log(jsonString);
        console.log("-------------------------");

        const json = JSON.parse(jsonString);

        if (json.stop_reason === 'stop_sequence') {
            return json.completion;
        } else {
            return '';
        }
    } catch (ex) {
        console.error('chat error = ', ex);

        return `抱歉，服务出错了，原因是： ${ex.message}`;
    }
}

const bedrock = {
    async chat({question, modelId, maxTokensToSample, temperature, topP, topK}) {
        return await chat({question, modelId, maxTokensToSample, temperature, topP, topK});
    },
    async memoizeChat({question, modelId, maxTokensToSample, temperature, topP, topK, messageId}) {
        let cache = await chats.get(messageId);
        console.log(`cache of ${messageId} = `, cache);

        if (cache && cache.props) {
            cache = cache.props;
        }

        if (cache && cache.answer) {
            await chats.set(messageId, {
                answer: cache.answer,
                called: cache.called + 1,
            });

            return cache.answer;
        } else {
            const called = cache ? cache.called + 1 : 1;
            await chats.set(messageId, {
                called
            })
            const answer = await chat({question, modelId, maxTokensToSample, temperature, topP, topK});

            await chats.delete(messageId);
            const res = await chats.set(messageId, {
                question,
                answer,
                modelId,
                maxTokensToSample,
                temperature,
                topP,
                topK,
                messageId,
                called
            });

            console.log('saved to cache: ', res);

            return answer;
        }
    },

    async recall(messageId) {
        const recalled = await chats.get(messageId);
        if (recalled) {
            return recalled.props ? recalled.props : recalled;
        } else {
            return null;
        }
    },
}

bedrock.chatWithRetry = async ({
                                   question,
                                   messageId,
                                   modelId,
                                   maxTokensToSample,
                                   temperature,
                                   topP,
                                   topK
                               }, hostname) => {
    const memoizeChat = bedrock.memoizeChat({
        question,
        modelId,
        maxTokensToSample,
        temperature,
        topP,
        topK,
        messageId
    });

    try {
        return await Promise.race([memoizeChat, new Promise((resolve, reject) => {
            setTimeout(() => {
                reject('timeout');
            }, container.get('SessionDuration'));
        })])
    } catch (ex) {
        console.log('error = ', ex);

        const progress = await bedrock.recall(messageId);
        console.log('chatwithretry: progress = ', progress);
        if (progress.called >= 3) {
            // 超时3次后，调用超时，则不再等待，直接返回兜底回复。
            return `抱歉，我还没想好怎么回答。不过，稍后我可能会回复，你可以通过这个链接查看： ${hostname}/recall?messageId=${messageId}`;
        } else {
            // 前两次调用即使超时，仍然继续等待。
            return await memoizeChat;
        }
    }
}

module.exports = bedrock;
