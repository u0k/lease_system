const controllers = require('../controllers/lease')
const router = require('express').Router()
const middleware = require('../middleware/auth')

router.get('/', controllers.allLeases)
router.get('/:id', controllers.getLease)
router.post('/', middleware.checkAuthReal, middleware.verifyRoles("user"), controllers.createLease)
router.patch('/:id', middleware.checkAuthReal, middleware.verifyRoles("admin", "user"), controllers.updateLease)
router.delete('/:id', middleware.checkAuthReal, middleware.verifyRoles("admin", "user"), controllers.deleteLease)
router.get('/:id/reviews', middleware.checkAuthReal, middleware.verifyRoles("admin"), controllers.getAllReviews)


router.use('/:id/object', require('./object'))

module.exports = router