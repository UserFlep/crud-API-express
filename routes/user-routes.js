const Router = require('express');
const router = new Router();
const {userController} = require('../controllers/user-controller');
const authMiddleware = require('../middleware/authMiddleware');


router.get('/user', authMiddleware);
router.put('/user', authMiddleware);
router.delete('/user', authMiddleware);


module.exports = router;