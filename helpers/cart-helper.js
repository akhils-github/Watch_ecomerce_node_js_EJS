const db = require("../config/connection");
const collection = require("../config/collection");
const objectId = require("mongodb").ObjectId;

module.exports = {
  addToCart: (proId, userId) => {
    let proObj = {
      item: objectId(proId),
      quantity: 1,
    };
    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      if (userCart) {
        let proExist = userCart.products.findIndex(
          (product) => product.item == proId
        );
        if (proExist != -1) {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { user: objectId(userId), "products.item": objectId(proId) },
              {
                $inc: { "products.$.quantity": 1 },
              }
            )
            .then(() => {
              resolve();
            });
        } else {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { user: objectId(userId) },
              {
                $push: { products: proObj },
              }
            )
            .then((response) => {
              resolve(response);
            });
        }
      } else {
        let cartObj = {
          user: objectId(userId),
          products: [proObj],
        };
        db.get()
          .collection(collection.CART_COLLECTION)
          .insertOne(cartObj)
          .then((response) => {
            resolve(response);
          });
      }
    });
  },
  deleteCartItem: (cartId, proId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CART_COLLECTION)
        .updateOne(
          { _id: objectId(cartId), "products.item": objectId(proId) },
          {
            $pull: { products: { item: objectId(proId) } },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },
  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await db
        .get()
        .collection(collection.CART_COLLECTION)
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
      if (cartItems.length == 0) {
        resolve();
      } else {
        resolve(cartItems);
      }
    });
  },
  getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let total = await db
        .get()
        .collection(collection.CART_COLLECTION)
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
          {
            $group: {
              _id: null,
              total: { $sum: { $multiply: ["$quantity", "$product.price"] } },
            },
          },
        ])
        .toArray();
      if (total.length > 0) {
        resolve(total[0].total);
      } else {
        resolve(0);
      }
    });
  },
  getCartSubTotal: (userId, proId) => {
    return new Promise(async (resolve, reject) => {
      let cartSubTotal = await db
        .get()
        .collection(collection.CART_COLLECTION)
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
            $match: {
              item: objectId(proId),
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
          {
            $project: {
              unitprice: { $toInt: "$product.price" },
              quantity: { $toInt: "$quantity" },
            },
          },
          {
            $project: {
              _id: null,
              subtotal: { $sum: { $multiply: ["$quantity", "$unitprice"] } },
            },
          },
        ])
        .toArray();
      if (cartSubTotal.length > 0) {
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            { user: objectId(userId), "products.item": objectId(proId) },
            {
              $set: {
                "products.$.subtotal": cartSubTotal[0].subtotal,
              },
            }
          )
          .then((response) => {
            resolve(cartSubTotal[0].subtotal);
          });
      } else {
        cartSubTotal = 0;
        resolve(cartSubTotal);
      }
    });
  },
  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      if (cart) {
        count = cart.products.length;
      }
      resolve(count);
    });
  },
  changeProductQuantity: (details) => {
    details.count = parseInt(details.count);
    details.quantity = parseInt(details.quantity);
    return new Promise(async (resolve, reject) => {
      let stockCount = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({ _id: objectId(details.product) });
        if(stockCount.stock){
      if (details.quantity == stockCount.stock && details.count == 1) {
        reject({status:true});
      } else if(details.quantity == 3 && details.count == 1) {
        reject({count:true});
      } else{
        if (details.count == -1 && details.quantity == 1) {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { _id: objectId(details.cart) },
              {
                $pull: { products: { item: objectId(details.product) } },
              }
            )
            .then(() => {
              resolve({ removeProduct: true });
            });
        } else {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              {
                _id: objectId(details.cart),
                "products.item": objectId(details.product),
              },
              {
                $inc: { "products.$.quantity": details.count },
              }
            )
            .then(() => {
              resolve({ status: true });
            });
        }
      }
    }else{
      reject({noStock:true})
    }
    });
  },
  getCartProductList: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      resolve(cart.products);
    });
  },
  findCartProdQty: (userId, proId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let userCart = await db
          .get()
          .collection(collection.CART_COLLECTION)
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
              $match: {
                item: objectId(proId),
              },
            },
            {
              $project: {
                item: 1,
                quantity: 1,
                product: { $arrayElemAt: ["$product", 0] },
              },
            },
            {
              $project: {
                unitprice: { $toInt: "$product.price" },
                quantity: { $toInt: "$quantity" },
              },
            },
          ])
          .toArray();
        resolve(userCart[0].quantity);
      } catch {
        resolve(0);
      }
    });
  },
};
