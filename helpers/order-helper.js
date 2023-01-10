const db = require("../config/connection");
const { resolve, reject } = require("promise");
const collection = require("../config/collection");
const moment = require("moment");
const objectId = require("mongodb").ObjectId;
const Razorpay = require("razorpay");
const paypal = require("paypal-rest-sdk");

var instance = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
});

module.exports = {
  placeOrder: (order, products, total) => {
    return new Promise((resolve, reject) => {
      if (order.Coupon) {
        db.get()
          .collection(collection.COUPON_COLLECTION)
          .updateOne(
            { coupon: order.Coupon },
            {
              $push: {
                users: order.userId,
              },
            }
          );
      }
      let status =
        order.payment_method === "COD" ||
        order.payment_method === "wallet" ||
        order.payment_method === "paypal"
          ? "placed"
          : "pending";
      let orderObj = {
        deliveryDetails: {
          name: order.name,
          address: order.address,
          town: order.town,
          district: order.district,
          state: order.state,
          pincode: order.pincode,
          phone: order.phone,
        },
        userId: objectId(order.userId),
        paymentMethod: order.payment_method,
        products: products,
        totalAmount: total,
        status: status,
        date: new Date(),
      };
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .insertOne(orderObj)
        .then((response) => {
          products.forEach(async (element) => {
            let product = await db
              .get()
              .collection(collection.PRODUCT_COLLECTION)
              .findOne({ _id: element.item });
            let pquantity = Number(product.stock);
            pquantity = pquantity - element.quantity;
            await db
              .get()
              .collection(collection.PRODUCT_COLLECTION)
              .updateOne(
                { _id: element.item },
                {
                  $set: {
                    stock: pquantity,
                  },
                }
              );
          });
          db.get()
            .collection(collection.CART_COLLECTION)
            .deleteOne({ user: objectId(order.userId) });
          resolve(response.insertedId);
        });
    });
  },
  getCartProductList: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      if (cart) {
        resolve(cart.product);
      } else {
        resolve(0);
      }
    });
  },
  getUserOrders: (userId) => {
    return new Promise(async (resolve, reject) => {
      var orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({ userId: objectId(userId) }, { sort: { date: -1 } })
        .limit(10)
        .toArray();
      var i;
      for (i = 0; i < orders.length; i++) {
        orders[i].date = moment(orders[i].date).format("lll");
      }
      resolve(orders);
    });
  },
  getUserOrders20: (userId) => {
    return new Promise(async (resolve, reject) => {
      var orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({ userId: objectId(userId) }, { sort: { date: -1 } })
        .skip(10)
        .limit(10)
        .toArray();
      var i;
      for (i = 0; i < orders.length; i++) {
        orders[i].date = moment(orders[i].date).format("lll");
      }
      resolve(orders);
    });
  },
  getUserOrders30: (userId) => {
    return new Promise(async (resolve, reject) => {
      var orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({ userId: objectId(userId) }, { sort: { date: -1 } })
        .skip(20)
        .limit(10)
        .toArray();
      var i;
      for (i = 0; i < orders.length; i++) {
        orders[i].date = moment(orders[i].date).format("lll");
      }
      resolve(orders);
    });
  },
  getUserOrders40: (userId) => {
    return new Promise(async (resolve, reject) => {
      var orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({ userId: objectId(userId) }, { sort: { date: -1 } })
        .skip(30)
        .limit(10)
        .toArray();
      var i;
      for (i = 0; i < orders.length; i++) {
        orders[i].date = moment(orders[i].date).format("lll");
      }
      resolve(orders);
    });
  },
  getOrderProducts: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let orderItems = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: { _id: objectId(orderId) },
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
      resolve(orderItems);
    });
  },
  getOrderDetails: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let orderDetails = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({ _id: objectId(orderId) })
        .toArray();
      var i;
      for (i = 0; i < orderDetails.length; i++) {
        orderDetails[i].date = moment(orderDetails[i].date).format("LLLL");
      }
      resolve(orderDetails[0]);
    });
  },
  cancelOrder: (orderId) => {
    return new Promise(async(resolve, reject) => {
      let status = await db.get()
        .collection(collection.ORDER_COLLECTION)
        .findOne({_id:objectId(orderId)})
        if(status.status == 'placed' || status.status == 'pending'){
          db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: objectId(orderId) },
          {
            $set: {
              status: "cancelled",
              isRefunded: false,
              isReturned: false,
              isShipped: false,
              isDelivered: false,
              isOutOfDelivery: false,
              isCancelled: true,
              cancelledDate: new Date(),
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
        }else{
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: objectId(orderId) },
          {
            $set: {
              status: "Refund has been initiated",
              isCancelled: true,
              cancelledDate: new Date(),
              isRefunded: true,
              returnedDate: new Date(),
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
      }
    });
  },
  returnOrder: (orderId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: objectId(orderId) },
          {
            $set: {
              status: "returned",
              isRefunded: true,
              refundedDate: new Date(),
              isReturned: true,
              returnedDate: new Date(),
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },
  getOrder: (orderId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .findOne({ _id: objectId(orderId) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  createWallet: (id, orderId, amount) => {
    return new Promise(async (resolve, reject) => {
      let wallet = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: objectId(id) });
      if (wallet.wallet) {
        let totalAmount = wallet.wallet + amount;
        await db
          .get()
          .collection(collection.USER_COLLECTION)
          .updateOne(
            { _id: objectId(id) },
            {
              $set: {
                wallet: parseInt(totalAmount),
              },
            }
          )
          .then(async () => {
            await db
              .get()
              .collection(collection.ORDER_COLLECTION)
              .updateOne(
                { _id: objectId(orderId) },
                {
                  $set: {
                    status: "Refund has been initiated",
                  },
                }
              )
              .then(() => {
                resolve();
              });
          });
      } else {
        await db
          .get()
          .collection(collection.USER_COLLECTION)
          .updateOne(
            { _id: objectId(id) },
            {
              $set: {
                wallet: parseInt(amount),
              },
            }
          )
          .then(() => {
            db.get()
              .collection(collection.ORDER_COLLECTION)
              .updateOne(
                { _id: objectId(orderId) },
                {
                  $set: {
                    status: "Refund has been initiated",
                  },
                }
              )
              .then(() => {
                resolve();
              });
          });
      }
    });
  },
  getWalletAmount: (id) => {
    return new Promise(async (resolve, reject) => {
      let wallet = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: objectId(id) });
      resolve(wallet.wallet);
    });
  },
  reduceWallet: (id, total) => {
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: objectId(id) });
      let amount = user.wallet - total;
      await db
        .get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: objectId(id) },
          {
            $set: {
              wallet: parseInt(amount),
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },
  // status track
  statusTrack: (orderId) => {
    try {
      return new Promise(async (resolve, reject) => {
        let track = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .findOne({ _id: objectId(orderId) });
        resolve(track);
      });
    } catch {
      resolve(0);
    }
  },
  generateRazorpay: (orderId, total) => {
    return new Promise((resolve, reject) => {
      var options = {
        amount: total * 100, //amount is the smallest currency unit
        currency: "INR",
        receipt: "" + orderId,
      };
      instance.orders.create(options, function (err, order) {
        if (err) {
          console.log(err);
        } else {
          resolve(order);
        }
      });
    });
  },
  verifyPayment: (details) => {
    return new Promise((resolve, reject) => {
      const crypto = require("crypto");
      let hmac = crypto.createHmac("sha256", process.env.KEY_SECRETKEY_SECRET);

      hmac.update(
        details["payment[razorpay_order_id]"] +
          "|" +
          details["payment[razorpay_payment_id]"]
      );
      hmac = hmac.digest("hex");
      // edits
      if (hmac == details["payment[razorpay_signature]"]) {
        resolve();
      } else {
        reject();
      }
    });
  },
  changePaymentStatus: (orderId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: objectId(orderId) },
          {
            $set: {
              status: "placed",
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },
  generatePaypal: (orderId, total) => {
    return new Promise((resolve, reject) => {
      var create_payment_json = {
        intent: "sale",
        payer: {
          payment_method: "paypal",
        },
        redirect_urls: {
          return_url: "https://sfr.onrender.com/order-placed",
          cancel_url: "https://sfr.onrender.com/place-order",
        },
        transactions: [
          {
            item_list: {
              items: [
                {
                  name: "item",
                  sku: "item",
                  price: total,
                  currency: "USD",
                  quantity: 1,
                },
              ],
            },
            amount: {
              currency: "USD",
              total: total,
            },
            description: "This is the payment description.",
          },
        ],
      };

      paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
          throw error;
        } else {
          console.log("Create Payment Response");
          console.log(payment.links[1].href);
          resolve(payment.links[1].href);
        }
      });
    });
  },
};
