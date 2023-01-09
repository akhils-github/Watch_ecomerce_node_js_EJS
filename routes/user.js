var express = require("express");
var router = express.Router();
let bcrypt = require("bcrypt");
const db = require("../config/connection");
const collection = require("../config/collection");
const multer = require("multer");
const userHelper = require("../helpers/user-helper");
const productHelper = require("../helpers/product-helper");
const cartHelper = require("../helpers/cart-helper");
const orderHelper = require("../helpers/order-helper");
const wishlistHelper = require("../helpers/wishlist-helper");
const offerHelper = require("../helpers/offer-helper");
const couponHelper = require("../helpers/coupon-helper");
const bannerHelper = require("../helpers/banner-helper");
const { Db, ObjectId } = require("mongodb");
const { response } = require("../app");
const { resolve } = require("promise");
const moment = require("moment");


// verify login middleware
const verifyLogin = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    req.session.redirectUrl = req.originalUrl;
    res.redirect("/login");
  }
};
const verifyLoginCart = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
};
const verifyBlockUser = async (req, res, next) => {
  let user = req.session.user;
  if (user) {
    let blockUser = await userHelper.findBlockUser(user._id);
    if (blockUser.isBlocked) {
      req.session.user = null;
      req.session.blockErr = "Sorry You Are Blocked";
      res.redirect("/login");
    } else {
      next();
    }
  } else {
    res.redirect("/");
  }
};
const serviceSID = process.env.SERVICE_SID;
const accountSID = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = require("twilio")(accountSID, authToken);

/* GET home page. */
router.get("/", async (req, res, next) => {
  let user = req.session.user;
  let cartCount = null;
  let wishlistCount = null;
  if (user) {
    cartCount = await cartHelper.getCartCount(req.session.user._id);
    wishlistCount = await wishlistHelper.getWishlistCount(req.session.user._id);
  }
  let allBanners = await bannerHelper.getAllBanners()
  res.render("user/index", { user, cartCount, wishlistCount, allBanners });
});

// user login
router.get("/login", function (req, res, next) {
  if (req.session.user) {
    res.redirect("/");
  } else {
    res.render("user/login", {
      login: true,
      validation: true,
      loginErr: req.session.loginErr,
      blockErr: req.session.blockErr,
    });
    req.session.blockErr = false;
    req.session.loginErr = false;
  }
});
router.post("/login", (req, res) => {
  userHelper.doLogin(req.body).then((response) => {
    if (response.isBlocked) {
      req.session.blockErr = "This user is Blocked!";
      res.redirect("/login");
    } else {
      if (response.status) {
        req.session.loggedIn = true;
        req.session.user = response.user;
        if (req.session.redirectUrl) {
          res.redirect(req.session.redirectUrl);
        } else {
          res.redirect("/");
        }
      } else {
        req.session.loginErr = "Invalid Email or Password";
        res.redirect("/login");
      }
    }
  });
});

// signup
router.get("/signup", (req, res, next) => {
  res.render("user/signup", { login: true, signupErr: req.session.signupErr });
  req.session.signupErr = false;
});
router.post("/signup", (req, res) => {
  userHelper.doSignup(req.body).then((response) => {
    if (response.status) {
      res.redirect("/login");
    } else {
      req.session.signupErr = "Email or Mobile Number is Already Exists!";
      res.redirect("/signup");
    }
  });
});

// number add page
router.get("/number", (req, res) => {
  res.render("user/number", {
    otpErr: req.session.otpErr,
    blockErr: req.session.blockErr,
    validation: true,
  });
  req.session.otpErr = false;
  req.session.blockErr = false;
});
router.post("/number", async (req, res) => {
  let user = await userHelper.otpUser(req.body.phone);
  await userHelper.otpUser(req.body.phone).then((response) => {
    if (user) {
      if (response.isBlocked) {
        req.session.blockErr = "User is blocked";
        res.redirect("/number");
      } else {
        client.verify
          .services(serviceSID)
          .verifications.create({
            to: `+91${req.body.phone}`,
            channel: "sms",
          })
          .then((response) => {
            res.render("user/otp", { phone: req.body.phone });
          })
          .catch((e) => {});
      }
    } else {
      req.session.otpErr = "User Not Registered!";
      res.redirect("/number");
    }
  });
});

// otp add page
router.get("/otp", (req, res) => {
  res.render("user/otp", {
    invalidOtpError: req.session.invalidOtpError,
    validation: true,
  });
  req.session.invalidOtpError = false;
});
router.post("/otp", (req, res) => {
  let otp = req.body.otp;
  let phone = req.body.phone;
  client.verify
    .services(serviceSID)
    .verificationChecks.create({
      to: `+91${phone}`,
      code: otp,
    })
    .then((response) => {
      let valid = response.valid;
      if (valid) {
        userHelper.otpUser(phone).then((response) => {
          req.session.loggedIn = true;
          req.session.user = response;
          res.redirect("/");
        });
      } else {
        req.session.invalidOtpError = "Invalid OTP please re-enter mobile no";
        res.redirect("/number");
      }
    })
    .catch((err) => {});
});

// shop list a loop product
router.get("/shop", async (req, res) => {
  let user = req.session.user;
  if (user) {
    let todayDate = new Date().toISOString().slice(0, 10);
    await offerHelper.startProductOffer(todayDate);
    await offerHelper.startCategoryOffer(todayDate);
     couponHelper.startCouponOffer(todayDate);
    let cartCount = await cartHelper.getCartCount(req.session.user._id);
    let wishlistCount = await wishlistHelper.getWishlistCount(
      req.session.user._id
    );
    let allProducts = await productHelper.getAllProducts();
    allProducts.forEach(async (element) => {
      if (element.stock <= 10 && element.stock != 0) {
        element.fewStock = true;
      } else if (element.stock == 0) {
        element.noStock = true;
      }
    });

    let categoryDetails = await productHelper.allCategory();
  
    res.render("user/shop", {
      zoom: true,
      allProducts,
      user,
      categoryDetails,
      cartCount,
      wishlistCount,
    });
  } else {
    let todayDate = new Date().toISOString().slice(0, 10);
     offerHelper.startProductOffer(todayDate);
     offerHelper.startCategoryOffer(todayDate);
     couponHelper.startCouponOffer(todayDate);
    let allProducts = await productHelper.getAllProducts();
    allProducts.forEach(async (element) => {
      if (element.stock <= 10 && element.stock != 0) {
        element.fewStock = true;
      } else if (element.stock == 0) {
        element.noStock = true;
      }
    });
    let categoryDetails = await productHelper.allCategory();
    res.render("user/shop", {
      zoom: true,
      allProducts,
      categoryDetails,
    });
  }
});
// view single product
router.get("/view-product/:id", (req, res) => {
  if (req.session.user) {
    let proId = req.params.id;
    productHelper.getProduct(proId).then(async (response) => {
      let proData = response;
      if (proData.stock <= 10 && proData.stock != 0) {
        proData.fewStock = true;
      } else if (proData.stock == 0) {
        proData.noStock = true;
      } else {
        proData.stock = true;
      }
      let wishItems = await wishlistHelper.findWishlist(proData._id);
      if (wishItems) {
        var wishItem = true;
      }
      let user = req.session.user;
      let cartCount = await cartHelper.getCartCount(req.session.user._id);
      let wishlistCount = await wishlistHelper.getWishlistCount(
        req.session.user._id
      );
      res.render("user/view-product", {
        zoom: true,
        proData,
        wishItem,
        user,
        cartCount,
        wishlistCount,
      });
    });
  } else {
    let proId = req.params.id;
    productHelper.getProduct(proId).then(async (response) => {
      let proData = response;
      res.render("user/view-product", { zoom: true, proData });
    });
  }
});

// find category
router.get("/find-category/:id", verifyLogin, verifyBlockUser, (req, res) => {
  let proId = req.params.id;
  userHelper.findCategory(proId).then((response) => {
    // res.redirect('/user/shop')
  });
});

router.get("/view-catwise/:category", async (req, res) => {
  let category = req.params.category;
  let allCategories = await userHelper.getAllCategories();
  let catWiseProducts = await productHelper.getCatWiseProduct(category);
  try {
    let userId = req.session.user._id;
    let wishlistCount = await wishlistHelper.getWishlistCount(userId);
    let cartCount = await cartHelper.getCartCount(userId);
    catWiseProducts.forEach(async (element) => {
      if (element.stock <= 10 && element.stock != 0) {
        element.fewStock = true;
      } else if (element.stock == 0) {
        element.noStock = true;
      }
    })
    res.render("user/catWise-products", {
      user: req.session.user,
      catWiseProducts,
      allCategories,
      wishlistCount,
      cartCount,
    });
  } catch {
    res.render("user/catWise-products", { catWiseProducts, allCategories });
  }
});
// cart page
router.get("/cart", verifyLogin, verifyBlockUser, async (req, res) => {
  let products = await cartHelper.getCartProducts(req.session.user._id);
  let outOfStock= false
  // let pro = products.product._id
  if(products){
    products.forEach(async (element) => {
      console.log(element.product.stock);
      if(element.product.stock == 0){
        outOfStock=true
      }
    });
  }
  console.log(outOfStock);
  let total = await cartHelper.getTotalAmount(req.session.user._id);
  let wishlistCount = await wishlistHelper.getWishlistCount(
    req.session.user._id
  );
  if (total != 0) {
    res.render("user/cart", {
      products,
      user: req.session.user,
      total,
      wishlistCount,
      outOfStock,
    });
  } else {
    res.render("user/empty-cart", {
      user_cart: true,
      user: req.session.user,
    });
  }
});
router.get(
  "/add-to-cart/:id",
  verifyLoginCart,
  verifyBlockUser,
  async (req, res) => {
    let user = req.session.user;
    let proQuantity = await cartHelper.findCartProdQty(req.session.user._id,req.params.id)
    let product = await productHelper.findStock(req.params.id);
    if (product.stock == 0) {
      res.json({ status: "noStock" });
    } else if(product.stock == proQuantity) {
      res.json({ status: "fewStock" });
    } else if (proQuantity == 3) {
      res.json({ status: "maxLimitStock" });
    } else {
      if (user) {
        cartHelper.addToCart(req.params.id, req.session.user._id).then(() => {
          res.json({ status: "add" });
        });
      } else {
        res.json({ status: "login" });
      }
    }
  }
);

// delete cart
router.get("/delete-cart-item/:cartId/:proId", verifyLogin, (req, res) => {
  let cartId = req.params.cartId;
  let proId = req.params.proId;
  cartHelper.deleteCartItem(cartId, proId).then(() => {
    res.redirect("/cart");
  });
});

router.post(
  "/change-product-quantity",
  verifyLogin,
  verifyBlockUser,
  (req, res) => {
    let userId = req.body.user;
    let proId = req.body.product;
    cartHelper.changeProductQuantity(req.body).then(async (response) => {
      response.total = await cartHelper.getTotalAmount(req.body.user);
      response.cartSubTotal = await cartHelper.getCartSubTotal(userId, proId);
      res.json(response);
    }).catch((response)=>{
      if(response.status || response.noStock ){
        res.json({noStock:true});
      }else {
        res.json({maxLimitStock:true});
      }
    })
  }
);

// place order
router.get("/place-order", verifyLogin, verifyBlockUser, async (req, res) => {
  let cartCount = await cartHelper.getCartCount(req.session.user._id);
  let wishlistCount = await wishlistHelper.getWishlistCount(
    req.session.user._id
  );
  let total = await cartHelper.getTotalAmount(req.session.user._id);
  let wallet = await orderHelper.getWalletAmount(req.session.user._id);
  let showWallet = false;
  if (wallet >= total) {
    showWallet = true;
  }
  let userId = req.session.user._id;
  let userAddress = await userHelper.getAddress(userId);
  res.render("user/place-order", {
    validation: true,
    total,
    showWallet,
    user: req.session.user,
    userAddress,
    cartCount,
    wishlistCount,
  });
});

router.post("/place-order", verifyLogin, verifyBlockUser, async (req, res) => {
  var totalAmount = await cartHelper.getTotalAmount(req.session.user._id);
  let products = await cartHelper.getCartProducts(req.session.user._id);
  if (req.session.couponTotal) {
    totalAmount = req.session.couponTotal;
  }
  if(req.body.payment_method){
  orderHelper.placeOrder(req.body, products, totalAmount).then((orderId) => {
    if (req.body.payment_method === "COD") {
      req.session.couponTotal = null;
      res.json({ codSuccess: true });
    } else if (req.body.payment_method === "paypal") {
      req.session.couponTotal = null;
      orderHelper.generatePaypal(orderId, totalAmount).then((link) => {
        res.json({ link, paypal: true });
      });
    } else if (req.body.payment_method === "wallet") {
      req.session.couponTotal = null;
      orderHelper.reduceWallet(req.session.user._id, totalAmount).then(() => {
        res.json({ wallet: true });
      });
    } else if(req.body.payment_method === "Razorpay") {
      orderHelper.generateRazorpay(orderId, totalAmount).then((response) => {
        req.session.couponTotal = null;
        res.json(response);
      });
    }else{
      res.json(false);
    }
  });
  }else{
    res.json(false);
  }
});
// coupen apply
router.post("/coupon-apply", async (req, res) => {
  let couponCode = req.body.coupon;
  let userId = req.session.user._id;
  let totalPrice = await cartHelper.getTotalAmount(userId);

  couponHelper
    .validateCoupon(couponCode, userId, totalPrice)
    .then((response) => {
      req.session.couponTotal = response.total;
      if (response.success) {
        res.json({
          couponSuccess: true,
          total: response.total,
          discountValue: response.discountValue,
          couponCode,
        });
      } else if (response.couponUsed) {
        res.json({ couponUsed: true });
      } else if (response.couponExpired) {
        res.json({ couponExpired: true });
      } else {
        res.json({ invalidCoupon: true });
      }
    });
});
// order placed tick
router.get("/order-placed", verifyLogin, verifyBlockUser, (req, res) => {
  let user = req.session.user;
  res.render("user/order-placed", { user, order_placed: true });
});
// order list
router.get("/orders", verifyLogin, verifyBlockUser, async (req, res) => {
  let cartCount = await cartHelper.getCartCount(req.session.user._id);
  let wishlistCount = await wishlistHelper.getWishlistCount(
    req.session.user._id
  );
  let orders = await orderHelper.getUserOrders(req.session.user._id);
  res.render("user/orders", {
    user: req.session.user,
    orders,
    cartCount,
    wishlistCount,
  });
});
router.get("/orders/20", verifyLogin, verifyBlockUser, async (req, res) => {
  let cartCount = await cartHelper.getCartCount(req.session.user._id);
  let wishlistCount = await wishlistHelper.getWishlistCount(
    req.session.user._id
  );
  let orders = await orderHelper.getUserOrders20(req.session.user._id);
  res.render("user/orders", {
    user: req.session.user,
    orders,
    cartCount,
    wishlistCount,
  });
});
router.get("/orders/30", verifyLogin, verifyBlockUser, async (req, res) => {
  let cartCount = await cartHelper.getCartCount(req.session.user._id);
  let wishlistCount = await wishlistHelper.getWishlistCount(
    req.session.user._id
  );
  let orders = await orderHelper.getUserOrders30(req.session.user._id);
  res.render("user/orders", {
    user: req.session.user,
    orders,
    cartCount,
    wishlistCount,
  });
});
router.get("/orders/40", verifyLogin, verifyBlockUser, async (req, res) => {
  let cartCount = await cartHelper.getCartCount(req.session.user._id);
  let wishlistCount = await wishlistHelper.getWishlistCount(
    req.session.user._id
  );
  let orders = await orderHelper.getUserOrders40(req.session.user._id);
  res.render("user/orders", {
    user: req.session.user,
    orders,
    cartCount,
    wishlistCount,
  });
});
// view order products
router.get(
  "/view-order-products/:id",
  verifyLogin,
  verifyBlockUser,
  async (req, res) => {
    let orderId  = req.params.id
    let cartCount = await cartHelper.getCartCount(req.session.user._id);
    let wishlistCount = await wishlistHelper.getWishlistCount(
      req.session.user._id
    );
    let products = await orderHelper.getOrderProducts(orderId);
    let orderDetails = await orderHelper.getOrderDetails(orderId);

    let track = await orderHelper.statusTrack(orderId)
    track.date = moment(track.date).format('lll')
    track.shippedDate = moment(track.shippedDate).format('lll')
    track.outOfDeliveryDate = moment(track.outOfDeliveryDate).format('lll')
    track.deliveredDate = moment(track.deliveredDate).format('lll')  
    track.cancelledDate = moment(track.cancelledDate).format('lll')  
    track.pendingDate = moment(track.pendingDate).format('lll')  
    track.refundedDate = moment(track.refundedDate).format('lll')  
    track.returnedDate = moment(track.returnedDate).format('lll')  
    res.render("user/view-order-products", {
      user: req.session.user,
      products,
      cartCount,
      wishlistCount,
      orderDetails,
      track,
    });
  }
);
// cancel order
router.get(
  "/cancel-order/:id",
  verifyLogin,
  verifyBlockUser,
  async (req, res) => {
    let orderId = req.params.id;
    let id = req.session.user._id;
    orderHelper.cancelOrder(orderId).then(async () => {
      let order = await orderHelper.getOrder(orderId);
      if (order) {
        if (order.paymentMethod == "COD") {
          res.redirect("/orders");
        } else {
          let amount = order.totalAmount;
          orderHelper.createWallet(id, orderId, amount);
          res.redirect("/orders");
        }
      }
    });
  }
);
// Return order
router.get(
  "/return-order/:id",
  verifyLogin,
  verifyBlockUser,
  async (req, res) => {
    let orderId = req.params.id;
    let id = req.session.user._id;
    orderHelper.returnOrder(orderId).then(async () => {
      let order = await orderHelper.getOrder(orderId);
      if (order) {
        // if (order.paymentMethod == "COD") {
        //   res.redirect("/orders");
        // } else {
        let amount = order.totalAmount;
        orderHelper.createWallet(id, orderId, amount);
        res.redirect("/orders");
        // }
      }
    });
  }
);

// show show-details in orders table
router.get("/show-details/:id", async (req, res) => {
  let user = req.session.user;
  let showDetails = await userHelper.getUserInvoice(req.params.id);
  res.redirect("/order", { showDetails, user });
});
router.post("/verify-payment", (req, res) => {
  orderHelper
    .verifyPayment(req.body)
    .then((response) => {
      orderHelper.changePaymentStatus(req.body["order[receipt]"]).then(() => {
        res.json({ status: true });
      });
    })
    .catch((err) => {
      res.json({ status: false, errMsg: "" });
    });
});
// profile
router.get("/my-profile", verifyLogin, verifyBlockUser, async (req, res) => {
  let cartCount = await cartHelper.getCartCount(req.session.user._id);
  let wishlistCount = await wishlistHelper.getWishlistCount(
    req.session.user._id
  );
  let userDetails = await userHelper.findWallet(req.session.user._id);
  wallet = userDetails.wallet;
  referrelCode = userDetails.referrelCode;
  let user = await userHelper.userDetails(req.session.user._id);
  res.render("user/my-profile", {
    user: req.session.user,
    user,
    cartCount,
    wallet,
    validation: true,
    referrelCode,
    wishlistCount,
    passwordErr: req.session.passwordErr,
  });
  req.session.passwordErr = false;
});
// edit profile pic 
router.post("/edit-profile-pic", verifyLogin, (req, res) => {
  let image = req.files.image;
  let id = req.session.user._id;
  image.mv("./public/profile-images/" + id + ".jpg");
  res.redirect("/my-profile");
});
// add address
router.post("/add-address", verifyLogin, verifyBlockUser, (req, res) => {
  let address = req.body;
  let userId = req.session.user._id;
  userHelper.addAddress(address, userId).then(() => {
    res.redirect("/my-profile");
  });
});
// add address in placeorder page
router.get('/addAddress', verifyLogin, verifyBlockUser, async (req,res)=>{
  let cartCount = await cartHelper.getCartCount(req.session.user._id);
  let wishlistCount = await wishlistHelper.getWishlistCount(
    req.session.user._id
  );
  res.render("user/addAddress", {
    validation: true,
    user: req.session.user,
    cartCount,
    wishlistCount,
  });
})

router.post("/addAddress", verifyLogin, verifyBlockUser, (req, res) => {
  let address = req.body;
  let userId = req.session.user._id;
  userHelper.addAddress(address, userId).then(() => {
    res.redirect("/place-order");
  });
});
// edit profile
router.post("/edit-profile", verifyLogin, verifyBlockUser, (req, res) => {
  userHelper.editProfile(req.body).then(() => {
    res.redirect("/my-profile");
  });
});
// edit address
router.post("/edit-address", (req,res)=>{
  let userId=req.session.user._id
   userHelper.editAddress(req.body,userId).then((response)=>{
     res.json({status:true})
    // res.redirect('/my-profile')
    }).catch(()=>{
     res.json({status:false})
    })
 })
// delete address
router.get("/delete-address/:id", (req, res) => {
  let userId = req.session.user._id;
  userHelper.deleteAddress(userId, req.params.id);
  res.redirect("/my-profile");
});

// password change
router.post("/change-password", verifyLogin, verifyBlockUser, (req, res) => {
  let userId = req.session.user._id;
  userHelper
    .changePassword(req.body, userId)
    .then(() => {
      res.json({ status: true });
    })
    .catch(() => {
      res.json({ status: false });
    });
});

// wishlist
router.get("/wishlist", verifyLogin, verifyBlockUser, async (req, res) => {
  let products = await wishlistHelper.getWishlistProducts(req.session.user._id);
  let cartCount = await cartHelper.getCartCount(req.session.user._id);

  if (products.length != 0) {
    res.render("user/wishlist", {
      products,
      user: req.session.user,
      cartCount,
    });
  } else {
    res.render("user/empty-wishlist", {
      wishlist: true,
      user: req.session.user,
    });
  }
});
router.get("/add-to-wishlist/:id", async (req, res) => {
  user = req.session.user;
  if (user) {
    let proId = req.params.id;
    let userId = user._id;
    wishlistHelper
      .addToWishlist(userId, proId)
      .then(() => {
        res.json({ status: "add" });
      })
      .catch(() => {
        res.json({ status: "remove" });
      });
  } else {
    res.json({ status: "login" });
  }
});
router.get("/delete-wish-item/:proId/:wishId", (req, res) => {
  wishlistHelper
    .deleteWishlist(req.params.proId, req.params.wishId)
    .then(() => {
      res.json({ status: true });
    });
});
// invoice
router.get("/invoice/:id", verifyLogin, async (req, res) => {
  let user = req.session.user;
  let invoice = await userHelper.getUserInvoice(req.params.id);
  let products = await orderHelper.getOrderProducts(req.params.id);
  res.render("user/invoice", { user, invoice, products });
});

// logout
router.get("/logout", verifyLogin, (req, res) => {
  req.session.user = null;
  // req.session.destroy()
  res.redirect("/");
});

module.exports = router;
