const db = require("../db");
const bcrypt = require("bcryptjs");
const tokenService = require("../services/token-service");
const UserDto = require("../dtos/user-dto");

class UserService {

    async #getTokensFromTokenService(userModel){
        const userDto = new UserDto(userModel); //uid, email, nickname
        const tokens = tokenService.generateToken({...userDto});
        
        await tokenService.saveToken(userDto.uid, tokens.refreshToken);

        return tokens;
    }

    async registration(email, nickname, password){
        const candidate = await db.query('SELECT * FROM users WHERE nickname=$1 or email=$2',[nickname,email]);
        if(candidate.rowCount) {
            throw ApiError.BadRequest("Пользователь с таким никнеймом или адресом почты уже существует");
        }
        const hashPasword = await bcrypt.hash(password,3);
        const user = await db.query('INSERT INTO users (email, password, nickname) VALUES ($1,$2,$3) RETURNING *', [email, hashPasword, nickname]);

        const tokens = await this.#getTokensFromTokenService(user.rows[0]);

        return tokens;
    }

    async login(email, password){
        const user = await db.query('SELECT * FROM users WHERE email=$1', [email]);
        if(!user.rowCount){
            throw ApiError.BadRequest("Пользователь с таким email не найден");
        }

        const isPassEquals = await bcrypt.compare(password, user.rows[0].password);
        if(!isPassEquals){
            throw ApiError.BadRequest("Неверный пароль");
        }

        const tokens = await this.#getTokensFromTokenService(user.rows[0]);

        return tokens;
    }

    async logout (refreshToken) {
        const removedCount = await tokenService.removeToken(refreshToken);
        return removedCount;
    }

    async refresh (refreshToken) {
        const tokenPayload = tokenService.validateRefreshToken(refreshToken);
        const tokenInDb = await tokenService.findToken(refreshToken);
        if(!tokenPayload || !tokenInDb){
            throw ApiError.UnauthorizedError();
        }

        const user = await db.query('SELECT * FROM users WHERE uid=$1', [tokenPayload.uid]);
        const tokens = await this.#getTokensFromTokenService(user.rows[0]);

        return tokens;
    }

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