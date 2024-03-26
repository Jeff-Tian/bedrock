const container = require('../../container');
const assert = require('assert');
const sleep = require("../../util").sleep;

container.set('BedrockRuntimeClient', {
    send: async () => {
        return {
            body: new Uint8Array([123, 34, 115, 116, 111, 112, 95, 114, 101, 97, 115, 111, 110, 34, 58, 32, 34, 115, 116, 111, 112, 95, 115, 101, 113, 117, 101, 110, 99, 101, 34, 44, 32, 34, 99, 111, 109, 112, 108, 101, 116, 105, 111, 110, 34, 58, 32, 34, 34, 44, 32, 34, 109, 111, 100, 101, 108, 95, 105, 100, 34, 58, 32, 34, 109, 111, 100, 101, 108, 95, 100, 101, 102, 97, 117, 108, 116, 34, 44, 32, 34, 109, 97, 120, 95, 116, 111, 107, 101, 110, 115, 95, 116, 111, 95, 115, 97, 109, 112, 108, 101, 34, 58, 32, 49, 44, 32, 34, 116, 101, 109, 112, 101, 114, 97, 116, 117, 114, 101, 34, 58, 32, 49, 46, 48, 44, 32, 34, 116, 111, 112, 95, 107, 34, 58, 32, 49, 48, 44, 32, 34, 116, 111, 112, 95, 112, 34, 58, 32, 48, 46, 49, 44, 32, 34, 115, 116, 111, 112, 95, 114, 101, 97, 115, 111, 110, 34, 58, 32, 34, 115, 116, 111, 112, 95, 115, 101, 113, 117, 101, 110, 99, 101, 34, 125])
        }
    }
});
const cache = {};
container.set('chats', {
    get: async (key) => {
        return cache[key]
    },
    set: async (key, value) => {
        cache[key] = value;
        return value;
    },
    delete: async (key) => {
        delete cache[key];
    }
});
container.set('SessionDuration', 50);
container.set('SessionCount', 3);

const bedrock = require("../../ai/bedrock")();

describe('bedrock chat', () => {
    describe('chat', () => {
        it('should return a string', async () => {
            const rtn = await bedrock.chat({question: '嗨'});

            assert.equal(typeof rtn, 'string');
        })
    })

    describe('memoizeChat', () => {
        it('should return a string if bedrock responded before session duration timeout', async () => {
            const chats = container.get('chats');
            const rtn = await bedrock.memoizeChat({question: '嗨', messageId: 'test'});

            assert.equal(typeof rtn, 'string');
            const value = await chats.get('test');
            assert.ok(value !== undefined);
            assert.equal(value.answer, '');
            assert.equal(value.called, 1);
        })

        it('should just wait until bedrock responded', async () => {
            container.set('BedrockRuntimeClient', {
                send: async () => {
                    await sleep(container.get('SessionDuration') * 2);

                    return {
                        body: new Uint8Array([123, 34, 115, 116, 111, 112, 95, 114, 101, 97, 115, 111, 110, 34, 58, 32, 34, 115, 116, 111, 112, 95, 115, 101, 113, 117, 101, 110, 99, 101, 34, 44, 32, 34, 99, 111, 109, 112, 108, 101, 116, 105, 111, 110, 34, 58, 32, 34, 34, 44, 32, 34, 109, 111, 100, 101, 108, 95, 105, 100, 34, 58, 32, 34, 109, 111, 100, 101, 108, 95, 100, 101, 102, 97, 117, 108, 116, 34, 44, 32, 34, 109, 97, 120, 95, 116, 111, 107, 101, 110, 115, 95, 116, 111, 95, 115, 97, 109, 112, 108, 101, 34, 58, 32, 49, 44, 32, 34, 116, 101, 109, 112, 101, 114, 97, 116, 117, 114, 101, 34, 58, 32, 49, 46, 48, 44, 32, 34, 116, 111, 112, 95, 107, 34, 58, 32, 49, 48, 44, 32, 34, 116, 111, 112, 95, 112, 34, 58, 32, 48, 46, 49, 44, 32, 34, 115, 116, 111, 112, 95, 114, 101, 97, 115, 111, 110, 34, 58, 32, 34, 115, 116, 111, 112, 95, 115, 101, 113, 117, 101, 110, 99, 101, 34, 125])
                    }
                }
            });

            const chats = container.get('chats');
            const rtn = await bedrock.memoizeChat({question: '嗨', messageId: 'testagain'});

            assert.equal(typeof rtn, 'string');
            const value = await chats.get('testagain');
            assert.ok(value !== undefined);
            assert.equal(value.answer, '');
            assert.equal(value.called, 1);
        });

        it('should not call bedrock again if cache exists', async () => {
            const chats = container.get('chats');
            chats.set('test', {
                called: 2,
                answer: 'hi'
            });

            const rtn = await bedrock.memoizeChat({question: '嗨', messageId: 'test'});
            assert.equal(rtn, 'hi');
            const value = await chats.get('test');
            assert.ok(value !== undefined);
            assert.equal(value.answer, 'hi');
            assert.equal(value.called, 3);
        })
    })

    describe('chatWithRetry', () => {
        it('should return a fallback string if timeout in 3 times', async () => {
            container.set('BedrockRuntimeClient', {
                send: async () => {
                    await sleep(container.get('SessionDuration') * 5);

                    return {
                        body: new Uint8Array([123, 34, 115, 116, 111, 112, 95, 114, 101, 97, 115, 111, 110, 34, 58, 32, 34, 115, 116, 111, 112, 95, 115, 101, 113, 117, 101, 110, 99, 101, 34, 44, 32, 34, 99, 111, 109, 112, 108, 101, 116, 105, 111, 110, 34, 58, 32, 34, 34, 44, 32, 34, 109, 111, 100, 101, 108, 95, 105, 100, 34, 58, 32, 34, 109, 111, 100, 101, 108, 95, 100, 101, 102, 97, 117, 108, 116, 34, 44, 32, 34, 109, 97, 120, 95, 116, 111, 107, 101, 110, 115, 95, 116, 111, 95, 115, 97, 109, 112, 108, 101, 34, 58, 32, 49, 44, 32, 34, 116, 101, 109, 112, 101, 114, 97, 116, 117, 114, 101, 34, 58, 32, 49, 46, 48, 44, 32, 34, 116, 111, 112, 95, 107, 34, 58, 32, 49, 48, 44, 32, 34, 116, 111, 112, 95, 112, 34, 58, 32, 48, 46, 49, 44, 32, 34, 115, 116, 111, 112, 95, 114, 101, 97, 115, 111, 110, 34, 58, 32, 34, 115, 116, 111, 112, 95, 115, 101, 113, 117, 101, 110, 99, 101, 34, 125])
                    }
                }
            });

            const chats = container.get('chats');
            chats.set('1234', {
                props: {
                    called: 2,
                    answer: undefined
                }
            });

            const hostname = 'http://localhost:3000';
            const rtn = await bedrock.chatWithRetry({question: '嗨', messageId: '1234'}, hostname);

            assert.equal(rtn, `抱歉，我还没想好怎么回答。不过，稍后我可能会回复，你可以通过这个链接查看： ${hostname}/recall?messageId=${1234}`);
        })

        it('should just wait until bedrock responded if not called for 3 times', async () => {
            container.set('BedrockRuntimeClient', {
                send: async () => {
                    await sleep(container.get('SessionDuration') * 5);

                    return {
                        body: new Uint8Array([123, 34, 115, 116, 111, 112, 95, 114, 101, 97, 115, 111, 110, 34, 58, 32, 34, 115, 116, 111, 112, 95, 115, 101, 113, 117, 101, 110, 99, 101, 34, 44, 32, 34, 99, 111, 109, 112, 108, 101, 116, 105, 111, 110, 34, 58, 32, 34, 34, 44, 32, 34, 109, 111, 100, 101, 108, 95, 105, 100, 34, 58, 32, 34, 109, 111, 100, 101, 108, 95, 100, 101, 102, 97, 117, 108, 116, 34, 44, 32, 34, 109, 97, 120, 95, 116, 111, 107, 101, 110, 115, 95, 116, 111, 95, 115, 97, 109, 112, 108, 101, 34, 58, 32, 49, 44, 32, 34, 116, 101, 109, 112, 101, 114, 97, 116, 117, 114, 101, 34, 58, 32, 49, 46, 48, 44, 32, 34, 116, 111, 112, 95, 107, 34, 58, 32, 49, 48, 44, 32, 34, 116, 111, 112, 95, 112, 34, 58, 32, 48, 46, 49, 44, 32, 34, 115, 116, 111, 112, 95, 114, 101, 97, 115, 111, 110, 34, 58, 32, 34, 115, 116, 111, 112, 95, 115, 101, 113, 117, 101, 110, 99, 101, 34, 125])
                    }
                }
            });
            const chats = container.get('chats');
            chats.set('1234', {
                props: {
                    called: 1,
                    answer: undefined
                }
            });
            const hostname = 'http://localhost:3000';
            const rtn = await bedrock.chatWithRetry({question: '嗨', messageId: '1234'}, hostname);

            assert.equal(rtn, '');

            const value = await chats.get('1234');
            assert.ok(value !== undefined);
            assert.equal(value.answer, '');
            assert.equal(value.called, 2);
        });
    })
})
