const request = require('supertest');
const app = require('../app');
const should = require('chai').should();
const sinon = require('sinon');
const axios = require("axios");

describe('app', () => {
    describe('get /message', () => {
        it('should return 200', async () => {
            // arrange
            const query = {
                echostr: 'hello'
            }

            // act
            const response = await request(app.callback())
                .get('/message')
                .query(query);

            // assert
            response.status.should.equal(200);
            response.text.should.equal('hello');
        })
    })

    const sandbox = sinon.createSandbox();

    describe('post /message', () => {
        beforeEach(() => {
            sandbox.stub(axios, 'get').resolves({data: {}});
        })

        afterEach(() => {
            sandbox.restore();
        })

        it('should return 200', async () => {
            // arrange
            const postBody = `<xml>
    <ToUserName><![CDATA[gh_e94fc16b2540]]></ToUserName>
    <FromUserName><![CDATA[oPi_EsysIr4dq7JusuD1eMxKyjXs]]></FromUserName>
    <CreateTime>1705318577</CreateTime>
    <MsgType><![CDATA[voice]]></MsgType>
    <MediaId><![CDATA[FMz40fSm_ebK-6WMbFRlop6LLp52OOZLkALsezacWBTX1zcx4ZIRI-sGgqxi6-9p]]></MediaId>
    <Format><![CDATA[amr]]></Format>
    <MsgId>7324287517476257792</MsgId>
    <Recognition><![CDATA[]]></Recognition>
    <Encrypt><![CDATA[kE/F/9ryDKlwqJxvpSeGuJ8yNaUMGuxBs/ZemD8uOqYFXpB6TxfG0+5xY0KZv4rUArBXtsg7fxaFhSXKlYFuny5x3GLET8z1UxDnn6SMapV1H8okW9CfBsgROxYIy80Ym4IkATyP1yGlUOR9ZiLZoNQJ0AO/EmxVhYLjsl7tGRotmtHcAbtGoiULRRymfj03moPInO6YjKLpWH7zQODq0RTTkTA/Jc61J2XJ4uG5A1OyFBY30bNSoJwVp01ChtJV7XZKS7UPUrxGwuthfvH6aVzjWGzsTVGc6Lx7Qn9F1UgjshVzdU8652B5A90NlCAC9otmIseTpLo2v6R2sbJsu3GKheuoxTkPIx0ZiQJ8FjM3O7ovBZzddPEXSd+fuIlvor1cUNh6fAYus/BZiGq7nKRSik124JyTsDmDQZH8LmjxNpMPxS9BGM2GQQugogI/607zDsPWBDT8C9pGJq7FodHmFtDIQ/d04dNqp98w+KV4qL7OBILX+KTfrog4qjcM2z8CCUID4ATwO+KJ8hpVLYkAUYdxRy3h9l4ggoq0jsz5Gc3XB/0qiDdxNQki9vCJpmf4+/X2USlr4Xe1QyHE/xaBB95aHaIM302hv8Z+uicLy3b20gwWL/HR1oJ4GcSR]]></Encrypt>
</xml>`;

            // act
            const response = await request(app.callback())
                .post('/message')
                .set('Content-Type', 'text/xml')
                .send(postBody);

            // assert
            response.status.should.equal(200);
            response.text.should.equal(`<xml>
    <ToUserName><![CDATA[oPi_EsysIr4dq7JusuD1eMxKyjXs]]></ToUserName>
    <FromUserName><![CDATA[gh_e94fc16b2540]]></FromUserName>
    <CreateTime>Tuesday, March 26, 2024</CreateTime>
    <MsgType><![CDATA[text]]></MsgType>
    <Content><![CDATA[抱歉，我没听清楚你说什么。 附语音消息媒体id，可以调用获取临时素材接口拉取该媒体：FMz40fSm_ebK-6WMbFRlop6LLp52OOZLkALsezacWBTX1zcx4ZIRI-sGgqxi6-9p
 media = {}]]></Content>
</xml>`);
        })
    })
})
