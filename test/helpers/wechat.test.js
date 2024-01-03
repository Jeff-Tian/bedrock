const assert = require('assert')
const {getFromUserName, getMessageId, getRecognition, getMessageType, getContent} = require("../../helpers/wechat");
const convert = require('xml-js');

describe('wechat messages', () => {

    describe('normal text message', () => {
        const xml = {
            "elements": [
                {
                    "type": "element",
                    "name": "xml",
                    "elements": [
                        {
                            "type": "element",
                            "name": "ToUserName",
                            "elements": [
                                {
                                    "type": "cdata",
                                    "cdata": "gh_e94fc16b2540"
                                }
                            ]
                        },
                        {
                            "type": "element",
                            "name": "FromUserName",
                            "elements": [
                                {
                                    "type": "cdata",
                                    "cdata": "oPi_EsysIr4dq7JusuD1eMxKyjXs"
                                }
                            ]
                        },
                        {
                            "type": "element",
                            "name": "CreateTime",
                            "elements": [
                                {
                                    "type": "text",
                                    "text": "1703053358"
                                }
                            ]
                        },
                        {
                            "type": "element",
                            "name": "MsgType",
                            "elements": [
                                {
                                    "type": "cdata",
                                    "cdata": "text"
                                }
                            ]
                        },
                        {
                            "type": "element",
                            "name": "Content",
                            "elements": [
                                {
                                    "type": "cdata",
                                    "cdata": "嗨"
                                }
                            ]
                        },
                        {
                            "type": "element",
                            "name": "MsgId",
                            "elements": [
                                {
                                    "type": "text",
                                    "text": "24381861692105745"
                                }
                            ]
                        },
                        {
                            "type": "element",
                            "name": "Encrypt",
                            "elements": [
                                {
                                    "type": "cdata",
                                    "cdata": "IMDbtEKhWUc2DVd+zm5Y2kDijYC1GtXWkQeoz1/kb1G5CbLSXIMbfgcXMTq88NFhyZtWpY1WdkCcVBIpDMdAwJKzPPnroCHPEcUhCHUmBq0KFZ/C36GO6rdrQYxApZ/QbieTR0eKj94d+y70GqtO/wfRTQdi7TpxtTiJ7sIs1k6t/5aqQm+DGNAC31sSoiPYayrvP+9fy+2iw9zTZ7ngDQK+CzVLKjrCSRq0LFef9TNdoJaGiOdLbGny0Ubsb0pBTeK4A+LgSkvBmyYXp78wNBlMqrMLar73+JnbRJJ9YBEbetMevKhMWd2DbbHNUhQYl4RmZER0P5w/fGajN6FjISxXGOhsXJbkcSxW/V1AfmbaohhRWmWs7kjCp2Yz0bTq/BHerCprtUc1ZGeGKIrpaWuHuY0WoXqtWnRbnqvnuaA="
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        it('gets from user name', () => {
            assert.equal(getFromUserName(xml), 'oPi_EsysIr4dq7JusuD1eMxKyjXs')
        })

        it('gets message id', () => {
            assert.equal(getMessageId(xml), '24381861692105745')
        })
    });

    describe('audio message', () => {
        const xml = `<xml>
  <ToUserName><![CDATA[toUser]]></ToUserName>
  <FromUserName><![CDATA[fromUser]]></FromUserName>
  <CreateTime>1357290913</CreateTime>
  <MsgType><![CDATA[voice]]></MsgType>
  <MediaId><![CDATA[media_id]]></MediaId>
  <Format><![CDATA[Format]]></Format>
  <Recognition><![CDATA[腾讯微信团队]]></Recognition>
  <MsgId>1234567890123456</MsgId>
  <MsgDataId>xxxx</MsgDataId>
  <Idx>xxxx</Idx>
</xml>
`
        const json = convert.xml2js(xml);

        it('gets recognition', () => {
            assert.equal(getRecognition(json), '腾讯微信团队')
        })

        it('gets message type', () => {
            assert.equal(getMessageType(json), 'voice')
        })

        it('gets content', () => {
            assert.equal(getContent(json), '腾讯微信团队')
        })

        it('gets content for empty recognition xml', () => {
            const xml = `<xml>
    <ToUserName><![CDATA[gh_e94fc16b2540]]></ToUserName>
    <FromUserName><![CDATA[oPi_EsysIr4dq7JusuD1eMxKyjXs]]></FromUserName>
    <CreateTime>1705318577</CreateTime>
    <MsgType><![CDATA[voice]]></MsgType>
    <MediaId><![CDATA[FMz40fSm_ebK-6WMbFRlop6LLp52OOZLkALsezacWBTX1zcx4ZIRI-sGgqxi6-9p]]></MediaId>
    <Format><![CDATA[amr]]></Format>
    <MsgId>7324287517476257792</MsgId>
    <Recognition><![CDATA[]]></Recognition>
    <Encrypt><![CDATA[kE/F/9ryDKlwqJxvpSeGuJ8yNaUMGuxBs/ZemD8uOqYFXpB6TxfG0+5xY0KZv4rUArBXtsg7fxaFhSXKlYFuny5x3GLET8z1UxDnn6SMapV1H8okW9CfBsgROxYIy80Ym4IkATyP1yGlUOR9ZiLZoNQJ0AO/EmxVhYLjsl7tGRotmtHcAbtGoiULRRymfj03moPInO6YjKLpWH7zQODq0RTTkTA/Jc61J2XJ4uG5A1OyFBY30bNSoJwVp01ChtJV7XZKS7UPUrxGwuthfvH6aVzjWGzsTVGc6Lx7Qn9F1UgjshVzdU8652B5A90NlCAC9otmIseTpLo2v6R2sbJsu3GKheuoxTkPIx0ZiQJ8FjM3O7ovBZzddPEXSd+fuIlvor1cUNh6fAYus/BZiGq7nKRSik124JyTsDmDQZH8LmjxNpMPxS9BGM2GQQugogI/607zDsPWBDT8C9pGJq7FodHmFtDIQ/d04dNqp98w+KV4qL7OBILX+KTfrog4qjcM2z8CCUID4ATwO+KJ8hpVLYkAUYdxRy3h9l4ggoq0jsz5Gc3XB/0qiDdxNQki9vCJpmf4+/X2USlr4Xe1QyHE/xaBB95aHaIM302hv8Z+uicLy3b20gwWL/HR1oJ4GcSR]]></Encrypt>
</xml>`
            const json = convert.xml2js(xml);
            assert.equal(getContent(json), '')
        })
    })
})



