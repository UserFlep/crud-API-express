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

    async getAllTags(length, offset, sortByOrder, sortByName){
        let ORDER_BY="";
        const LIMIT = length === undefined ? "" :"LIMIT "+length;
        const OFFSET = offset === undefined ? "" :"OFFSET "+offset;
        //console.log(length && "ALL", offset && "0"); 'это успех
        const sortFields = [];
        if(sortByOrder!==undefined){
            sortFields.push('"sortOrder"');
        }
        if(sortByName!==undefined){
            sortFields.push("name");
        }
        if(sortFields.length>0){
            ORDER_BY = "ORDER BY " + sortFields.join(', ');
        }
        //const tags = await db.query(`SELECT * FROM tags LIMIT $1 OFFSET $2`);
        const tags = await db.query(`SELECT * FROM tags ${ORDER_BY} ${LIMIT} ${OFFSET}`);
        return tags.rows;
    }


}

module.exports = new TagService();