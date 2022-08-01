const Router = require('express');
const router = new Router();
const {tagController} = require('../controllers/controllers');


router.post('/tag', tagController.createTag);
router.get('/tag', tagController.getTagsByUser);
router.get('/tags', tagController.getAllTags);
router.get('/tag/:id', tagController.getOneTag);
router.put('/tag', tagController.updateTag);
router.delete('/tag/:id', tagController.deleteTag);


module.exports = router;