const Router = require('express');
const router = new Router();
const userController = require('../controllers/user-controller');
const authMiddleware = require('../middleware/auth-middleware');


router.get('/user', authMiddleware, userController.getOneUser);
router.put('/user', authMiddleware);
router.delete('/user', authMiddleware);


module.exports = router;