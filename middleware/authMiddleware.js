require('dotenv').config();
const jwt = require("jsonwebtoken");
const ApiError = require("../exceptions/api-error");
const tokenService = require('../serices/token-service');

module.exports = function (req, res, next) {
    if(req.method === "OPTIONS") {
        next()
    }

    try {
        if(!req.headers.authorization){
            return next(ApiError.UnauthorizedError());
        }

        const accessToken = req.headers.authorization.split(' ')[1]
        if(!accessToken) {
            return next(ApiError.UnauthorizedError());
        }
        const userData = tokenService.validateAccessToken(accessToken);
        if(!userData){
            return next(ApiError.UnauthorizedError());
        }
        req.user = userData;
        next();
    } catch (error) {
        //console.log(error)
        return next(ApiError.UnauthorizedError());
    }
}