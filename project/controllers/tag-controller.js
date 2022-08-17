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
            
            const tagId = req.params.id;
            const tag = await tagService.getOneTag(tagId);
            res.status(200).json({...tag});
        } catch (error) {
            next(error)
        }
    }

    async getAllTags(req, res, next){
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

    async updateTag(req, res, next){
        try {
            const errors = validationResult(req);
            if(!errors.isEmpty()){
                return next(ApiError.BadRequest("Ошибка при валидации", errors.array()));
            }
            
            const tagId = req.params.id;
            const newTagData = req.body;
            const accessToken = req.headers.authorization.split(' ')[1];
            const updatedTagData = await tagService.updateTag(accessToken, tagId, newTagData);
            res.status(200).json({...updatedTagData});
        } catch (error) {
            next(error)
        }
    }

    async deleteTag(req, res, next){
        try {
            const tagId = req.params.id;
            const accessToken = req.headers.authorization.split(' ')[1];
            const deletedCount = await tagService.deleteTag(accessToken, tagId);
            res.status(200).json({deletedCount});
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new TagController();