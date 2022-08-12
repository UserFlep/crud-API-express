const db = require("../db");
const bcrypt = require("bcryptjs");
const tokenService = require("./token-service");
const UserDto = require("../dtos/user-dto");
const ApiError = require("../exceptions/api-error");

class UserService {
    async registration(email, nickname, password){
        const candidate = await db.query('SELECT * FROM users WHERE nickname=$1 or email=$2',[nickname,email]);
        if(candidate.rowCount) {
            throw ApiError.BadRequest("Пользователь с таким никнеймом или адресом почты уже существует");
        }
        const hashPasword = await bcrypt.hash(password,3);
        const user = await db.query('INSERT INTO users (email, password, nickname) VALUES ($1,$2,$3) RETURNING *', [email, hashPasword, nickname]);

        const userDto = new UserDto(user.rows[0]); //uid, email, nickname
        const tokens = tokenService.generateToken({...userDto});
        
        await tokenService.saveToken(userDto.uid, tokens.refreshToken);

        return tokens;
    }

    async login(email, password){
        const user = await db.query('SELECT * FROM users WHERE email=$1', [email]);
        if(!user.rowCount){
            throw ApiError.BadRequest("Пользователь с таким email не найден");
        }
        const isPassEquals = bcrypt.compareSync(password, user.rows[0].password);
        if(!isPassEquals){
            throw ApiError.BadRequest("Неверный пароль");
        }

        const userDto = new UserDto(user.rows[0]); //uid, email, nickname
        const tokens = tokenService.generateToken({...userDto});
        
        await tokenService.saveToken(userDto.uid, tokens.refreshToken);

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
        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await tokenService.findToken(refreshToken);
        if(!userData || !tokenFromDb){
            throw ApiError.UnauthorizedError();
        }

        const user = await db.query('SELECT * FROM users WHERE uid=$1', [userData.uid]);
        const userDto = new UserDto(user.rows[0]); //uid, email, nickname
        const tokens = tokenService.generateToken({...userDto});
        
        await tokenService.saveToken(userDto.uid, tokens.refreshToken);

        return tokens;
    }

}

module.exports = new UserService();