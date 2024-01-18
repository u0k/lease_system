const controllers = require('../controllers/user')
const router = require('express').Router()
const middleware = require('../middleware/auth')

router.get('/', middleware.checkAuthReal, middleware.verifyRoles("admin"), controllers.allUsers)


module.exports = router