const db = require("../config/connection");
const collection = require("../config/collection");
const objectId = require("mongodb").ObjectId;

module.exports = {
  addToWishlist: (userId, proId) => {
    let proObj = {
      item: objectId(proId),
    };
    return new Promise(async (resolve, reject) => {
      let userWishlist = await db
        .get()
        .collection(collection.WISHLIST_COLLECTION)
        .findOne({ user: objectId(userId) });
      if (userWishlist) {
        let proExist = userWishlist.products.findIndex(
          (product) => product.item == proId
        );
        if (proExist != -1) {
          db.get()
            .collection(collection.WISHLIST_COLLECTION)
            .updateOne(
              { user: objectId(userId), "products.item": objectId(proId) },
              {
                $pull: { products: { item: objectId(proId) } },
              }
            )
            .then(() => {
              reject();
            });
        } else {
          db.get()
            .collection(collection.WISHLIST_COLLECTION)
            .updateOne(
              { user: objectId(userId) },
              {
                $push: {
                  products: proObj,
                },
              }
            )
            .then(() => {
              resolve();
            });
        }
      } else {
        wishobj = {
          user: objectId(userId),
          products: [proObj],
        };
        db.get()
          .collection(collection.WISHLIST_COLLECTION)
          .insertOne(wishobj)
          .then(() => {
            resolve();
          });
      }
    });
  },
  getWishlistProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let wishlistItems = await db
        .get()
        .collection(collection.WISHLIST_COLLECTION)
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();
      resolve(wishlistItems);
    });
  },
  deleteWishlist: (proId, wishId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.WISHLIST_COLLECTION)
        .updateOne(
          { _id: objectId(wishId), "products.item": objectId(proId) },
          {
            $pull: { products: { item: objectId(proId) } },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },
  getWishlistCount: (id) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let wishlist = await db
        .get()
        .collection(collection.WISHLIST_COLLECTION)
        .findOne({ user: objectId(id) });
      if (wishlist) {
        count = wishlist.products.length;
        resolve(count);
      } else {
        resolve(0);
      }
    });
  },
  findWishlist: (wishId) => {
    return new Promise(async (resolve, reject) => {
      let wishItem = await db
        .get()
        .collection(collection.WISHLIST_COLLECTION)
        .findOne({ _id: objectId(wishId) });
      resolve(wishItem);
    });
  },
};
