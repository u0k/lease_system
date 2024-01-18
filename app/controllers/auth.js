const { registerUser, loginUser, refreshToken, logoutUser } = require('../services/auth')

module.exports = {
    register: async (req, res) => {
        try {
            console.log("req body", req.body)
            const username = req.body.username
            const password = req.body.password
            const didRegister = await registerUser([username, password])
            console.log("did register?", didRegister)
            res.status(didRegister.code).json(didRegister)
            
        }
        catch (error) {
            res.status(didRegister.code).send(error)
        }
    },
    login: async (req, res) => {
        try {
            console.log("req body", req.body)
            const username = req.body.username
            const password = req.body.password
            const cookies = req.cookies
            console.log("here")
            const didLogin = await loginUser([username, password], cookies)
            if (cookies.refreshToken) {
                res.clearCookie('refreshToken', { httpOnly: true, maxAge: 86400000 })
            }
            console.log("here2", didLogin)
            if (didLogin.success === true) {
                res.cookie('refreshToken', didLogin.refreshToken, { httpOnly: true, maxAge: 86400000, secure: true })
                //res.cookie('accessToken', didLogin.accessToken, { httpOnly: true, maxAge: 360000 })
                res.status(didLogin.code).json({accessToken: didLogin.accessToken, message: didLogin.message })
            }
            else {
                res.status(didLogin.code).json(didLogin)
            }
            
        }
        catch (error) {
            res.status(500).send(error)
        }
    },
    logout: async (req, res) => {
        try {
            const cookies = req.cookies
            if (!cookies.refreshToken) return res.status(204).json("Logged out")
            const refreshToken = cookies.refreshToken
            const didLogout = await logoutUser(refreshToken)
            console.log("didlogout", didLogout)
            if (didLogout.success === true) {
                res.clearCookie('refreshToken', { httpOnly: true, maxAge: 86400000, path: '/', domain: 'localhost' })
                res.status(didLogout.code).json("Logged out")
            }
            else {
                res.clearCookie('refreshToken', { httpOnly: true, maxAge: 86400000, path: '/', domain: 'localhost' })
                res.status(didLogout.code).json("Logged out")
            }
            
        }
        catch (error) {
            console.log(error)
            res.status(500).send(error)
        }
    },
    refresh: async (req, res) => {
        try {
            const cookies = req.cookies
            if (!cookies.refreshToken) return res.status(401).json("Unauthorized")
            const reToken = cookies.refreshToken
            res.clearCookie('refreshToken', { httpOnly: true })
            const didRefresh = await refreshToken(reToken)
            console.log(didRefresh)
            if (didRefresh.success === true) {
                res.cookie('refreshToken', didRefresh.refreshToken, { httpOnly: true, maxAge: 86400000, secure: true })
                //res.cookie('accessToken', didRefresh.accessToken, { httpOnly: true, maxAge: 360000 })
                res.status(didRefresh.code).json({ accessToken: didRefresh.accessToken, sucess: didRefresh.success })
            }
            else {
                res.status(didRefresh.code).json(didRefresh.message)
            }
            
        }
        catch (error) {
            console.log(error)
            res.status(500).send(error)
        }
    },

}