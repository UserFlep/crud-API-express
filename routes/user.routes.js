const Router = require('express');
const router = new Router();
const {userController} = require('../controllers/controllers');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/users', authMiddleware, userController.getAllUsers);
router.get('/user/:id', authMiddleware, userController.getOneUser);
router.put('/user', authMiddleware, userController.updateUser);
router.delete('/user/:id', authMiddleware, userController.deleteUser);


module.exports = router;