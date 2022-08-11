const Router = require('express');
const router = new Router();
const {tagController} = require('../controllers/controllers');


router.post('/tag', authMiddleware, tagController.createTag);
router.get('/tag', authMiddleware, tagController.getTagsByUser);
router.get('/tags', authMiddleware, tagController.getAllTags);
router.get('/tag/:id', authMiddleware, tagController.getOneTag);
router.put('/tag', authMiddleware, tagController.updateTag);
router.delete('/tag/:id', authMiddleware, tagController.deleteTag);


module.exports = router;