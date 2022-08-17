const db = require("../db");
const ApiError = require("../exceptions/api-error");
const tokenService = require("../services/token-service");

class TagService {
    async createTag(accessToken, tagData){
        const {name, sortOrder} = tagData;
        const equalTag = await db.query('SELECT * FROM tags WHERE name=$1',[name]);
        if(equalTag.rowCount) {
            throw ApiError.BadRequest("Тег с таким названием уже существует");
        }
        const tokenPayload = tokenService.validateAccessToken(accessToken);
        const tag = await db.query('INSERT INTO tags (creator, name, "sortOrder") VALUES ($1,$2,$3) RETURNING id, name, "sortOrder"'
        , [tokenPayload.uid, name, sortOrder]);

        return tag.rows[0];
    }

    async getOneTag(tagId){
        const tag = await db.query('SELECT creator, name, "sortOrder" FROM tags WHERE id=$1',[tagId])
        if(!tag.rowCount) {
            throw ApiError.BadRequest("Не существует тега с таким id");
        }
        const creator = await db.query("SELECT uid, nickname FROM users WHERE uid=$1",[tag.rows[0].creator])
        tag.rows[0].creator = creator.rows[0];
        return tag.rows[0];
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

    async updateTag (accessToken,tagId, tagData) {
        const {name, sortOrder} = tagData;
        const tokenPayload = tokenService.validateAccessToken(accessToken);

        const updatingTag = await db.query('SELECT * FROM tags WHERE id=$1',[tagId])
        //Тег существует
        if(!updatingTag.rowCount){
            throw ApiError.BadRequest("Такого тега не существует");
        }
        //Тег можно изменить
        if(updatingTag.rows[0].creator !== tokenPayload.uid){
            throw ApiError.BadRequest("Только создатель тега может изменять его");
        }

        const equalTag = await db.query('SELECT * FROM tags WHERE name=$1',[name]);
        //Новое имя уникально
        if(equalTag.rowCount) {
            throw ApiError.BadRequest("Тег с таким названием уже существует");
        }

        //Обновление тега
        const updatedTag = await db.query(
            'UPDATE tags set name=$1, "sortOrder"=$2 WHERE id=$3 RETURNING creator, name, "sortOrder"'
            , [name, sortOrder, tagId]
        );

        const creator = await db.query("SELECT nickname, uid FROM users WHERE uid=$1 LIMIT 1",[updatedTag.rows[0].creator])
        updatedTag.rows[0].creator = creator.rows[0];

        return updatedTag.rows[0];
    }

    async deleteTag(accessToken, tagId){
        const tokenPayload = tokenService.validateAccessToken(accessToken);
        
        const deletingTag = await db.query('SELECT * FROM tags WHERE id=$1 LIMIT 1',[tagId])
        //Тег существует
        if(!deletingTag.rowCount){
            throw ApiError.BadRequest("Такого тега не существует");
        }
        //Тег можно удалить
        if(deletingTag.rows[0].creator !== tokenPayload.uid){
            throw ApiError.BadRequest("Только создатель тега может удалить его");
        }
        //Удаление тега
        const queryData = await db.query("DELETE from tags WHERE id=$1",[tagId]);
        return queryData.rowCount;
    }

}

module.exports = new TagService();