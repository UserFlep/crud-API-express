const db = require("../db");
class TagController {

    async createTag(req, res){
        try {
            const {creator, name} = req.body;
            const newTag = await db.query(
                'INSERT INTO tags (creator, name) VALUES ($1,$2) RETURNING *'
                , [creator, name]
            );
            res.status(200).json(newTag.rows[0]);
        } catch (error) {
            console.log(error)
            res.status(400).json({message: "Tag create error"});
        }
        
    }

    async getTagsByUser(req, res){
        try {
            const id = req.query.id;
            const tags = await db.query(
                'SELECT * FROM tags WHERE creator = $1'
                , [id]
            );
            res.status(200).json(tags.rows);
        } catch (error) {
            console.log(error)
            res.status(400).json({message: "Get tags by user error"});
        }
    }

    async getOneTag(req, res){
        try {
            const id = req.params.id;
            const tag = await db.query(
                'SELECT * FROM tags WHERE id=$1'
                , [id]
            );
            res.status(200).json(tag.rows[0]);
        } catch (error) {
            console.log(error)
            res.status(400).json({message: "Get one tag error"});
        }
    }

    async updateTag(req, res){
        try {
            const {id, creator, name, sortOrder} = req.body;
            const updatedTag = await db.query(
                'UPDATE tags set creator=$1, name=$2, "sortOrder"=$3 WHERE id=$4 RETURNING *'
                , [creator, name, sortOrder, id]
            );
            res.status(200).json(updatedTag.rows[0]);
        } catch (error) {
            console.log(error)
            res.status(400).json({message: "Update tag error"});
        }
    }

    async deleteTag(req, res){
        try {
            const id = req.params.id;
            const tag = await db.query(
                'DELETE FROM tags WHERE id=$1'
                , [id]
            );
            res.status(200).json(`Deleted ${tag.rowCount} row(-s)`);
        } catch (error) {
            console.log(error)
            res.status(400).json({message: "Delete tag error"});
        }
    }
}

module.exports = new TagController();