const db = require("../db");
const tagService = require("../services/tag-service");
const ApiError = require("../exceptions/api-error");
const {validationResult} = require("express-validator");

class TagController {

    async createTag(req, res, next){
        try {
            const errors = validationResult(req);
            if(!errors.isEmpty()){
                return next(ApiError.BadRequest("Ошибка при валидации", errors.array()));
            }

            const tagData = req.body;
            const accessToken = req.headers.authorization.split(' ')[1];
            const newTag = await tagService.createTag(accessToken, tagData);
            res.status(200).json({...newTag});
        } catch (error) {
            next(error)
        }
        
    }

    async getOneTag(req, res, next){
        try {
            const errors = validationResult(req);
            if(!errors.isEmpty()){
                return next(ApiError.BadRequest("Ошибка при валидации", errors.array()));
            }
            
            const id = req.params.id;
            const tag = await tagService.getOneTag(id);
            res.status(200).json({...tag});
        } catch (error) {
            next(error)
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