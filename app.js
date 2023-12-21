const Koa = require('koa');
const app = new Koa();
const router = require('@koa/router')();
const convert = require('xml-js');

const {koaBody} = require('koa-body');

app.use(koaBody({includeUnparsed: true}));

router.get('/message', async (ctx, next) => {
    console.log('received message: ', ctx.query);
    ctx.body = ctx.query.echostr;
});

router.post('/message', async (ctx) => {
    const xml = ctx.request.body;
    console.log('xml = ', xml);
    const json = convert.xml2js(xml);
    console.log('received message: ', json);
    ctx.body = 'ok';
})


app.use(router.routes());

app.listen(3000);
