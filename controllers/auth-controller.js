require('dotenv').config();
const db = require("../db");
const bcrypt = require("bcryptjs");
const {validationResult} = require("express-validator");
const jwt = require("jsonwebtoken");

const generateAccessToken = (id, nickname)=>{
    const expire = 1800; //30 мин
    const payload = {
        id,
        nickname
    }
    
    //console.log("process.env.SECRET======",process.env.SECRET);
    return {
        token: jwt.sign(payload, process.env.SECRET, {expiresIn: expire}),
        expire
    };
}

class AuthController {
    async registration (req, res) {
        try {
            const errors = validationResult(req);
            if(!errors.isEmpty()){
                return res.status(400).json({message: "Validation error", ...errors});
            }

            const {email, password, nickname} = req.body;
            
            const identicalNicknames = await db.query('SELECT * FROM users WHERE nickname=$1 or email=$2',[nickname,email]);
            if(identicalNicknames.rowCount){
                return res.status(400).json({message: "Nickname or email is exists"});
            }
            const hashPasword = bcrypt.hashSync(password,5);
            const user = await db.query(
                'INSERT INTO users (email, password, nickname) VALUES ($1,$2,$3) RETURNING uid, nickname'
                , [email, hashPasword, nickname]
            );

            const {token, expire} = generateAccessToken(user.rows[0].uid, user.rows[0].nickname);
            return res.status(200).json({token, expire});

        } catch (error) {
            console.log(error);
            return res.status(400).json({message: "Registration error"});
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
            console.log(error);
            res.status(400).json({message: "Log in error"});
        }
    }

    async logout (req, res){
        if (req.session) {
            req.session.destroy(err => {
              if (err) {
                return res.status(400).json({message: "Log out error"})
              } else {
                return res.status(200).json({message: "Logout successful"});
              }
            });
        } else {
            res.end()
        }
    }

    async refresh (req, res) {
        try {
        } catch (error) {
            console.log(error);
            res.status(400).json({message: "Log in error"});
        }
    }
}

module.exports = new AuthController();