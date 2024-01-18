const { getDB } = require("../utils/db_connection");
const { ObjectId } = require("mongodb");

module.exports = {
  getReviews: async (leaseid, objectid) => {
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


      const reviewExists = await reviews
        .find({ _objectId: new ObjectId(objectid) })
        .toArray();

      if (reviewExists) {
        return reviewExists;
      } else {
        return null;
      }
    } catch (error) {
      console.error(error);
    }
  },
  getReview: async (leaseId, objId, reviewid) => {
    try {
      const db = getDB();

      const objects = db.collection("object");
      const leases = db.collection("lease");
      const reviews = db.collection("review");
      const foundLease = await leases.findOne({ _id: new ObjectId(leaseId) });
      if (foundLease) {
        const foundObject = await objects.findOne({
          _id: new ObjectId(objId),
          _leaseId: new ObjectId(leaseId),
        });
        if (foundObject) {
          const foundReview = await reviews.findOne({
            _id: new ObjectId(reviewid),
            _objectId: new ObjectId(objId),
          });
          if (foundReview) {
            return foundReview;
          } else {
            return { status: 404, message: "This review does not exist" };
          }
        }
        else {
            return { status: 404, message: "This object does not exist" };
        }
      } else {
        return { status: 404, message: "This lease does not exist" };
      }
    } catch (error) {
      console.error(error);
    }
  },
  createReview: async (author, description, rating, leaseid, objectid) => {
    try {
      const db = getDB();
      const objects = db.collection("object");
      const leases = db.collection("lease");
      const reviews = db.collection("review");
      const foundLease = await leases.findOne({ _id: new ObjectId(leaseid) });
      if (foundLease) {
        const foundObject = await objects.findOne({
          _id: new ObjectId(objectid),
          _leaseId: new ObjectId(leaseid),
        });
        if (foundObject) {
          const review = {
            author: author,
            description: description,
            rating: rating,
            _objectId: new ObjectId(objectid),
          };

          const didInsert = await reviews.insertOne(review);

          const revId = didInsert.insertedId;

          await objects.updateOne(
            { _id: new ObjectId(objectid) },
            { $push: { _reviewIds: new ObjectId(revId) } }
          );

          return [didInsert, review];
        } else {
          return { status: 404, message: "This object doesn't exist" };
        }
      } else {
        return { status: 404, message: "This lease does not exist" };
      }
    } catch (error) {
      console.error(error);
    }
  },
  updateReview: async (description, rating, leaseId, objId, reviewid) => {
    try {
      const db = getDB();
      const objects = db.collection("object");
      const leases = db.collection("lease");
      const reviews = db.collection("review");
      const foundLease = await leases.findOne({ _id: new ObjectId(leaseId) });
      if (foundLease) {
        const foundObject = await objects.findOne({
          _id: new ObjectId(objId),
          _leaseId: new ObjectId(leaseId),
        });
        if (foundObject) {
          const foundReview = await reviews.findOne({
            _id: new ObjectId(reviewid),
            _objectId: new ObjectId(objId),
          });
          if (foundReview) {
            const updatedReview = {
              $set: {
                description: description,
                rating: rating,
              },
            };
            const didUpdate = await reviews.updateOne(
              { _id: new ObjectId(reviewid), _objectId: new ObjectId(objId) },
              updatedReview
            );
            const updated = await reviews.findOne({
              _id: new ObjectId(reviewid),
            });

            return [didUpdate, updated];
          } else {
            return { status: 404, message: "This review does not exist" };
          }
        } else {
          return { status: 404, message: "This object does not exist" };
        }
      } else {
        return { status: 404, message: "This lease does not exist" };
      }
    } catch (error) {
      console.error("Error during update:", error);
    }
  },
  deleteReview: async (leaseId, objId, reviewid) => {
    try {
      const db = getDB();

      const objects = db.collection("object");
      const leases = db.collection("lease");
      const reviews = db.collection("review");

      const foundLease = await leases.findOne({ _id: new ObjectId(leaseId) });
      if (foundLease) {
        const foundObject = await objects.findOne({
          _id: new ObjectId(objId),
          _leaseId: new ObjectId(leaseId),
        });
        if (foundObject) {
          const foundReview = await reviews.findOne({
            _id: new ObjectId(reviewid),
            _objectId: new ObjectId(objId),
          });
          if (foundReview) {
            const reviewExists = await reviews.deleteOne({
              _id: new ObjectId(reviewid),
              _objectId: new ObjectId(objId),
            });
            if (reviewExists.deletedCount === 1) {
              const updatedObject = await objects.findOneAndUpdate(
                { _id: new ObjectId(objId) },
                { $pull: { _reviewIds: new ObjectId(reviewid) } }
              );


              return {
                reviewDeleted: foundReview,
                updatedObject: updatedObject
              }
            }
          } else {
            return { status: 404, message: "This review does not exist" };
          }
        } else {
          return { status: 404, message: "This object does not exist" };
        }
      } else {
        return { status: 404, message: "This lease does not exist" };
      }
    } catch (error) {
      console.error(error);
    }
  },
};
