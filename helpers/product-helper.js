const db = require("../config/connection");
const collection = require("../config/collection");
const { ObjectId } = require("mongodb");
const objectId = require("mongodb").ObjectId;

module.exports = {
  addProduct: (product) => {
    product.price = parseInt(product.price);
    product.stock = parseInt(product.stock);
    return new Promise(async (resolve, reject) => {
      let productAvailable = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({ name: product.name });
      if (productAvailable) {
        reject({ response: false });
      } else {
        await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .insertOne(product)
          .then((response) => {
            resolve(response);
          });
      }
    });
  },
  getAllProducts: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .find()
        .limit(10)
        .toArray()
        .then((response) => {
          resolve(response);
        });
    });
  },
  getAllProducts20: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .find()
        .skip(10)
        .limit(10)
        .toArray()
        .then((response) => {
          resolve(response);
        });
    });
  },
  getAllProducts30: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .find()
        .skip(20)
        .limit(10)
        .toArray()
        .then((response) => {
          resolve(response);
        });
    });
  },
  getAllProducts40: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .find()
        .skip(30)
        .limit(10)
        .toArray()
        .then((response) => {
          resolve(response);
        });
    });
  },
  getProductDetails: (id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({ _id: ObjectId(id) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  editProduct: (data) => {
    data.price = parseInt(data.price);
    data.stock = parseInt(data.stock);
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .updateOne(
          { _id: objectId(data.id) },
          {
            $set: {
              _id: ObjectId(data.id),
              name: data.name,
              category: data.category,
              price: data.price,
              stock: data.stock,
              description: data.description,
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },
  deleteProduct: (id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .deleteOne({ _id: ObjectId(id) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  getProduct: (id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({ _id: objectId(id) })
        .then((response) => [resolve(response)]);
    });
  },
  allCategory: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .find()
        .toArray()
        .then((response) => {
          resolve(response);
        });
    });
  },
  getCatWiseProduct: (category) => {
    return new Promise(async (resolve, reject) => {
      let catWisePro = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find({ category: category })
        .toArray();
      resolve(catWisePro);
    });
  },
  findStock: (id) => {
    return new Promise(async (resolve, reject) => {
      let product = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({ _id: objectId(id) });
      resolve(product);
    });
  },
  getOrderProducts: (id) => {
    return new Promise(async (resolve, reject) => {
      let product = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({ _id: objectId(id) });
      resolve(product);
    });
  },
};
