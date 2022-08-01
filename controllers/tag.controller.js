const db = require("../db");
class TagController {

    async createTag(req, res){
        const {creator, name} = req.body;
        const newTag = await db.query(
            'INSERT INTO tags (creator, name) VALUES ($1,$2) RETURNING *'
            , [creator, name]
        );
        res.json(newTag.rows[0]);
    }

    async getTagsByUser(req, res){
        const id = req.query.id;
        const tags = await db.query(
            'SELECT * FROM tags WHERE creator = $1'
            , [id]
        );
        res.json(tags.rows);
    }

    async getAllTags(req, res){
        const tags = await db.query(
            'SELECT * FROM tags'
        );
        res.json(tags.rows);
    }

    async getOneTag(req, res){
        const id = req.params.id;
        const tag = await db.query(
            'SELECT * FROM tags WHERE id=$1'
            , [id]
        );
        res.json(tag.rows[0]);
    }

    async updateTag(req, res){
        const {id, creator, name, sortOrder} = req.body;
        const updatedTag = await db.query(
            'UPDATE tags set creator=$1, name=$2, "sortOrder"=$3 WHERE id=$4 RETURNING *'
            , [creator, name, sortOrder, id]
        );
        res.json(updatedTag.rows[0]);
    }

    async deleteTag(req, res){
        const id = req.params.id;
        const tag = await db.query(
            'DELETE FROM tags WHERE id=$1'
            , [id]
        );
        res.json(`Deleted ${tag.rowCount} row(-s)`);
    }
}

module.exports = new TagController();