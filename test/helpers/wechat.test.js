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
    })
})



