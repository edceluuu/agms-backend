const router = require('express').Router()
const { getPlants, getPlantByQR, createPlant } = require('../controllers/plantController')
const { authenticate, authorize } = require('../middleware/auth')

router.use(authenticate)
router.get('/', getPlants)
router.get('/qr/:code', getPlantByQR)
router.post('/', authorize('ADMIN'), createPlant)

module.exports = router