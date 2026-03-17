const router = require('express').Router();
const { getUsers, createUser, updateUser } = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.get('/', authorize('ADMIN', 'SUPERVISOR'), getUsers);
router.post('/', authorize('ADMIN'), createUser);
router.put('/:id', authorize('ADMIN'), updateUser);

module.exports = router;