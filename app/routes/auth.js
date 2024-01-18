const controllers = require('../controllers/auth')
const middleware = require('../middleware/auth')
const router = require('express').Router()

router.post('/register', controllers.register)
router.post('/login', controllers.login)
router.get('/logout', controllers.logout)
router.get('/refresh', controllers.refresh)

module.exports = router