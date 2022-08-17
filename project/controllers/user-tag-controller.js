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

    async deleteUserTag(req, res, next){
        try {
            const tagId = req.params.id;
            const accessToken = req.headers.authorization.split(' ')[1];
            const userTags = await userTagService.deleteUserTag(tagId, accessToken);
            res.status(200).json(userTags);
        } catch (error) {
            next(error)
        }
    }


    async getAllUserTags(req, res, next){
        try{
            const accessToken = req.headers.authorization.split(' ')[1];
            const userTags = await userTagService.getAllUserTags(accessToken);
            res.status(200).json(userTags);
        } catch (error) {
            next(error)
        }
    }
}
    

module.exports = new TagController();