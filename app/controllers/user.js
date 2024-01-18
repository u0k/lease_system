const { getUsers } = require('../services/user')

module.exports = {
    allUsers: async (req, res) => { 
        try {
            const users = await getUsers()
            if (users) {
                res.status(200).json(users)
            }
            else {
                res.status(404).send("Couldn't get users")
            }
        }
        catch(error) {
            res.status(500).send("Internal server error")
        }
    },
}