const { getDB } = require("../utils/db_connection");

module.exports = {
    getUsers: async () => {
        try {
          const db = getDB();
    
          const users = db.collection("user");
          const userExists = await users.find({}).toArray();
    
          if (userExists) {
            return userExists;
          } else {
            return null;
          }
        } catch (error) {
          console.error(error);
        }
      },
}