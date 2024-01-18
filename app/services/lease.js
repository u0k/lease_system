const { getDB } = require("../utils/db_connection");
const { ObjectId } = require("mongodb");

module.exports = {
  getLeases: async () => {
    try {
      const db = getDB();

      const leases = db.collection("lease");
      const leasesExists = await leases.find({}).toArray();

      if (leasesExists) {
        return leasesExists;
      } else {
        return null;
      }
    } catch (error) {
      console.error(error);
    }
  },
  getLease: async (id) => {
    try {
      const db = getDB();

      const leases = db.collection("lease");
      const leasesExists = await leases.findOne({ _id: new ObjectId(id) });

      if (leasesExists) {
        return leasesExists;
      } else {
        return null;
      }
    } catch (error) {
      console.error(error);
    }
  },
  createLease: async (name, duration, startDate, endDate, price, lessorId) => {
    try {
      const db = getDB();
      const lease = {
        name: name,
        duration: duration,
        startDate: startDate,
        endDate: endDate,
        _objectId: null,
        price: price,
        _lessorId: null,
      };
      const leases = db.collection("lease");
      const didInsert = await leases.insertOne(lease);
      return [didInsert, lease];
    } catch (error) {
      console.error(error);
    }
  },
  updateLease: async (name, duration, startDate, endDate, price, leaseId) => {
    try {
      const db = getDB();
      const updatedLease = {
        $set: {
          name: name,
          duration: duration,
          startDate: startDate,
          endDate: endDate,
          price: price,
        },
      };
      const leases = db.collection("lease");
      const didUpdate = await leases.updateOne(
        { _id: new ObjectId(leaseId) },
        updatedLease
      );
      const updated = await leases.findOne({ _id: new ObjectId(leaseId) });
      return [didUpdate, updated];
    } catch (error) {
      console.error(error);
    }
  },
  deleteLease: async (id) => {
    try {
      const db = getDB();
      const objects = db.collection("object");
      const reviews = db.collection("review");
      const leases = db.collection("lease");
      const leaseDeleted = await leases.findOne({ _id: new ObjectId(id) });
      if (leaseDeleted) {
        const leasesExists = await leases.deleteOne({ _id: new ObjectId(id) });

        if (leasesExists.deletedCount === 1) {
          const objectDeleted = await objects.deleteOne({
            _id: leaseDeleted._objectId,
          });

          const reviewsDeleted = await reviews.deleteMany({
            _objectId: leaseDeleted._objectId,
          });

          return {
            leaseDeleted: leaseDeleted,
            objectDeleted: objectDeleted,
            reviewsDeleted: reviewsDeleted,
          };
        }
      } else {
        return { status: 404, message: "This lease does not exist" }
      }
    } catch (error) {
      console.error(error);
    }
  },
  getAllReviews: async (leaseid) => {
    try {
      const db = getDB();
      const objects = db.collection("object");
      const reviews = db.collection("review");

      const objectsInLease = await objects
        .find({ _leaseId: new ObjectId(leaseid)})
        .toArray();

      const objectIds = objectsInLease.map((object) => object._id);

      // Find all reviews for object
      const reviewsAll = await reviews
        .find({ _objectId: { $in: objectIds } })
        .toArray();

      return reviewsAll;
    } catch (error) {
      console.error(error);
    }
  },
};
