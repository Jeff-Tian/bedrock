const Koa = require('koa');
const app = new Koa();
const router = require('@koa/router')();

const {koaBody} = require('koa-body');

router.get('/message', async (ctx, next) => {
    console.log('received message: ', ctx.query);
    ctx.body = ctx.query.echostr;
});

router.post('/message', koaBody(), async (ctx) => {
    console.log('received message: ', ctx.request.body);
    ctx.body = 'ok';
})


app.use(router.routes());

app.listen(3000);
