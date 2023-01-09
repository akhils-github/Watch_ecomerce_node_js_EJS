const db = require("../config/connection");
const collection = require("../config/collection");
const { resolve, reject } = require("promise");
const objectId = require("mongodb").ObjectId;
const moment = require("moment");

module.exports = {
  // dashboard details
  monthlyReport: () => {
    return new Promise(async (resolve, reject) => {
        try{
        let start=new Date(new Date()-1000*60*60*24*30)
        let end = new Date()

        let orderSuccess = await db.get().collection(collection.ORDER_COLLECTION).find({ date: { $gte: start, $lte: end }, status: { $nin: ['cancelled'] } }).sort({ Date: -1, Time: -1 }).toArray()
        // console.log('============',orderSuccess);
        var i;
        for(i=0;i<orderSuccess.length;i++){
          // console.log(orderSuccess[i].date);
            orderSuccess[i].date=moment(orderSuccess[i].date).format('lll')
        }
        // console.log(orderSuccess,"hfgbkhdfbj");
        let orderTotal = await db.get().collection(collection.ORDER_COLLECTION).find({ date: { $gte: start, $lte: end } }).toArray()
        // console.log('gdsgssg',orderTotal);
        let orderSuccessLength = orderSuccess.length
        let orderTotalLength = orderTotal.length
        let orderFailLength = orderTotalLength - orderSuccessLength
        let total = 0
        let discount=0
        let razorpay = 0
        let cod = 0
        let paypal = 0
        let wallet=0
        
        for (let i = 0; i < orderSuccessLength; i++) {
            total = total + orderSuccess[i].totalAmount
            if (orderSuccess[i].paymentMethod === 'COD') {
                cod++
            } else if (orderSuccess[i].paymentMethod === 'paypal') {
                paypal++
            }else if (orderSuccess[i].paymentMethod === 'wallet') {
                wallet++
            }
             else {
              razorpay++
            }
             if (orderSuccess[i].discount) {
                // console.log("discount check");
                discount = discount + parseInt(orderSuccess[i].discount)
                discount++
            }
        }
        let productCount=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
                $match:{
                   $and:[{status:{$nin:["cancelled"]}
                },
            { date: { $gte: start, $lte: end }}]

                },
                
            },
            {
                $project:{
                    _id:0,
                    quantity:'$products.quantity'
                    
                }
            },
            {
                $unwind:'$quantity'
            },
            {
                $group: {
                    _id: null,
                    total: { $sum:'$quantity' }
                }
            }
          ]).toArray()
          // console.log(productCount);
        var data = {
            start: moment(start).format('YYYY/MM/DD'),
            end: moment(end).format('YYYY/MM/DD'),
            totalOrders: orderTotalLength,
            successOrders: orderSuccessLength,
            failOrders: orderFailLength,
            totalSales: total,
            cod: cod,
            paypal: paypal,
            wallet:wallet,
            razorpay: razorpay,
            discount:discount,
            productCount:productCount[0].total,
            currentOrders: orderSuccess
        }
        // console.log(data);
      resolve(data)
    }catch{
      resolve(0)

    }
  })
 },
  getDashboardCount: () => {
    try {
      return new Promise(async (resolve, reject) => {
        let orderCount = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .find()
          .count();
        let userCount = await db
          .get()
          .collection(collection.USER_COLLECTION)
          .find()
          .count();
        let productCount = await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .find()
          .count();
        let obj = {
          userCount: userCount,
          orderCount: orderCount,
          productCount: productCount,
        };
        resolve(obj);
      });
    } catch {
      resolve(0);
    }
  },
  totalRevenue: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let totalRevenue = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .aggregate([
            {
              $match: {
                status: "delivered",
              },
            },
            {
              $project: {
                totalAmount: "$totalAmount",
              },
            },
            {
              $group: {
                _id: null,
                totalAmount: { $sum: "$totalAmount" },
              },
            },
          ])
          .toArray();
        resolve(totalRevenue[0].totalAmount);
      } catch {
        resolve(0);
      }
    });
  },
   // addAdmin: (adminData) => {
  //   return new Promise(async (resolve, reject) => {
  //     let admin = await db
  //       .get()
  //       .collection(collection.ADMIN_COLLECTION)
  //       .findOne({ email: adminData.email });
  //     if (admin) {
  //       resolve({ status: false });
  //     } else {
  //       adminData.password = await bcrypt.hash(adminData.password, 10);
  //       db.get()
  //         .collection(collection.ADMIN_COLLECTION)
  //         .insertOne(adminData)
  //         .then((response) => {
  //           resolve({ status: true });
  //         });
  //     }
  //   });
  // },
  // adminLogin: (adminData) => {
  //   let response = {};
  //   return new Promise(async (resolve, reject) => {
  //     let admin = await db
  //       .get()
  //       .collection(collection.ADMIN_COLLECTION)
  //       .findOne({ email: adminData.email });
  //     if (admin) {
  //       bcrypt.compare(adminData.password, admin.password).then((status) => {
  //         if (status) {
  //           response.status = true;
  //           response.admin = admin;
  //           resolve(response);
  //         } else {
  //           resolve({ status: false });
  //         }
  //       });
  //     } else {
  //       resolve({ status: false });
  //     }
  //   });
  // },
  dailyRevenue: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let dailyRevenue = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .aggregate([
            {
              $match: {
                date: {
                  $lt: new Date(),
                  $gte: new Date(new Date() - 1000 * 60 * 60 * 24),
                },
              },
            },
            {
              $match: {
                status: "delivered",
              },
            },
            {
              $group: {
                _id: null,
                totalAmount: { $sum: "$totalAmount" },
              },
            },
          ])
          .toArray();
        resolve(dailyRevenue[0].totalAmount);
      } catch {
        resolve(0);
      }
    });
  },
  weeklyRevenue: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let weeklyRevenue = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .aggregate([
            {
              $match: {
                date: {
                  $gte: new Date(new Date() - 1000 * 60 * 60 * 24 * 7),
                },
              },
            },
            {
              $match: {
                status: "delivered",
              },
            },
            {
              $group: {
                _id: null,
                totalAmount: { $sum: "$totalAmount" },
              },
            },
          ])
          .toArray();
        resolve(weeklyRevenue[0].totalAmount);
      } catch {
        resolve(0);
      }
    });
  },
  monthlyRevenue: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let monthlyRevenue = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .aggregate([
            {
              $match: {
                date: {
                  $gte: new Date(new Date() - 1000 * 60 * 60 * 24 * 7 * 4),
                },
              },
            },
            {
              $match: {
                status: "delivered",
              },
            },
            {
              $group: {
                _id: null,
                totalAmount: { $sum: "$totalAmount" },
              },
            },
          ])
          .toArray();
        resolve(monthlyRevenue[0].totalAmount);
      } catch {
        resolve(0);
      }
    });
  },

  yearlyRevenue: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let yearlyRevenue = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .aggregate([
            {
              $match: {
                date: {
                  $gte: new Date(new Date() - 1000 * 60 * 60 * 24 * 7 * 4 * 12),
                },
              },
            },
            {
              $match: {
                status: "delivered",
              },
            },
            {
              $group: {
                _id: null,
                totalAmount: { $sum: "$totalAmount" },
              },
            },
          ])
          .toArray();

        resolve(yearlyRevenue[0].totalAmount);
      } catch {
        resolve(0);
      }
    });
  },
  getchartData: (req, res) => {
    try {
      return new Promise((resolve, reject) => {
        db.get()
          .collection(collection.ORDER_COLLECTION)
          .aggregate([
            { $match: { status: "delivered" } },
            {
              $project: {
                date: { $convert: { input: "$_id", to: "date" } },
                total: "$totalAmount",
              },
            },
            {
              $match: {
                date: {
                  $lt: new Date(),
                  $gt: new Date(
                    new Date().getTime() - 24 * 60 * 60 * 1000 * 365
                  ),
                },
              },
            },
            {
              $group: {
                _id: { $month: "$date" },
                total: { $sum: "$total" },
              },
            },
            {
              $project: {
                month: "$_id",
                total: "$total",
                _id: 0,
              },
            },
          ])
          .toArray()
          .then((result) => {
            db.get()
              .collection(collection.ORDER_COLLECTION)
              .aggregate([
                { $match: { status: "delivered" } },
                {
                  $project: {
                    date: { $convert: { input: "$_id", to: "date" } },
                    total: "$totalAmount",
                  },
                },
                {
                  $match: {
                    date: {
                      $lt: new Date(),
                      $gt: new Date(
                        new Date().getTime() - 24 * 60 * 60 * 1000 * 7
                      ),
                    },
                  },
                },
                {
                  $group: {
                    _id: { $dayOfWeek: "$date" },
                    total: { $sum: "$total" },
                  },
                },
                {
                  $project: {
                    date: "$_id",
                    total: "$total",
                    _id: 0,
                  },
                },
                {
                  $sort: { date: 1 },
                },
              ])
              .toArray()
              .then((weeklyReport) => {
                let obj = {
                  result,
                  weeklyReport,
                };
                resolve(obj);
              });
          });
      });
    } catch {
      resolve(0);
    }
  },
  //All Users
  getAllUsers: () => {
    return new Promise(async (resolve, reject) => {
      let users = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .find()
        .limit(10)
        .toArray();
      resolve(users);
    });
  },
  getAllUsers20: () => {
    return new Promise(async (resolve, reject) => {
      let users = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .find()
        .skip(10)
        .limit(10)
        .toArray();
      resolve(users);
    });
  },
  getAllUsers30: () => {
    return new Promise(async (resolve, reject) => {
      let users = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .find()
        .skip(20)
        .limit(10)
        .toArray();
      resolve(users);
    });
  },
  getAllUsers40: () => {
    return new Promise(async (resolve, reject) => {
      let users = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .find()
        .skip(30)
        .limit(10)
        .toArray();
      resolve(users);
    });
  },
  //block and unblock
  blockUser: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne({ _id: objectId(userId) }, { $set: { isBlocked: true } })
        .then((response) => {
          resolve(response);
        });
    });
  },
  unblockUser: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne({ _id: objectId(userId) }, { $set: { isBlocked: false } })
        .then((response) => {
          resolve(response);
        });
    });
  },
  deleteUser: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .deleteOne({ _id: objectId(userId) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  addCategory: (data) => {
    function capitalize(string) {
      return string.toUpperCase();
    }
    let Category = capitalize(data.category);
    return new Promise(async (resolve, reject) => {
      let categoryExist = await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .findOne({ category: Category });
      if (categoryExist) {
        resolve({ status: false });
      } else {
        db.get()
          .collection(collection.CATEGORY_COLLECTION)
          .insertOne({ category: Category })
          .then((response) => {
            resolve({ status: true });
          });
      }
    });
  },
  editCategory: (data) => {
    function capitalize(string) {
      return string.toUpperCase();
    }
    let Category = capitalize(data.category);
    let id = data.id;
    let response = {};
    return new Promise(async (resolve, reject) => {
      let categoryExist = await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .findOne({ category: Category });
      if (categoryExist) {
        resolve({ status: false });
      } else {
        db.get()
          .collection(collection.CATEGORY_COLLECTION)
          .updateOne(
            { _id: objectId(id) },
            {
              $set: {
                category: Category,
              },
            }
          )
          .then(() => {
            response.status = true;
            resolve(response);
          });
      }
    });
  },
  getAllCategory: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .find()
        .limit(10)
        .toArray()
        .then((response) => {
          resolve(response);
        });
    });
  },
  getAllCategory20: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .find()
        .skip(10)
        .limit(10)
        .toArray()
        .then((response) => {
          resolve(response);
        });
    });
  },
  getAllCategory30: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .find()
        .skip(20)
        .limit(10)
        .toArray()
        .then((response) => {
          resolve(response);
        });
    });
  },
  getAllCategory40: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .find()
        .skip(30)
        .limit(10)
        .toArray()
        .then((response) => {
          resolve(response);
        });
    });
  },
  getCategory: (id) => {
    return new Promise(async (resolve, reject) => {
      let cat = await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .find({ _id: objectId(id) })
        .toArray();
      resolve(cat);
    });
  },
  deleteCategory: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .deleteOne({ _id: objectId(userId) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  getAllUserOrders: () => {
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find()
        .sort({ $natural: -1 })
        .limit(10)
        .toArray();
      var i;
      for (i = 0; i < orders.length; i++) {
        orders[i].date = moment(orders[i].date).format("lll");
      }
      resolve(orders);
    });
  },
  getAllUserOrders20: () => {
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find()
        .sort({ $natural: -1 })
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
  getAllUserOrders30: () => {
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find()
        .sort({ $natural: -1 })
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
  getAllUserOrders40: () => {
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find()
        .sort({ $natural: -1 })
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
  orderStatusChange: (status, orderId) => {
    return new Promise(async (resolve, reject) => {
      if (status == "cancelled") {
        await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .updateOne(
            { _id: objectId(orderId) },
            {
              $set: {
                status: status,
                isCancelled: true,
                cancelledDate: new Date(),
                isRefunded: true,
                refundedDate: new Date(),
              },
            }
          )
          .then(async () => {
            var status = await db
              .get()
              .collection(collection.ORDER_COLLECTION)
              .findOne({ _id: objectId(orderId) });
            resolve(status);
          });
      } else if (status == "pending") {
        db.get()
          .collection(collection.ORDER_COLLECTION)
          .updateOne(
            { _id: objectId(orderId) },
            {
              $set: {
                status: status,
                isPending: true,
                isOutOfDelivery: false,
                isDelivered: false,
                isShipped: false,
                pendingDate: new Date(),
              },
            }
          )
          .then(async (status) => {
            var status = await db
              .get()
              .collection(collection.ORDER_COLLECTION)
              .findOne({ _id: objectId(orderId) });
            resolve(status.status);
          });
      } else if (status == "shipped") {
        db.get()
          .collection(collection.ORDER_COLLECTION)
          .updateOne(
            { _id: objectId(orderId) },
            {
              $set: {
                status: status,
                isShipped: true,
                shippedDate: new Date(),
              },
            }
          )
          .then(async (status) => {
            var status = await db
              .get()
              .collection(collection.ORDER_COLLECTION)
              .findOne({ _id: objectId(orderId) });
            resolve(status.status);
          });
      } else if (status == "delivered") {
        db.get()
          .collection(collection.ORDER_COLLECTION)
          .updateOne(
            { _id: objectId(orderId) },
            {
              $set: {
                status: status,
                isShipped:true,
                isOutOfDelivery:true,
                isDelivered: true,
                deliveredDate: new Date(),
              },
            }
          )
          .then(async (status) => {
            var status = await db
              .get()
              .collection(collection.ORDER_COLLECTION)
              .findOne({ _id: objectId(orderId) });
            resolve(status.status);
          });
      } else if (status == "Out Of Delivery") {
        db.get()
          .collection(collection.ORDER_COLLECTION)
          .updateOne(
            { _id: objectId(orderId) },
            {
              $set: {
                status: status,
                isShipped:true,
                isOutOfDelivery: true,
                outOfDeliveryDate: new Date(),
              },
            }
          )
          .then(async (status) => {
            var status = await db
              .get()
              .collection(collection.ORDER_COLLECTION)
              .findOne({ _id: objectId(orderId) });
            resolve(status.status);
          });
      } else if (status == "Refund has been initiated") {
        db.get()
          .collection(collection.ORDER_COLLECTION)
          .updateOne(
            { _id: objectId(orderId) },
            {
              $set: {
                status: status,
                isRefunded: true,
                refundedDate: new Date(),
              },
            }
          )
          .then(async (status) => {
            var status = await db
              .get()
              .collection(collection.ORDER_COLLECTION)
              .findOne({ _id: objectId(orderId) });
            resolve(status.status);
          });
      } else {
        db.get()
          .collection(collection.ORDER_COLLECTION)
          .updateOne(
            { _id: objectId(orderId) },
            {
              $set: {
                status: status,
              },
            }
          )
          .then(async (status) => {
            var status = await db
              .get()
              .collection(collection.ORDER_COLLECTION)
              .findOne({ _id: objectId(orderId) });
            resolve(status.status);
          });
      }
    });
  },
};
