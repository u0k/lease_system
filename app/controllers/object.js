const { getObjects, getObject, createObject, updateObject, deleteObject } = require('../services/object')

module.exports = {
    allObjects: async (req, res) => { 
        const leaseId = req.params.id
        try {
            const objects = await getObjects(leaseId)
            if (objects) {
                res.status(200).json(objects)
            }
            else {
                res.status(404).send("No objects found for this lease")
            }
        }
        catch(error) {
            res.status(500).send("Internal server error")
        }
    },
    getObject: async (req, res) => { 
        try {
            const leaseId = req.params.id
            const objId = req.params.objectId
            const object = await getObject(leaseId, objId)
            if (object) {
                res.status(200).json(object)
            }
            else {
                res.status(404).send("Resource not found")
            }
        }
        catch(error) {
            res.status(500).send("Internal server error")
        }
    },
    createObject: async (req, res) => { 
        try {
            const leaseid = req.params.id
            const {name, type, durability, objectDescription} = req.body
            const didCreateObject = await createObject(name, type, durability, objectDescription, leaseid)

            if (didCreateObject[0]) {
                if (didCreateObject[0].acknowledged === true) {
                    res.status(201).json(didCreateObject[1])
                }
                else {
                    res.status(404).send("Could not create object")
                }
            }
            else {
                res.status(didCreateObject.status).send(didCreateObject.message)

            }
        }
        catch(error) {

            res.status(500).send("Internal server error")
        }
    },
    updateObject: async (req, res) => { 
        try {
            const {name, type, durability, objectDescription} = req.body
            const leaseid = req.params.id
            const objectid = req.params.objectId
            const didUpdateObject = await updateObject(name, type, durability, objectDescription, leaseid, objectid)
            if (!didUpdateObject[0]) {
                res.status(didUpdateObject.status).send(didUpdateObject.message)
            }
            else {
                res.status(200).json(didUpdateObject[1])
            }
        }
        catch(error) {
            res.status(500).send("Internal server error")
        }
    },
    deleteObject: async (req, res) => { 
        try {
            const leaseid = req.params.id
            const objectid = req.params.objectId
            const object = await deleteObject(leaseid, objectid)
            if (!object.objectDeleted) {
                res.status(object.status).send(object.message)
            }
            else {
                res.status(200).json(object.objectDeleted)
            }
        }
        catch(error) {
            res.status(500).send("Internal server error")
        }
    },
}