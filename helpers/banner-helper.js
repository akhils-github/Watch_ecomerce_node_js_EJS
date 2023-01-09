const db = require("../config/connection");
const collection = require("../config/collection");
const objectId = require("mongodb").ObjectId;

module.exports = {
  // get all banners
  getAllBanners: () => {
    return new Promise((resolve, reject) => {
      let banners = db
        .get()
        .collection(collection.BANNER_COLLECTION)
        .find()
        .toArray();
      resolve(banners);
    });
  },

  // add banner
  addBanner: (data) => {
    return new Promise(async (resolve, reject) => {
      let banner = await db
        .get()
        .collection(collection.BANNER_COLLECTION)
        .findOne({ name: data.name });
      if (banner) {
        reject();
      } else {
        db.get()
          .collection(collection.BANNER_COLLECTION)
          .insertOne(data)
          .then((response) => {
            resolve(response);
          });
      }
    });
  },

  // get banner details
  getBannerDetails: (id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.BANNER_COLLECTION)
        .findOne({ _id: objectId(id) })
        .then((response) => {
          resolve(response);
        });
    });
  },

  // edit banner
  editBanner: (data) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.BANNER_COLLECTION)
        .updateOne(
          { _id: objectId(data._id) },
          {
            $set: {
              name: data.name,
              subname: data.subname,
              offer: data.offer,
              // description: data.description
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },

  // delete banner
  deleteBanner: (id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.BANNER_COLLECTION)
        .deleteOne({ _id: objectId(id) })
        .then(() => {
          resolve();
        });
    });
  },
};
