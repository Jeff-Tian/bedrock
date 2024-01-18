const container = require('./container');

const {BedrockRuntimeClient} = require("@aws-sdk/client-bedrock-runtime");
container.set('BedrockRuntimeClient', new BedrockRuntimeClient({
    region: "us-east-1",
    "credentials": {
        "accessKeyId": process.env.AWSAccessKeyId,
        "secretAccessKey": process.env.AWSSecretAccessKey
    }
}));


const CyclicDb = require('@cyclic.sh/dynamodb');
const db = CyclicDb('outstanding-necklace-frogCyclicDB');
const chats = db.collection('chats');
container.set('chats', chats);
console.log('chats = ', container.get('chats'));

container.set('SessionDuration', 2500);
container.set('SessionCount', 3);

const Koa = require('koa');
const app = new Koa();
const router = require('@koa/router')();
const convert = require('xml-js');

const {koaBody} = require('koa-body');
const {getFromUserName, getToUserName, getContent, getMessageId} = require("./helpers/wechat");
const {chatWithRetry, recall} = require("./ai/bedrock");

app.use(koaBody({includeUnparsed: true}));

router.get('/message', async (ctx, next) => {
    console.log('received message: ', ctx.query);
    ctx.body = ctx.query.echostr;
});

router.post('/message', async (ctx) => {
    const xmlString = ctx.request.body;
    console.log('xml = ', xmlString);
    const json = convert.xml2js(xmlString);
    const content = getContent(json);

    const messageId = getMessageId(json);
    console.log("content = ", content, messageId);

    let rtnMsg = '';
    if (!content) {
        rtnMsg = '抱歉，我没听清楚你说什么。';
    } else if (content.toUpperCase().indexOf('LEGO') >= 0 || content.indexOf('乐高') >= 0 || content.toUpperCase().indexOf('DIGITAL') >= 0 || content.indexOf('数字化') >= 0 || content.toUpperCase().indexOf('JUDY') >= 0) {
        rtnMsg = 'You want to know more about the LEGO Group and the Digitization Journey? Please check our Best Leader Ever, Judy\'s video here:  https://d2a25ztk1zitcr.cloudfront.net/%E4%B9%90%E9%AB%98%E9%87%87%E8%AE%BF.m4v '
    } else {
        try {
            rtnMsg = await chatWithRetry({
                question: content,
                messageId: messageId
            }, 'https://' + ctx.hostname);

            console.log('rtnMsg = ', rtnMsg);
        } catch (ex) {
            console.error('chat with retry error = ', ex);

            rtnMsg = `抱歉，服务出错了，原因是： ${ex.message}`;
        }
    }

    rtnMsg = rtnMsg.trim()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
    ;

    const toUserName = getFromUserName(json);
    const fromUserName = getToUserName(json);
    const createTime = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    console.log('starting reply: ' + rtnMsg + ' to ' + toUserName + ' from ' + fromUserName);
    const xml = `<xml>
    <ToUserName><![CDATA[${toUserName}]]></ToUserName>
    <FromUserName><![CDATA[${fromUserName}]]></FromUserName>
    <CreateTime>${createTime}</CreateTime>
    <MsgType><![CDATA[text]]></MsgType>
    <Content><![CDATA[${rtnMsg}]]></Content>
</xml>`

    ctx.set('Content-Type', 'text/plain');
    ctx.body = xml;
    console.log('ctx.body = ', ctx.body);
})

router.get('/recall', async (ctx) => {
    const messageId = ctx.query.messageId;
    console.log('messageId = ', messageId);
    try {
        const value = await recall(messageId);
        console.log('recall = ', value);
        ctx.body = value;
    } catch (ex) {
        console.error('recall error = ', ex);
        ctx.body = {
            error: ex.message
        };
    }
})


app.use(router.routes());


app.listen(8080);
