require('dotenv').config();
const jwt = require('jsonwebtoken');
const db = require("../db");

class TokenService {
    generateToken(payload){
        const accessExpires = 30 * 60; //30 мин
        const refreshExpires = 2 * 24 * 60 * 60; //2 дня
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: accessExpires});
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: refreshExpires});
        return {
            accessToken,
            accessExpires,
            refreshToken,
            refreshExpires
        }
    }

    validateAccessToken(token){
        try {
            const tokenPayload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            return tokenPayload;
        } catch (error) {
            return null;
        }
    }

    validateRefreshToken(token){
        try {
            const tokenPayload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
            return tokenPayload;
        } catch (error) {
            return null;
        }
    }

    async saveToken(userId, refreshToken){
        const tokenData = await db.query("SELECT * FROM tokens WHERE user_id=$1",[userId]);
        if(tokenData.rowCount){
            const queryData = await db.query("UPDATE tokens SET token=$1 WHERE user_id=$2 RETURNING token",[refreshToken, userId]);
            return queryData.rows[0].token;
        }
        const queryData = await db.query("INSERT INTO tokens (user_id, token) values ($1, $2) RETURNING token", [userId, refreshToken]);

        return queryData.rows[0].token;
    }

    async removeToken(refreshToken){
        const queryData = await db.query("DELETE from tokens WHERE token=$1",[refreshToken]);
        return queryData.rowCount;
    }

    async findToken(refreshToken){
        const queryData = await db.query("SELECT * from tokens WHERE token=$1",[refreshToken]);
        return queryData.rows[0];
    }

}

module.exports = new TokenService();