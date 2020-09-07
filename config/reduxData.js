const user = require("../models/user");
const ObjectId = require("mongoose").Types.ObjectId;
let userIdMapping = {};

module.exports = {
  userData: _id =>
    new Promise((res, rej) => {
      try {
        if (!_id) {
          rej("NO ID GIVEN");
        }
        if (userIdMapping[_id]) {
          res(userIdMapping[_id]);
        } else {
          user
            .findById(ObjectId(_id))
            .then(data => {
              userIdMapping[_id] = data;
              res(userIdMapping[_id]);
            })
            .catch(rej);
        }
      } catch (err) {
        rej(err);
      }
    })
};
