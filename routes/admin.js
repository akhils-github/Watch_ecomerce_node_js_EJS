var express = require("express");
const { response } = require("../app");
var router = express.Router();
const fs = require("fs");
const adminHelper = require("../helpers/admin-helper");
const productHelper = require("../helpers/product-helper");
const cartHelper = require("../helpers/cart-helper");
const orderHelper = require("../helpers/order-helper");
const offerHelper = require("../helpers/offer-helper");
const couponHelper = require("../helpers/coupon-helper");
const bannerHelper = require("../helpers/banner-helper");

// verify login middleware
const verifyAdminLogin = (req, res, next) => {
  if (req.session.admin) {
    next();
  } else {
    res.redirect("/admin/login");
  }
};

/* GET users listing. */
// admin dashboard
router.get("/", async (req, res, next) => {
  let adminSession = req.session.admin;
  if (adminSession) {
    let allCount = await adminHelper.getDashboardCount();
    let totalRevenue = await adminHelper.totalRevenue();
    let dailyRevenue = await adminHelper.dailyRevenue();
    let weeklyRevenue = await adminHelper.weeklyRevenue();
    let monthlyRevenue = await adminHelper.monthlyRevenue();
    let yearlyRevenue = await adminHelper.yearlyRevenue();
    let data=await adminHelper.monthlyReport()
  
    res.render("admin/dashboard", {
      admin: true,
      adminSession,
      allCount,
      dailyRevenue,
      totalRevenue,
      monthlyRevenue,
      weeklyRevenue,
      yearlyRevenue,
      data,
    });
  } else {
    res.redirect("/admin/login");
  }
});
// chart data
router.get("/chart-data", verifyAdminLogin, (req, res) => {
  adminHelper.getchartData().then((obj) => {
    let result = obj.result;
    let weeklyReport = obj.weeklyReport;
    res.json({ data: result, weeklyReport });
  });
});

// admin login
router.get("/login", (req, res, next) => {
  if (req.session.admin) {
    res.redirect("/admin");
  } else {
    res.render("admin/login", {
      admin: true,
      adminLogin: true,
      validation: true,
      loginErr: req.session.loginErr,
    });
    req.session.loginErr = false;
  }
});
router.post("/login", (req, res) => {
  if (
    req.body.email == process.env.ADMIN_EMAIL &&
    req.body.password == process.env.ADMIN_PASSWORD
  ) {
    req.session.loggedIn = true;
    req.session.admin = process.env.ADMIN_USERNAME;
    res.redirect("/admin");
  } else {
    req.session.loginErr = "Invalid Email or Password";
    res.redirect("/admin/login");
  }
});

// add admin
router.get("/add-admin", (req, res) => {
  let adminSession = req.session.admin;
  res.render("admin/add-admin", {
    admin: true,
    adminSession,
    addErr: req.session.addErr,
  });
  req.session.addErr = false;
});

router.post("/add-admin", (req, res) => {
  adminHelper.addAdmin(req.body).then((response) => {
    if (response.status) {
      res.redirect("login");
    } else {
      req.session.addErr = "This Email Already Exists!";
      res.redirect("/admin/add-admin");
    }
  });
});

// show product list
router.get("/products", verifyAdminLogin, (req, res, next) => {
  let adminSession = req.session.admin;
  productHelper.getAllProducts().then((response) => {
    let allProducts = response;
    res.render("admin/products", { allProducts, admin: true, adminSession });
  });
});
router.get("/products/20", verifyAdminLogin, (req, res, next) => {
  let adminSession = req.session.admin;
  productHelper.getAllProducts20().then((response) => {
    let allProducts = response;
    res.render("admin/products", { allProducts, admin: true, adminSession });
  });
});
router.get("/products/30", verifyAdminLogin, (req, res, next) => {
  let adminSession = req.session.admin;
  productHelper.getAllProducts30().then((response) => {
    let allProducts = response;
    res.render("admin/products", { allProducts, admin: true, adminSession });
  });
});
router.get("/products/40", verifyAdminLogin, (req, res, next) => {
  let adminSession = req.session.admin;
  productHelper.getAllProducts40().then((response) => {
    let allProducts = response;
    res.render("admin/products", { allProducts, admin: true, adminSession });
  });
});

// product adding
router.get("/add-product", verifyAdminLogin, (req, res, next) => {
  let adminSession = req.session.admin;
  productHelper.allCategory().then((response) => {
    let allCategoryDetails = response;
    res.render("admin/add-product", {
      admin: true,
      validation: true,
      adminSession,
      allCategoryDetails,
      productExistErr: req.session.productExistErr,
    });
    req.session.productExistErr = false;
  });
});

router.post("/add-product", verifyAdminLogin, (req, res, next) => {
  productHelper
    .addProduct(req.body)
    .then((response) => {
      let id = response.insertedId;
      let Image1 = req.files.image1;
      let Image2 = req.files.image2;
      let Image3 = req.files.image3;
      let Image4 = req.files.image4;

      Image1.mv("./public/product-image/" + id + "a.jpg");
      Image2.mv("./public/product-image/" + id + "b.jpg");
      Image3.mv("./public/product-image/" + id + "c.jpg");
      Image4.mv("./public/product-image/" + id + "d.jpg");

      res.redirect("/admin/products");
    })
    .catch((err) => {
      if (err) {
        req.session.productExistErr = "This Product is Exists";
        res.redirect("/admin/add-product");
      }
    });
});

// product edit
router.get("/edit-product/:id", verifyAdminLogin, async (req, res) => {
  let adminSession = req.session.admin;
  let proDetails = await productHelper.getProductDetails(req.params.id);
  productHelper.allCategory().then((response) => {
    let allCategoryDetails = response;
    res.render("admin/edit-product", {
      proDetails,
      admin: true,
      validation: true,
      adminSession,
      allCategoryDetails,
    });
  });
});

router.post("/edit-product", verifyAdminLogin, (req, res) => {
  let proData = req.body;
  productHelper.editProduct(proData).then((reponse) => {
    try {
      if (req.files.image1) {
        let id = proData.id;
        let Image1 = req.files.image1;
        Image1.mv("./public/product-image/" + id + "a.jpg");
      }
      if (req.files.image2) {
        let id = proData.id;
        let Image2 = req.files.image2;
        Image2.mv("./public/product-image/" + id + "b.jpg");
      }
      if (req.files.image3) {
        let id = proData.id;
        let Image3 = req.files.image3;
        Image3.mv("./public/product-image/" + id + "c.jpg");
      }
      if (req.files.image4) {
        let id = proData.id;
        let Image4 = req.files.image4;
        Image4.mv("./public/product-image/" + id + "d.jpg");
      }
      res.redirect("/admin/products");
    } catch {
      res.redirect("/admin/products");
    }
  });
});

// product delete
router.get("/delete-product/:id", verifyAdminLogin, (req, res) => {
  let id = req.params.id;
  productHelper.deleteProduct(id).then(() => {
    res.redirect("/admin/products");
    try {
      fs.unlinkSync("public/product-image/" + id + "a.jpg");
      fs.unlinkSync("public/product-image/" + id + "b.jpg");
      fs.unlinkSync("public/product-image/" + id + "c.jpg");
      fs.unlinkSync("public/product-image/" + id + "d.jpg");
    } catch {
      res.redirect("/admin/products");
    }
  });
});

// user managing view all users
router.get("/user-management", verifyAdminLogin, async (req, res) => {
  let adminSession = req.session.admin;
  await adminHelper.getAllUsers().then((response) => {
    let allUsers = response;
    res.render("admin/user-management", {
      admin: true,
      allUsers,
      adminSession,
    });
  });
});
router.get("/user-management/20", verifyAdminLogin, async (req, res) => {
  let adminSession = req.session.admin;
  await adminHelper.getAllUsers20().then((response) => {
    let allUsers = response;
    res.render("admin/user-management", {
      admin: true,
      allUsers,
      adminSession,
    });
  });
});
router.get("/user-management/30", verifyAdminLogin, async (req, res) => {
  let adminSession = req.session.admin;
  await adminHelper.getAllUsers30().then((response) => {
    let allUsers = response;
    res.render("admin/user-management", {
      admin: true,
      allUsers,
      adminSession,
    });
  });
});
router.get("/user-management/40", verifyAdminLogin, async (req, res) => {
  let adminSession = req.session.admin;
  await adminHelper.getAllUsers40().then((response) => {
    let allUsers = response;
    res.render("admin/user-management", {
      admin: true,
      allUsers,
      adminSession,
    });
  });
});

// user blocking
router.get("/block-user/:id", verifyAdminLogin, (req, res) => {
  let userId = req.params.id;
  adminHelper.blockUser(userId).then((response) => {
    res.redirect("/admin/user-management");
  });
});

// user unblocking
router.get("/unblock-user/:id", verifyAdminLogin, (req, res) => {
  let userId = req.params.id;
  adminHelper.unblockUser(userId).then((response) => {
    res.redirect("/admin/user-management");
  });
});

// delete user
router.get("/delete-user/:id", verifyAdminLogin, (req, res) => {
  let userId = req.params.id;
  adminHelper.deleteUser(userId).then((response) => {
    res.redirect("/admin/user-management");
  });
});
// show all category
router.get("/category-management", verifyAdminLogin, (req, res) => {
  let adminSession = req.session.admin;
  adminHelper.getAllCategory().then((response) => {
    allCategory = response;
    res.render("admin/category-management", {
      admin: true,
      allCategory,
      adminSession,
    });
  });
});
router.get("/category-management/20", verifyAdminLogin, (req, res) => {
  let adminSession = req.session.admin;
  adminHelper.getAllCategory20().then((response) => {
    allCategory = response;
    res.render("admin/category-management", {
      admin: true,
      allCategory,
      adminSession,
    });
  });
});
router.get("/category-management/30", verifyAdminLogin, (req, res) => {
  let adminSession = req.session.admin;
  adminHelper.getAllCategory30().then((response) => {
    allCategory = response;
    res.render("admin/category-management", {
      admin: true,
      allCategory,
      adminSession,
    });
  });
});
router.get("/category-management/40", verifyAdminLogin, (req, res) => {
  let adminSession = req.session.admin;
  adminHelper.getAllCategory40().then((response) => {
    allCategory = response;
    res.render("admin/category-management", {
      admin: true,
      allCategory,
      adminSession,
    });
  });
});

// add category
router.get("/add-category", verifyAdminLogin, (req, res) => {
  let adminSession = req.session.admin;
  res.render("admin/add-category", {
    admin: true,
    validation: true,
    catagoryErr: req.session.catagoryErr,
    adminSession,
  });
  req.session.catagoryErr = false;
});

router.post("/add-category", verifyAdminLogin, (req, res) => {
  adminHelper.addCategory(req.body).then((response) => {
    if (response.status) {
      res.redirect("/admin/category-management");
    } else {
      req.session.catagoryErr = "Item Already Exists";
      res.redirect("/admin/add-category");
    }
  });
});
// edit category
router.get("/edit-category/:id", verifyAdminLogin, async (req, res) => {
  let adminSession = req.session.admin;
  let catagoryDetails = await adminHelper.getCategory(req.params.id);
  res.render("admin/edit-category", {
    admin: true,
    validation: true,
    catagoryDetails,
    adminSession,
    catagoryErr: req.session.catagoryErr,
  });
  req.session.catagoryErr = false;
});

router.post("/edit-category", verifyAdminLogin, async (req, res) => {
  let categoryData = req.body;
  await adminHelper.editCategory(categoryData).then((response) => {
    if (response.status) {
      res.redirect("/admin/category-management");
    } else {
      req.session.catagoryErr = "This Item Already Exists";
      res.redirect("/admin/edit-category/" + categoryData.id);
    }
  });
});

// delete category
router.get("/delete-category/:id", verifyAdminLogin, (req, res) => {
  let userId = req.params.id;
  adminHelper.deleteCategory(userId).then((response) => {
    res.redirect("/admin/category-management");
  });
});
// all orders
router.get("/all-orders", verifyAdminLogin, (req, res) => {
  adminHelper.getAllUserOrders().then((response) => {
    let allOrderDetails = response;
    res.render("admin/all-orders", {
      admin: true,
      adminSession: req.session.admin,
      allOrderDetails,
    });
  });
});
router.get("/all-orders/20", verifyAdminLogin, (req, res) => {
  adminHelper.getAllUserOrders20().then((response) => {
    let allOrderDetails = response;
    res.render("admin/all-orders", {
      admin: true,
      adminSession: req.session.admin,
      allOrderDetails,
    });
  });
});
router.get("/all-orders/30", verifyAdminLogin, (req, res) => {
  adminHelper.getAllUserOrders30().then((response) => {
    let allOrderDetails = response;
    res.render("admin/all-orders", {
      admin: true,
      adminSession: req.session.admin,
      allOrderDetails,
    });
  });
});
router.get("/all-orders/40", verifyAdminLogin, (req, res) => {
  adminHelper.getAllUserOrders40().then((response) => {
    let allOrderDetails = response;
    res.render("admin/all-orders", {
      admin: true,
      adminSession: req.session.admin,
      allOrderDetails,
    });
  });
});

// show description
router.get("/show-description/:id",verifyAdminLogin, async (req, res) => {
  let products = await productHelper.getOrderProducts(req.params.id);
  res.render("admin/show-description", {
    admin: true,
    adminSession: req.session.admin,
    products,
  });
});

// order status
router.post("/order-status", verifyAdminLogin, async (req, res) => {
  let status = req.body.status;
  let orderId = req.body.orderId;
  let id = req.body.userId;

  adminHelper.orderStatusChange(status, orderId).then((status) => {
    if (status.isCancelled) {
      orderHelper.cancelOrder(orderId).then(async () => {
        let order = await orderHelper.getOrder(orderId);
        if (order) {
          if (order.paymentMethod == "COD") {
            res.redirect("/admin/all-orders");
          } else {
            let amount = order.totalAmount;
            orderHelper.createWallet(id, orderId, amount);
            res.redirect("/admin/all-orders");
          }
        }
      });
    } else {
      adminHelper.orderStatusChange(status, orderId).then(() => {
        res.redirect("/admin/all-orders");
      });
    }
  });
});

router.get("/view-order-details/:id", verifyAdminLogin, async (req, res) => {
  let products = await orderHelper.getOrderProducts(req.params.id);
  let orderDetails = await orderHelper.getOrderDetails(req.params.id);
  res.render("admin/view-order-details", {
    admin: true,
    adminSession: req.session.admin,
    products,
    orderDetails,
  });
});

// coupon management
router.get("/coupon-management", verifyAdminLogin, async (req, res) => {
  let allCoupons = await couponHelper.getAllCoupons();
  res.render("admin/coupon-management", {
    admin: true,
    validation: true,
    adminSession: req.session.admin,
    couponExist: req.session.couponExist,
    allCoupons,
  });
  req.session.couponExist = false;
});
// add coupon
router.post("/add-coupon", verifyAdminLogin, (req, res) => {
  couponHelper
    .addCoupon(req.body)
    .then(() => {
      res.redirect("/admin/coupon-management");
    })
    .catch(() => {
      req.session.couponExist = "Coupon Already Exists !!!";
      res.redirect("/admin/coupon-management");
    });
});
// edit coupon
router.get("/edit-coupon/:_id", verifyAdminLogin, async (req, res) => {
  let couponId = req.params._id;
  let couponDetails = await couponHelper.getCouponDetails(couponId);
  res.render("admin/edit-coupon", {
    admin: true,
    validation:true,
    adminSession: req.session.admin,
    couponDetails,
  });
});
router.post("/edit-coupon/:_id", verifyAdminLogin, (req, res) => {
  let couponId = req.params._id;
  let data = req.body;
  couponHelper.editCoupon(data, couponId).then(() => {
    res.redirect("/admin/coupon-management");
  })
});
// delete coupon
router.get("/delete-coupon/:_id", verifyAdminLogin, (req, res) => {
  let couponId = req.params._id;
  couponHelper.deleteCoupon(couponId).then(() => {
    res.redirect("/admin/coupon-management");
  });
});
// product offer management
router.get("/product-offers", verifyAdminLogin, async (req, res) => {
  let allProducts = await productHelper.getAllProducts();
  let prodOffers = await offerHelper.getAllProductOffers();
  res.render("admin/product-offers", {
    admin: true,
    validation: true,
    adminSession: req.session.admin,
    allProducts,
    prodOffers,
    prodOfferErr:req.session.prodOfferErr
  });
  req.session.prodOfferErr=false

});
router.post("/product-offers", verifyAdminLogin, async (req, res) => {
  offerHelper.addProductOffer(req.body).then(() => {
    res.redirect("/admin/product-offers");
  }).catch(()=>{
    req.session.prodOfferErr="This Offer Already Exists!"
    res.redirect("/admin/product-offers");
  })
});
// edit prod offer
router.get("/edit-prodOffer/:_id", verifyAdminLogin, async (req, res) => {
  let proOfferId = req.params._id;
  let proOfferDetails = await offerHelper.getProdOfferDetails(proOfferId);
  res.render("admin/edit-prodOffer", {
    admin: true,
    validation:true,
    adminSession: req.session.admin,
    proOfferDetails,
  });
});
router.post("/edit-prodOffer/:_id", verifyAdminLogin, (req, res) => {
  let proOfferId = req.params._id;
  offerHelper.editProdOffer(proOfferId, req.body).then(() => {
    res.redirect("/admin/product-offers");
  })
});
// delete prod offer
router.get("/delete-prodOffer/:_id", verifyAdminLogin, (req, res) => {
  let proOfferId = req.params._id;
  offerHelper.deleteProdOffer(proOfferId).then(() => {
    res.redirect("/admin/product-offers");
  });
});
// category offer management
router.get("/category-offers", verifyAdminLogin, async (req, res) => {
  let allCategories = await offerHelper.getAllCategories();
  let CatOffers = await offerHelper.getAllCatOffers();
  res.render("admin/category-offers", {
    admin: true,
    validation: true,
    adminSession: req.session.admin,
    allCategories,
    CatOffers,
    catOfferErr:req.session.catOfferErr
  });
  req.session.catOfferErr=false
});
router.post("/category-offers", verifyAdminLogin, (req, res) => {
  offerHelper.addCatOffer(req.body).then(() => {
    res.redirect("/admin/category-offers");
  }).catch(()=>{
    req.session.catOfferErr="This Offer Already Exists!"
    res.redirect("/admin/category-offers");
  })
});
// edit category offer
router.get("/edit-catOffer/:_id", verifyAdminLogin, async (req, res) => {
  let catOfferId = req.params._id;
  let catOfferDetails = await offerHelper.getCatOfferDetails(catOfferId);
  res.render("admin/edit-catOffer", {
    admin: true,
    validation:true,
    adminSession: req.session.admin,
    catOfferDetails,
  });
});
router.post("/edit-catOffer/:_id", verifyAdminLogin, (req, res) => {
  let catOfferId = req.params._id;
  offerHelper.editCatOffer(catOfferId, req.body).then(() => {
    res.redirect("/admin/category-offers");
  });
});
// delete category offer
router.get("/delete-catOffer/:_id", verifyAdminLogin, async (req, res) => {
  let catOfferId = req.params._id;
  await offerHelper.deleteCatOffer(catOfferId);
  res.redirect("/admin/category-offers");
});
// sales report
router.get("/sales-report", verifyAdminLogin, (req, res) => {
  let adminSession = req.session.admin;
  adminHelper.getAllUserOrders().then((response) => {
    let salesReport = response;
    res.render("admin/sales-report", {
      admin: true,
      datatable: true,
      adminSession,
      salesReport,
    });
  });
});

// banner management
router.get('/banner-management', verifyAdminLogin, (req, res, next) => {
  let adminSession = req.session.admin
  bannerHelper.getAllBanners().then((banners) => {
    let allbanners =banners
      res.render('admin/banner-management', { allbanners, admin: true, adminSession })
  })
})

// add banner
router.get('/add-banner', verifyAdminLogin, (req, res, next) => {
  let adminSession = req.session.admin
  res.render('admin/add-banner', { admin: true, validation:true, adminSession, bannerRepeatError:req.session.bannerRepeatError })
  req.session.bannerRepeatError = false
})
router.post('/add-banner', verifyAdminLogin, (req, res) => {
  bannerHelper.addBanner(req.body).then((response) => {
      let id = response.insertedId
      let image = req.files.image
      image.mv('./public/banner-images/' + id + '1.jpg')
      res.redirect('/admin/banner-management')
  }).catch(() => {
      req.session.bannerRepeatError = "Banner already added!!"
      res.redirect('/admin/add-banner')
  })
})

// edit banner
router.get('/edit-banner/:id', verifyAdminLogin, (req, res) => {
  let adminSession = req.session.admin
  let id = req.params.id
  bannerHelper.getBannerDetails(id).then((bannerDetails) => {
      res.render('admin/edit-banner', { admin: true, validation:true, bannerDetails, adminSession })
  })
})
router.post('/edit-banner', (req, res) => {
  let id = req.body._id
  bannerHelper.editBanner(req.body).then(() => {
    try{
      if (req.files.image) {
          let image = req.files.image
          image.mv('./public/banner-images/' + id + '1.jpg')
      }
      res.redirect('/admin/banner-management')
    }catch{
      res.redirect('/admin/banner-management')
    }
  })
})

// delete banner
router.get('/delete-banner/:id', verifyAdminLogin, (req, res) => {
  let id = req.params.id
  bannerHelper.deleteBanner(id).then(() => {
      res.redirect('/admin/banner-management')
      fs.unlinkSync('public/banner-images/' + id + '1.jpg')
    })
});

// logout
router.get("/logout", verifyAdminLogin, (req, res) => {
  req.session.admin = null;
  // req.session.destroy();
  res.redirect("/admin");
});

module.exports = router;
