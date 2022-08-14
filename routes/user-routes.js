const Router = require('express');
const router = new Router();
const {check, body} = require('express-validator');
const userController = require('../controllers/user-controller');
const authMiddleware = require('../middleware/auth-middleware');

const userValidator = [
    body("email", "Некорректный почтовый адрес").isEmail().isLength({max:100}),
    body("nickname", "Некорректное имя пользователя").isLength({min: 3, max:100}),
    body("password", "Некорректный пароль. Пароль должен содержать 8-100 символов, включая одну цифру, одну заглавную и одну строчную буквы").isStrongPassword({minSymbols: 0}).isLength({max:100}),
]

router.post('/signin',  userValidator,                      userController.registration);
router.post('/login',                                       userController.login);
router.post('/logout',  authMiddleware,                     userController.logout);
router.get('/refresh',                                      userController.refresh);
router.get('/user',     authMiddleware,                     userController.getOneUser);
router.put('/user',     [authMiddleware, ...userValidator], userController.updateUser);
router.delete('/user',  authMiddleware,                     userController.deleteUser);


module.exports = router;