require('dotenv').config();
const db = require("../db");
const tokenService = require("../services/token-service");

class UserService {
    async getOneUser(accessToken){
        const tokenPayload = tokenService.validateAccessToken(accessToken);

        const user = await db.query('SELECT email, nickname FROM users WHERE uid=$1', [tokenPayload.uid]);
        const query = `
            WITH user_tags_data AS(
                SELECT * FROM user_tags WHERE user_id=$1
            ), tag_data AS(
                SELECT * FROM user_tags_data 
                JOIN tags ON tag_id=id
            )
            SELECT id, name, sort_order FROM tag_data
        `;
        const tags = await db.query(query,[tokenPayload.uid])
        user.rows[0].tags = tags.rows
        return {...user.rows[0]}
    }
}

module.exports = new UserService();