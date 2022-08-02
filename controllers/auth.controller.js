require('dotenv').config();
const db = require("../db");
const bcrypt = require("bcryptjs");
const {validationResult} = require("express-validator");
const jwt = require("jsonwebtoken");

const generateAccessToken = (id, nickname)=>{
    const payload = {
        id,
        nickname
    }
    console.log("process.env.SECRET======",process.env.SECRET);
    return jwt.sign(payload, process.env.SECRET, {expiresIn: "30m"});
}

class AuthController {
    async registration (req, res) {
        try {
            const errors = validationResult(req);
            if(!errors.isEmpty()){
                return res.status(400).json({message: "Validation error", ...errors});
            }
            const {email, password, nickname} = req.body;
            const identicalNicknames = await db.query('SELECT * FROM users WHERE nickname=$1',[nickname]);
            if(identicalNicknames.rowCount){
                return res.status(400).json({message: "Nickname is exists"});
            }
            const hashPasword = bcrypt.hashSync(password,5);
            await db.query(
                'INSERT INTO users (email, password, nickname) VALUES ($1,$2,$3) RETURNING *'
                , [email, hashPasword, nickname]
            );

            return res.status(200).json({message: "Registration successful"});

        } catch (error) {
            console.log(error);
            return res.status(400).json({message: "Registration error"});
        }
    }

    async login (req, res) {
        try {
            const {password, nickname} = req.body;
            const user = await db.query('SELECT * FROM users WHERE nickname=$1', [nickname]);
            if(!user.rowCount){
                return res.status(400).json({message: "Nickname is not exists"});
            }
            const validPassword = bcrypt.compareSync(password, user.rows[0].password);
            if(!validPassword){
                return res.status(400).json({message: "Invalid password"});
            }
            const token = generateAccessToken(user.rows[0].uid, user.rows[0].nickname);

            return res.status(200).json({token});
        } catch (error) {
            console.log(error);
            res.status(400).json({message: "Login error"});
        }
    }
}

module.exports = new AuthController();