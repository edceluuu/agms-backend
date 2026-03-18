const router = require('express').Router()
const { getGrids, createGrid } = require('../controllers/gridController')
const { authenticate, authorize } = require('../middleware/auth')

router.use(authenticate)
router.get('/', getGrids)
router.post('/', authorize('ADMIN'), createGrid)

module.exports = router