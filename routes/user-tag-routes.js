const Router = require('express');
const router = new Router();

router.post('user/tag');
router.delete('user/tag/:id');
router.get('user/tag/my');


module.exports = router;