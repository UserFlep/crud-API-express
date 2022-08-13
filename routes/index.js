const userRouter = require("./user-routes");
const tagRouter = require("./tag-routes");
const userTagRouter = require("./user-tag-routes");

module.exports = [
    userRouter, 
    tagRouter,
    userTagRouter
]
