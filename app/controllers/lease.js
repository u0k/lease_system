const { getLeases, getLease, createLease, updateLease, deleteLease, getAllReviews } = require('../services/lease')

module.exports = {
    allLeases: async (req, res) => { 
        try {
            const leases = await getLeases()
            if (leases) {
                res.status(200).json(leases)
            }
            else {
                res.status(404).send("Couldn't get leases")
            }
        }
        catch(error) {
            res.status(500).send("Internal server error")
        }
    },
    getLease: async (req, res) => { 
        try {
            const id = req.params.id
            const lease = await getLease(id)
            if (lease) {
                res.status(200).json(lease)
            }
            else {
                res.status(404).send("Resource not found")
            }
        }
        catch(error) {
            res.status(500).send("Internal server error")
        }
    },
    createLease: async (req, res) => { 
        try {
            const lessorId = 123
            const {name, duration, startDate, endDate, price} = req.body
            const didCreateLease = await createLease(name, duration, startDate, endDate,  price, lessorId)

            if (didCreateLease[0].acknowledged === true) {
                res.status(201).json(didCreateLease[1])
            }
            else {
                res.status(404).send("Could not create lease")
            }
        }
        catch(error) {
            res.status(500).send("Internal server error")
        }
    },
    updateLease: async (req, res) => { 
        try {
            const {name, duration, startDate, endDate, price} = req.body
            const id = req.params.id
            const didUpdateLease = await updateLease(name, duration, startDate, endDate,  price, id)
            if (didUpdateLease[0].acknowledged === true && didUpdateLease[0].modifiedCount === 1) {
                res.status(200).json(didUpdateLease[1])
            }
            else {
                res.status(404).send("Could not update lease")
            }
        }
        catch(error) {
            res.status(500).send("Internal server error")
        }
    },
    deleteLease: async (req, res) => { 
        try {
            const id = req.params.id
            const lease = await deleteLease(id)
            if (!lease.leaseDeleted) {
                res.status(lease.status).send(lease.message)
            }
            else {
                res.status(200).json(lease.leaseDeleted)
            }
        }
        catch(error) {
            res.status(500).send("Internal server error")
        }
    },
    getAllReviews: async (req, res) => {
        try {
            const reviews = await getAllReviews(req.params.id)
            if (reviews) {
                res.status(200).json(reviews)
            }
            else {
                res.status(404).send("Couldn't get reviews")
            }
        }
        catch(error) {
            res.status(500).send("Internal server error")
        }

    }
}