const ServerlessHttp = require("serverless-http");
const app = require("./app");

module.exports.handler = ServerlessHttp(app);
