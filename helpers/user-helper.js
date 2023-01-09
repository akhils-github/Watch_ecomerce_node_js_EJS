const db = require("../config/connection");
const bcrypt = require("bcrypt");
const collection = require("../config/collection");
const { resolve, reject } = require("promise");
const objectId = require("mongodb").ObjectId;
const moment = require("moment");
let referralCodeGenerator = require("referral-code-generator");

module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ email: userData.email });
      let user1 = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ mobileno: userData.mobileno });

      if (user != null || user1 != null) {
        resolve({ status: false });
      }
      let referrel = userData.referrel;
      if (referrel) {
        let referUser = await db
          .get()
          .collection(collection.USER_COLLECTION)
          .findOne({ referrelCode: referrel });
        if (referUser) {
          userData.password = await bcrypt.hash(userData.password, 10);
          let referrelCode =
            userData.username.slice(0, 3) +
            referralCodeGenerator.alpha("lowercase", 6);
          userData.referrelCode = referrelCode;
          db.get()
            .collection(collection.USER_COLLECTION)
            .insertOne(userData)
            .then((userdata) => {
              if (referUser.wallet) {
                walletAmount = parseInt(referUser.wallet);
                db.get()
                  .collection(collection.USER_COLLECTION)
                  .updateOne(
                    { _id: objectId(referUser._id) },
                    {
                      $set: {
                        wallet: parseInt(100) + walletAmount,
                      },
                    }
                  )
                  .then(() => {
                    resolve({ status: true });
                  });
              } else {
                db.get()
                  .collection(collection.USER_COLLECTION)
                  .updateOne(
                    { _id: objectId(referUser._id) },
                    {
                      $set: {
                        wallet: parseInt(100),
                      },
                    }
                  )
                  .then(() => {
                    resolve({ status: true });
                  });
              }
            });
        } else {
          reject();
        }
      } else {
        userData.password = await bcrypt.hash(userData.password, 10);
        let referrelCode =
          userData.username.slice(0, 3) +
          referralCodeGenerator.alpha("lowercase", 6);
        userData.referrelCode = referrelCode;
        db.get()
          .collection(collection.USER_COLLECTION)
          .insertOne(userData)
          .then((response) => {
            resolve({ status: true });
          });
      }
    });
  },
  doLogin: (userData) => {
    let response = {};
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ email: userData.email });

      if (user) {
        if (user.isBlocked) {
          response.isBlocked = true;
          resolve(response);
        } else {
          bcrypt.compare(userData.password, user.password).then((status) => {
            if (status) {
              response.status = true;
              response.user = user;
              resolve(response);
            } else {
              resolve({ status: false });
            }
          });
        }
      } else {
        resolve({ status: false });
      }
    });
  },
  otpUser: (phone) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .findOne({ mobileno: phone })
        .then((response) => {
          resolve(response);
        });
    });
  },
  findBlockUser: (id) => {
    return new Promise(async (resolve, reject) => {
      let blockUser = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: objectId(id) });
      resolve(blockUser);
    });
  },
  findCategory: (id) => {
    return new Promise(async (resolve, reject) => {
      let category = await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .findOne({ _id: objectId(id) });
      let allProducts = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find({ category: category.name });
      resolve(allProducts);
    });
  },
  getAllCategories: () => {
    return new Promise(async (resolve, reject) => {
      let allCategories = await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .find()
        .toArray();
      resolve(allCategories);
    });
  },
  getAddress: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .findOne(
          { _id: objectId(userId) },
          {
            $projection: {
              address: 1,
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },
  userDetails: (id) => {
    return new Promise(async (resolve, reject) => {
      let data = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: objectId(id) });
      resolve(data);
    });
  },
  addAddress: (address, userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: objectId(userId) },
          {
            $addToSet: {
              address: address,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },
  editAddress:(data,userId)=>{
    if(data.id != '' && data.name != '' && data.address != '' && data.town != '' && data.district != '' && data.state != '' && data.pincode != '' && data.phone != '' ){
    let uniqueid=data.id
    return new Promise(async(resolve, reject) => {
       let user=await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId)})
      //  let index= user.address.findIndex(address=>address.uniqueid==uniqueid)
    db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId),'address.id':uniqueid},{
        $set:{
            'address.$':data
        }
    }).then(()=>{
        resolve()
    })
        })
    }else{
      reject()
    }
    },
  deleteAddress: (userId, addressId) => {
    db.get()
      .collection(collection.USER_COLLECTION)
      .updateOne(
        { _id: objectId(userId), "address.id": addressId },
        {
          $pull: { address: { id: addressId } },
        }
      );
    resolve(true);
  },
  editProfile: (data) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: objectId(data._id) },
          {
            $set: {
              username: data.username,
              email: data.email,
              mobileno: data.mobileno,
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },
  changePassword: (data, userId) => {
    return new Promise(async (resolve, reject) => {
      let password = data.password;
      let newPassword = data.newPassword;
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: objectId(userId) });
      bcrypt.compare(password, user.password).then(async (status) => {
        if (status) {
          newPassword = await bcrypt.hash(newPassword, 10);
          db.get()
            .collection(collection.USER_COLLECTION)
            .updateOne(
              { _id: objectId(userId) },
              {
                $set: {
                  password: newPassword,
                },
              }
            )
            .then(() => {
              resolve();
            });
        } else {
          reject();
        }
      });
    });
  },
  findWallet: (id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: objectId(id) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  getUserInvoice: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({ _id: objectId(orderId) }, { sort: { date: -1 } })
        .toArray();
      var i;
      for (i = 0; i < orders.length; i++) {
        orders[i].date = moment(orders[i].date).format("lll");
      }
      resolve(orders);
    });
  },
};
