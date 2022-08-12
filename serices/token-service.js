require('dotenv').config();
const jwt = require('jsonwebtoken');
const db = require("../db");

class TokenService {
    generateToken(payload){
        const accessExpires = 30 * 60; //30 мин
        const refreshExpires = 30 * 24 * 60 * 60; //30 дней
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: accessExpires});
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: refreshExpires});
        return {
            accessToken,
            accessExpires,
            refreshToken,
            refreshExpires
        }
    }

    async saveToken(userId, refreshToken){
        const tokenData = await db.query("SELECT * FROM tokens WHERE user_id=$1",[userId]);
        if(tokenData.rowCount){
            const queryData = await db.query("UPDATE tokens SET token=$1 WHERE user_id=$2 RETURNING token",[refreshToken, userId]);
            return queryData.rows[0].token;
        }
        const queryData = await db.query("INSERT INTO tokens (user_id, token) values ($1, $2) RETURNING token", [userId, refreshToken]);
        console.log(queryData);
        return queryData.rows[0].token;
    }

}

module.exports = new TokenService();