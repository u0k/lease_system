const controllers = require('../controllers/review')
const middleware = require('../middleware/auth')
const router = require('express').Router({mergeParams: true})

router.get('/', controllers.allReviews); 
router.get('/:reviewId', controllers.getReview); 
router.post('/', middleware.checkAuthReal, middleware.verifyRoles("admin", "user"), controllers.createReview); 
router.patch('/:reviewId', middleware.checkAuthReal, middleware.verifyRoles("admin", "user"), controllers.updateReview); 
router.delete('/:reviewId', middleware.checkAuthReal, middleware.verifyRoles("admin", "user"), controllers.deleteReview); 

module.exports = router