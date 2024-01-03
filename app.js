const Koa = require('koa');
const app = new Koa();
const router = require('@koa/router')();
const convert = require('xml-js');

const {koaBody} = require('koa-body');
const {getFromUserName, getToUserName, getContent} = require("./helpers/wechat");
const {chat} = require("./ai/bedrock");

app.use(koaBody({includeUnparsed: true}));

router.get('/message', async (ctx, next) => {
    console.log('received message: ', ctx.query);
    ctx.body = ctx.query.echostr;
});

router.post('/message', async (ctx) => {
    const xmlString = ctx.request.body;
    console.log('xml = ', xmlString);
    const json = convert.xml2js(xmlString);
    console.log('received message: ', json);

    const content = getContent(json);
    console.log("content = ", content);

    let rtnMsg = '';
    if (content.toUpperCase().indexOf('LEGO') >= 0 || content.indexOf('乐高') >= 0 || content.toUpperCase().indexOf('DIGITAL') >= 0 || content.indexOf('数字化') >= 0 || content.toUpperCase().indexOf('JUDY') >= 0) {
        rtnMsg = 'You want to know more about the LEGO Group and the Digitization Journey? Please check our Best Leader Ever, Judy\'s video here:  https://d2a25ztk1zitcr.cloudfront.net/%E4%B9%90%E9%AB%98%E9%87%87%E8%AE%BF.m4v '
    } else {
        rtnMsg = await chat({
            question: content
        });
    }

    rtnMsg = rtnMsg.trim()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

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
    <Content><![CDATA[${rtnMsg.substring(0, 80)}]]></Content>
</xml>`

    ctx.set('Content-Type', 'text/plain');
    ctx.body = xml;
})


app.use(router.routes());

app.listen(8080);
