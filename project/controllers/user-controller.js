const db = require("../db");
const userService = require("../services/user-service");
const ApiError = require("../exceptions/api-error");
const {validationResult} = require("express-validator");

class UserController {

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
            const deletedCount = await userService.logout(refreshToken);
            res.clearCookie('refreshToken');
            return res.status(200).json({deletedCount});
        } catch (error) {
            //console.log(error);
            next(error)
        }
    }

    async refresh (req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            if(!refreshToken){
                return next(ApiError.UnauthorizedError());
            }
            const tokens = await userService.refresh(refreshToken);
            res.cookie('refreshToken', tokens.refreshToken, {maxAge: tokens.refreshExpires, httpOnly: true});
            return res.status(200).json({...tokens});
        } catch (error) {
            //console.log(error);
            next(error)
        }
    }

    async getOneUser(req, res, next){
        try {
            const accessToken = req.headers.authorization.split(' ')[1];
            const userData = await userService.getOneUser(accessToken);
            res.status(200).json({...userData});
        } catch (error) {
            next(error);
        }
    }

    async updateUser(req, res, next){
        try {
            const errors = validationResult(req);
            if(!errors.isEmpty()){
                return next(ApiError.BadRequest("Ошибка при валидации", errors.array()));
            }

            const newUserData = req.body;
            const accessToken = req.headers.authorization.split(' ')[1];
            const updatedUserData = await userService.updateUser(accessToken, newUserData);
            res.status(200).json({...updatedUserData});
        } catch (error) {
            next(error);
        }
    }
    
    async deleteUser(req, res, next){
        try {
            const {refreshToken} = req.cookies;
            await userService.logout(refreshToken);
            
            const accessToken = req.headers.authorization.split(' ')[1];
            const deletedCount = await userService.deleteUser(accessToken);
            res.status(200).json({deletedCount});

        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController();