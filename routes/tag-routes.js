const Router = require('express');
const router = new Router();
const {check, param, body} = require('express-validator');
const tagController = require('../controllers/tag-controller');
const authMiddleware = require('../middleware/auth-middleware');

const tagValidator = [
    body("name", "Некорректное поле name. Длина должна составлять 3-40 символов").isLength({min:3, max:40}),
    body("sortOrder", "Некорректное поле sortOrder. Значением должно быть число").isNumeric()
]

const tagIdValidator = [
    param("id", "Некорректное поле id. Значением должно быть число").isNumeric()
]

router.post('/tag', [authMiddleware, ...tagValidator], tagController.createTag);
router.get('/tag/:id', [authMiddleware, ...tagIdValidator], tagController.getOneTag);

router.get('/tag');
//router.put('/tag/:id', authMiddleware, tagController.updateTag);
//router.delete('/tag/:id', authMiddleware, tagController.deleteTag);


module.exports = router;