const Router = require('express');
const router = new Router();
const tagController = require('../controllers/tag-controller');
const authMiddleware = require('../middleware/auth-middleware');

router.post('/tag', authMiddleware, tagController.createTag);
router.get('/tag/:id', authMiddleware, tagController.getOneTag);
router.get('/tag');
router.put('/tag/:id', authMiddleware, tagController.updateTag);
router.delete('/tag/:id', authMiddleware, tagController.deleteTag);


module.exports = router;