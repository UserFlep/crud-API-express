require('dotenv').config();
const {validationResult} = require("express-validator");
const userService = require("../serices/user-service");
const ApiError = require("../exceptions/api-error");

class AuthController {
    async registration (req, res, next) {
        try {
            const errors = validationResult(req);
            if(!errors.isEmpty()){
                return next(ApiError.BadRequest("Ошибка при валидации", errors.array()));
            }

            const {email, nickname, password} = req.body;
            
            const tokens = await userService.registration(email, nickname, password);
            res.cookie('refreshToken', tokens.refreshToken, {maxAge: tokens.refreshExpires, httpOnly: true});

            return res.status(200).json({...tokens});

        } catch (error) {
            //console.log(error);
            next(error)
        }
    }

    async login (req, res, next) {
        try {
            const {email, password} = req.body;
            const tokens = await userService.login(email, password);
            res.cookie('refreshToken', tokens.refreshToken, {maxAge: tokens.refreshExpires, httpOnly: true});
            return res.status(200).json({...tokens});
        } catch (error) {
            //console.log(error);
            next(error)
        }
    }

    async logout (req, res, next){
        try {
            const {refreshToken} = req.cookies;
            const removedCount = await userService.logout(refreshToken);
            res.clearCookie('refreshToken');
            return res.status(200).json({removedCount});
        } catch (error) {
            //console.log(error);
            next(error)
        }
    }

    async refresh (req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const tokens = await userService.refresh(refreshToken);
            res.cookie('refreshToken', tokens.refreshToken, {maxAge: tokens.refreshExpires, httpOnly: true});
            return res.status(200).json({...tokens});
        } catch (error) {
            //console.log(error);
            next(error)
        }
    }
}

module.exports = new AuthController();