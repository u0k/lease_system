const controllers = require('../controllers/object')
const router = require('express').Router({mergeParams: true})
const middleware = require('../middleware/auth')

router.get('/', controllers.allObjects); 
router.get('/:objectId', controllers.getObject); 
router.post('/', middleware.checkAuthReal, middleware.verifyRoles("admin", "user"), controllers.createObject); 
router.patch('/:objectId', middleware.checkAuthReal, middleware.verifyRoles("admin", "user"), controllers.updateObject); 
router.delete('/:objectId', middleware.checkAuthReal, middleware.verifyRoles("admin", "user"), controllers.deleteObject); 

router.use('/:objectId/review', require('./review'))

module.exports = router