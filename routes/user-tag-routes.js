const Router = require('express');
const router = new Router();uire('../middleware/authMiddleware');

router.post('user/tag');
router.delete('user/tag/:id');
router.get('user/tag/my');


module.exports = router;