const Router = require('express');
const router = new Router();
const {userController} = require('../controllers/user-controller');
const authMiddleware = require('../middleware/authMiddleware');


router.get('/user', authMiddleware, userController.getOneUser);
router.put('/user', authMiddleware, userController.updateUser);
router.delete('/user', authMiddleware, userController.deleteUser);


module.exports = router;