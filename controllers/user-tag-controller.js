const db = require("../db");
const userTagService = require("../services/user-tag-service");
const ApiError = require("../exceptions/api-error");
const {validationResult} = require("express-validator");

class TagController {

    async createUserTags(req, res, next){
        try {
            const errors = validationResult(req);
            if(!errors.isEmpty()){
                return next(ApiError.BadRequest("Ошибка при валидации", errors.array()));
            }

            const tagData = req.body;
            console.log("tagData", tagData.tags)
            const accessToken = req.headers.authorization.split(' ')[1];

            const createdUserTags = await userTagService.createUserTags(accessToken, tagData);
            res.status(200).json(createdUserTags);
        } catch (error) {
            next(error)
        }
        
    }


    async getUserTags(req, res, next){
        try{
            const {sortByOrder, sortByName, offset, length} = req.query;
            const filters = {};
            if(sortByOrder !== undefined){
                filters.sortByOrder = true;
            }
            if(sortByName !== undefined){
                filters.sortByName = true;
            }
            if(offset && !isNaN(offset)){
                filters.offset = offset;
            }
            if(length && !isNaN(length)){
                filters.limit = length;
            }

            const data = await tagService.getAllTags(filters);
            res.status(200).json({...data});
        } catch (error) {
            next(error)
        }
    }

    async deleteUserTag(req, res, next){
        try {
            const tagId = req.params.id;
            const deletedCount = await tagService.deleteTag(tagId);
            res.status(200).json({deletedCount});
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new TagController();