const Router = require('express');
const router = new Router();
const {check} = require('express-validator');
const authController = require('../controllers/auth-controller');
const authMiddleware = require('../middleware/authMiddleware');

router.post(
    '/signin',
    [
        check("nickname", "Username cannot be empty").notEmpty(),
        check("password", "Password must be more than 4 and less than 30 characters").isStrongPassword({minSymbols: 0}),
    ],
    authController.registration
);
router.post('/login', authController.login);
router.post('/logout', authMiddleware, authController.logout);
router.get('/refresh', authController.refresh);


module.exports = router;