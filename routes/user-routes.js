const Router = require('express');
const router = new Router();
const {check} = require('express-validator');
const userController = require('../controllers/user-controller');
const authMiddleware = require('../middleware/auth-middleware');


router.post(
    '/signin',
    [
        check("email", "Некорректный почтовый адрес").isEmail(),
        check("nickname", "Имя пользователя не может быть пустым").notEmpty(),
        check("password", "Пароль должен содержать как минимум 8 символов, включая одну цифру, одну заглавную и одну строчную буквы").isStrongPassword({minSymbols: 0}),
    ],
    userController.registration
);
router.post('/login', userController.login);
router.post('/logout', authMiddleware, userController.logout);
router.get('/refresh', userController.refresh);

router.get('/user', authMiddleware, userController.getOneUser);
router.put('/user', authMiddleware, userController.updateUser);
router.delete('/user', authMiddleware, userController.deleteUser);


module.exports = router;