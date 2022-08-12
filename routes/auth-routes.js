const Router = require('express');
const router = new Router();
const {check} = require('express-validator');
const authController = require('../controllers/auth-controller');
//const authMiddleware = require('../middleware/authMiddleware');

router.post(
    '/signin',
    [
        check("email", "Некорректный почтовый адрес").isEmail(),
        check("nickname", "Имя пользователя не может быть пустым").notEmpty(),
        check("password", "Пароль должен содержать как минимум 8 символов, включая одну цифру, одну заглавную и одну строчную буквы").isStrongPassword({minSymbols: 0}),
    ],
    authController.registration
);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/refresh', authController.refresh);


module.exports = router;