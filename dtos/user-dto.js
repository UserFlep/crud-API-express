module.exports = class UserDto {
    uid;
    email;
    nickname;
    
    constructor(model){
        this.uid = model.uid;
        this.email = model.email;
        this.nickname = model.nickname;
    }
}

