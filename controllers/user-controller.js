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
            res.status(200).json(userData);
        } catch (error) {
            next(error);
        }
    }

    async updateUser(req, res, next){
        try {
            const {uid, email, password, nickname} = req.body;
            const user = await db.query(
                'UPDATE users set email=$1, password=$2, nickname=$3 WHERE uid=$4 RETURNING *'
                , [email, password, nickname, uid]
            );
            res.status(200).json(user.rows[0]);
        } catch (error) {
            next(error);
        }
    }
    
    async deleteUser(req, res, next){
        try {
            const id = req.params.id;
            const user = await db.query(
                'DELETE FROM users WHERE uid=$1'
                , [id]
            );
            res.status(200).json(`Deleted ${user.rowCount} row(-s)`);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController();