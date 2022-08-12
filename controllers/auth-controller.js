require('dotenv').config();
const db = require("../db");
const bcrypt = require("bcryptjs");
const {validationResult} = require("express-validator");
const jwt = require("jsonwebtoken");
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

    async login (req, res) {
        try {
            const {password, email} = req.body;
            const user = await db.query('SELECT * FROM users WHERE email=$1', [email]);
            if(!user.rowCount){
                return res.status(400).json({message: "Email is not exists"});
            }
            const validPassword = bcrypt.compareSync(password, user.rows[0].password);
            if(!validPassword){
                return res.status(400).json({message: "Invalid password"});
            }
            const {token, expire} = generateAccessToken(user.rows[0].uid, user.rows[0].nickname);

            return res.status(200).json({token, expire});
        } catch (error) {
            //console.log(error);
            next(error)
        }
    }

    async logout (req, res){
        try {
        } catch (error) {
            //console.log(error);
            next(error)
        }
    }

    async refresh (req, res) {
        try {
        } catch (error) {
            //console.log(error);
            next(error)
        }
    }
}

module.exports = new AuthController();