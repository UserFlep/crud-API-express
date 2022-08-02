const userRouter = require("./user.routes");
const tagRouter = require("./tag.routes");
const authRouter = require("./auth.routes");

module.exports = {
    authRouter,
    apiRouter : [userRouter, tagRouter]
}