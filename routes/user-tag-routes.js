const Router = require('express');
const router = new Router();
const {check, body, param} = require('express-validator');
const userTagController = require('../controllers/user-tag-controller');
const authMiddleware = require('../middleware/auth-middleware');

userTagsBodyValidator = [
    body("tags")
    .exists().withMessage('Параметром ожидается массив tags')
    .isArray().withMessage('Значением поля tags должен быть массив')
    .custom((value) => {
        if (!value.every(Number.isInteger)) throw new Error('Массив должен содержать только числовые значения');
        if (value.length == 0) throw new Error('Массив не может быть пустым'); 
        if (value[0] === value[1]) throw new Error('Элементы массива не должны повторяться'); 
        return true;
    })
]
userTagsParamsValidator = [
    param("id", "Некорректно поле id. Значением должно быть число").isNumeric()
]

router.post('/user/tag', [...userTagsBodyValidator, authMiddleware], userTagController.createUserTags);
router.delete('/user/tag/:id', [authMiddleware, ...userTagsParamsValidator], userTagController.deleteUserTag);
router.get('/user/tag/my', authMiddleware, userTagController.getUserTags);


module.exports = router;