const db = require("../db");
class UserController {

    async getAllUsers(req, res){
        try {
            const users = await db.query(
                'SELECT * FROM users'
            );
            res.status(200).json(users.rows);
        } catch (error) {
            console.log(error)
            res.status(400).json({message: "Get all users error"});
        }
    }

    async getOneUser(req, res){
        try {
            const id = req.params.id;
            const user = await db.query(
                'SELECT * FROM users WHERE uid=$1'
                , [id]
            );
            res.status(200).json(user.rows[0]);
        } catch (error) {
            console.log(error)
            res.status(400).json({message: "Get one user error"});
        }
    }

    async updateUser(req, res){
        try {
            const {uid, email, password, nickname} = req.body;
            const user = await db.query(
                'UPDATE users set email=$1, password=$2, nickname=$3 WHERE uid=$4 RETURNING *'
                , [email, password, nickname, uid]
            );
            res.status(200).json(user.rows[0]);
        } catch (error) {
            console.log(error)
            res.status(400).json({message: "Update user error"});
        }
    }
    
    async deleteUser(req, res){
        try {
            const id = req.params.id;
            const user = await db.query(
                'DELETE FROM users WHERE uid=$1'
                , [id]
            );
            res.status(200).json(`Deleted ${user.rowCount} row(-s)`);
        } catch (error) {
            console.log(error)
            res.status(400).json({message: "Delete user error"});
        }
    }
}

module.exports = new UserController();