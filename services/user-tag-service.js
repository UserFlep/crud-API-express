const db = require("../db");
const ApiError = require("../exceptions/api-error");
const tokenService = require("../services/token-service");

class UserTagService {
    async createUserTags(accessToken, tagData){
        const {tags} = tagData;
        const {uid} = tokenService.validateAccessToken(accessToken);

        const equalRows = await db.query(`SELECT * FROM user_tags WHERE user_id=$1 AND tag_id in (${tags.join()}) LIMIT 1`
        ,[uid]);
        if(equalRows.rowCount) {
            throw ApiError.BadRequest("Один из добавляемых тегов уже имеется у пользователя");
        }

        const values = tags.map(tagId=>`('${uid}', ${tagId})`);
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

        const allUserTags = await db.query(query,[uid]);
        return {
            tags: allUserTags.rows
        };
    }

    async getAllTags(filters={}){
        const defaultLimit = 10;
        const defaultOffset = 0;

        const LIMIT = filters.limit ? parseInt(filters.limit, 10) : defaultLimit;
        const OFFSET = filters.offset ? parseInt(filters.offset, 10) : defaultOffset;
        let ORDER_BY="";

        if(filters.sortByOrder || filters.sortByName){
            const both = filters.sortByOrder && filters.sortByName;

            ORDER_BY=`ORDER BY ${filters.sortByOrder ? '"sortOrder"':""}${both ? ", ":""}${filters.sortByName ? "name":""}`
        }

        const tags = await db.query(`SELECT creator, name, "sortOrder" FROM tags ${ORDER_BY} LIMIT $1 OFFSET $2`,[LIMIT, OFFSET]);

        for(let i in tags.rows){
            const creator = await db.query(`SELECT nickname, uid FROM users WHERE uid=$1`,[tags.rows[i].creator]);
            tags.rows[i].creator = creator.rows[0];
        }
        
        const countData = await db.query(`SELECT COUNT(*)::int FROM tags`);
        const QUANTITY = countData.rows[0].count;

        return {
            data: tags.rows,
            meta: {
                offset: OFFSET,
                length: LIMIT,
                quantity: QUANTITY
            }
        }
    }

    async deleteTag(tagId){
        const queryData = await db.query("DELETE from tags WHERE id=$1",[tagId]);
        return queryData.rowCount;
    }

}

module.exports = new UserTagService();