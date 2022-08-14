const Router = require('express');
const router = new Router();
const {check, param, body} = require('express-validator');
const tagController = require('../controllers/tag-controller');
const authMiddleware = require('../middleware/auth-middleware');

const tagBodyValidator = [
    body("name", "Некорректное поле name. Длина должна составлять 3-40 символов").isLength({min:3, max:40}),
    body("sortOrder", "Некорректное поле sortOrder. Значением должно быть число").isNumeric()
]

const tagParamsValidator = [
    param("id", "Некорректное поле id. Значением должно быть число").isNumeric()
]

router.post('/tag',     [authMiddleware, ...tagBodyValidator],      tagController.createTag);
router.get('/tag/:id',  [authMiddleware, ...tagParamsValidator],    tagController.getOneTag);
router.get('/tag',      authMiddleware,                             tagController.getAllTags);
router.put('/tag/:id',  [authMiddleware, ...tagBodyValidator],      tagController.updateTag);
router.delete('/tag/:id', [authMiddleware, ...tagParamsValidator],  tagController.removeTag);


module.exports = router;