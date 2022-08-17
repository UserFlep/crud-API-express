const db = require("../db");
const ApiError = require("../exceptions/api-error");
const tokenService = require("../services/token-service");

class UserTagService {
    async createUserTags(accessToken, tagData){
        const {tags} = tagData;
        const tokenPayload = tokenService.validateAccessToken(accessToken);

        const equalRows = await db.query(`SELECT * FROM user_tags WHERE user_id=$1 AND tag_id in (${tags.join()}) LIMIT 1`
        ,[tokenPayload.uid]);
        if(equalRows.rowCount) {
            throw ApiError.BadRequest("Один из добавляемых тегов уже имеется у пользователя");
        }

        const values = tags.map(tagId=>`('${tokenPayload.uid}', ${tagId})`);
        const createdUserTags = await db.query(`INSERT INTO user_tags (user_id, tag_id) VALUES ${values.join()} RETURNING *`);
        
        const query = `
            WITH user_tags_data AS(
                SELECT * FROM user_tags WHERE user_id=$1
            ), tag_data AS(
                SELECT * FROM user_tags_data 
                JOIN tags ON tag_id=id
            )
            SELECT id, name, "sortOrder" FROM tag_data
        `;

        const allUserTags = await db.query(query,[tokenPayload.uid]);
        return {
            tags: allUserTags.rows
        };
    }

    async deleteUserTag(tagId, accessToken){
        const tokenPayload = tokenService.validateAccessToken(accessToken);
        const queryData = await db.query("DELETE from user_tags WHERE tag_id=$1",[tagId]);
        if(!queryData.rowCount){
            throw ApiError.BadRequest("У пользователя нет такого тега");
        }
        const query = `
            WITH user_tags_data AS(
                SELECT * FROM user_tags WHERE user_id=$1
            ), tag_data AS(
                SELECT * FROM user_tags_data 
                JOIN tags ON tag_id=id
            )
            SELECT id, name, "sortOrder" FROM tag_data
        `;

        const allUserTags = await db.query(query,[tokenPayload.uid]);
        return {
            tags: allUserTags.rows
        };
    }


    async getAllUserTags(accessToken){
        const tokenPayload = tokenService.validateAccessToken(accessToken);
        const query = `
            WITH user_tags_data AS(
                SELECT * FROM user_tags WHERE user_id=$1
            ), tag_data AS(
                SELECT * FROM user_tags_data 
                JOIN tags ON tag_id=id
            )
            SELECT id, name, "sortOrder" FROM tag_data
        `;

        const allUserTags = await db.query(query,[tokenPayload.uid]);
        return {
            tags: allUserTags.rows
        };
    }

   

}

module.exports = new UserTagService();