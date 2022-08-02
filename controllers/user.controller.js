const db = require("../db");
class UserController {

    async getAllUsers(req, res){
        const users = await db.query(
            'SELECT * FROM users'
        );
        res.json(users.rows);
    }

    async getOneUser(req, res){
        const id = req.params.id;
        const user = await db.query(
            'SELECT * FROM users WHERE uid=$1'
            , [id]
        );
        res.json(user.rows[0]);
    }

    async updateUser(req, res){
        const {uid, email, password, nickname} = req.body;
        const user = await db.query(
            'UPDATE users set email=$1, password=$2, nickname=$3 WHERE uid=$4 RETURNING *'
            , [email, password, nickname, uid]
        );
        res.json(user.rows[0]);
    }
    
    async deleteUser(req, res){
        const id = req.params.id;
        const user = await db.query(
            'DELETE FROM users WHERE uid=$1'
            , [id]
        );
        res.json(`Deleted ${user.rowCount} row(-s)`);
    }
}

module.exports = new UserController();