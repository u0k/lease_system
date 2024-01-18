const { getReviews, getReview, createReview, updateReview, deleteReview } = require('../services/review')

module.exports = {
    allReviews: async (req, res) => { 
        const leaseId = req.params.id
        const objectId = req.params.objectId
        try {
            const reviews = await getReviews(leaseId, objectId)
            if (reviews && reviews.status && reviews.message) {
                res.status(reviews.status).send(reviews.message)
            }
            else {
                res.status(200).json(reviews)
            }
        }
        catch(error) {
            res.status(500).send("Internal server error")
        }
    },
    getReview: async (req, res) => { 
        try {
            const leaseId = req.params.id
            const objId = req.params.objectId
            const reviewid = req.params.reviewId

            const review = await getReview(leaseId, objId, reviewid)
            if (review && review.status && review.message) {
                res.status(reviews.status).send(review.message)
            }
            else {
                res.status(200).json(review)
            }
        }
        catch(error) {
            console.error(error)
            res.status(500).send("Internal server error")
        }
    },
    createReview: async (req, res) => { 
        try {
            const leaseid = req.params.id
            const objectid = req.params.objectId

            const {author, description, rating} = req.body
            const didCreateReview = await createReview(author, description, rating, leaseid, objectid)
            if (didCreateReview[0]) {
                if (didCreateReview[0].acknowledged === true) {
                    res.status(201).json(didCreateReview[1])
                }
            }
            else {
                res.status(didCreateReview.status).send(didCreateReview.message)
            }
        }
        catch(error) {
            res.status(500).send("Internal server error")
        }
    },
    updateReview: async (req, res) => { 
        try {
            const {description, rating} = req.body
            const leaseId = req.params.id
            const objId = req.params.objectId
            const reviewid = req.params.reviewId

            const didUpdateReview = await updateReview(description, rating, leaseId, objId, reviewid)
            if (!didUpdateReview[0]) {
                res.status(didUpdateReview.status).send(didUpdateReview.message)
            }
            else {
                res.status(200).json(didUpdateReview[1])
            }
        }
        catch(error) {
            res.status(500).send("Internal server error")
        }
    },
    deleteReview: async (req, res) => { 
        try {
            const leaseId = req.params.id
            const objId = req.params.objectId
            const reviewid = req.params.reviewId

            const review = await deleteReview(leaseId, objId, reviewid)
            if (!review.reviewDeleted) {
                res.status(review.status).send(review.message)
            }
            else {
                res.status(200).json(review.reviewDeleted)
            }
        }
        catch(error) {
            res.status(500).send("Internal server error")
        }
    },
}