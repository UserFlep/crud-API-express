const db = require("../db");
const bcrypt = require("bcryptjs");
const tokenService = require("./token-service");
const UserDto = require("../dtos/user-dto");
const ApiError = require("../exceptions/api-error");

class AuthService {

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
        if(!refreshToken){
            throw ApiError.UnauthorizedError();
        }
        const tokenPayload = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await tokenService.findToken(refreshToken);
        if(!tokenPayload || !tokenFromDb){
            throw ApiError.UnauthorizedError();
        }

        const user = await db.query('SELECT * FROM users WHERE uid=$1', [tokenFromDb.user_id]);
        const tokens = await this.#getTokensFromTokenService(user.rows[0]);

        return tokens;
    }

}

module.exports = new AuthService();