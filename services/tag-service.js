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
        //console.log(ORDER_BY);
        const tags = await db.query(`SELECT creator, name, "sortOrder" FROM tags ${ORDER_BY} LIMIT $1 OFFSET $2`,[LIMIT, OFFSET]);
        //console.log(tags);
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
        //return tags.rows;
    }


}

module.exports = new TagService();