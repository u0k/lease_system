const { getDB } = require("../utils/db_connection");
const { ObjectId } = require("mongodb");

module.exports = {
  getObjects: async (id) => {
    try {
      const db = getDB();

      const objects = db.collection("object");
      const objectsExists = await objects
        .find({ _leaseId: new ObjectId(id) })
        .toArray();
      if (objectsExists) {
        return objectsExists;
      } else {
        return null;
      }
    } catch (error) {
      console.error(error);
    }
  },
  getObject: async (leaseid, id) => {
    try {
      const db = getDB();

      const objects = db.collection("object");
      const leases = db.collection("lease");

      const objectId = new ObjectId(id);
      const leaseId = new ObjectId(leaseid);

      const existingLease = await leases.findOne({
        _id: new ObjectId(leaseid),
      });
      if (!existingLease) {
        return null;
      }

      const objectExists = await objects.findOne({
        _id: objectId,
        _leaseId: leaseId,
      });

      if (objectExists) {
        return objectExists;
      } else {
        return null;
      }
    } catch (error) {
      console.error(error);
    }
  },
  createObject: async (name, type, durability, objectDescription, leaseid) => {
    try {
      const db = getDB();
      const objects = db.collection("object");
      const leases = db.collection("lease");

      const existingObject = await objects.findOne({
        _leaseId: new ObjectId(leaseid),
      });

      if (existingObject) {
        return {
          status: 409,
          message: "Resource already exists",
        };
      }
      const existingLease = await leases.findOne({
        _id: new ObjectId(leaseid),
      });
      if (!existingLease) {
        return {
          status: 404,
          message: "Lease doesn't exist",
        };
      }

      const object = {
        name: name,
        type: type,
        durability: durability,
        objectDescription: objectDescription,
        _leaseId: new ObjectId(leaseid),
        _reviewIds: [],
      };

      const didInsert = await objects.insertOne(object);

      const objectId = didInsert.insertedId;

      await leases.updateOne(
        { _id: new ObjectId(leaseid) },
        { $set: { _objectId: new ObjectId(objectId) } }
      );

      return [didInsert, object];
    } catch (error) {
      console.error(error);
    }
  },
  updateObject: async (
    name,
    type,
    durability,
    objectDescription,
    lid,
    objectid
  ) => {
    try {
      const db = getDB();

      const objects = db.collection("object");
      const leases = db.collection("lease");

      const existingLease = await leases.findOne({
        _id: new ObjectId(lid),
      });
      if (!existingLease) {
        return {
          status: 404,
          message: "Lease doesn't exist",
        };
      }

      const existingObject = await objects.findOne({
        _leaseId: new ObjectId(lid),
        _id: new ObjectId(objectid),
      });

      if (existingObject) {
        const updatedObject = {
          $set: {
            name: name,
            type: type,
            durability: durability,
            objectDescription: objectDescription,
          },
        };

        const didUpdate = await objects.updateOne(
          { _id: new ObjectId(objectid), _leaseId: new ObjectId(lid) },
          updatedObject
        );

        const updated = await objects.findOne({ _id: new ObjectId(objectid) });

        return [didUpdate, updated];
      } else {
        return {
          status: 404,
          message: "Object doesn't exist",
        };
      }
    } catch (error) {
      console.error("Error during update:", error);
    }
  },
  deleteObject: async (leaseid, objectid) => {
    try {
      const db = getDB();
      const objects = db.collection("object");
      const reviews = db.collection("review");
      const leases = db.collection("lease");

      const leaseCheck = await leases.findOne({ _id: new ObjectId(leaseid) });
      if (!leaseCheck) {
        return { status: 404, message: "This lease does not exist" };
      }
      const objectCheck = await objects.findOne({
        _id: new ObjectId(objectid),
        _leaseId: new ObjectId(leaseid),
      });
      if (!objectCheck) {
        return { status: 404, message: "This object does not exist" };
      }

      const objectDeleted = await objects.deleteOne({
        _id: new ObjectId(objectid),
        _leaseId: new ObjectId(leaseid),
      });

      if (objectDeleted.deletedCount === 1) {

        const reviewsDeleted = await reviews.deleteMany({
          _objectId: new ObjectId(objectid),
        });

        await leases.updateOne(
          { _id: new ObjectId(leaseid) },
          { $set: { _objectId: null } } 
        );

        return {
          objectDeleted: objectCheck,
          reviewsDeleted: reviewsDeleted,
        };
      }
    } catch (error) {
      console.error(error);
    }
  },
};
