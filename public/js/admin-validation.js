// add product
$(document).ready(function () {
  $("#add-prod").validate({
    rules: {
      name: {
        required: true,
        minlength: 4,
      },
      category: {
        required: true,
      },
      price: {
        required: true,
        number: true,
      },
      stock: {
        required: true,
        number: true,
      },
      description: {
        required: true,
      },
      image1: {
        required: true,
      },
      image2: {
        required: true,
      },
      image3: {
        required: true,
      },
      image4: {
        required: true,
      },
    },
  });
});
// add product
$(document).ready(function () {
  $("#edit-prod").validate({
    rules: {
      name: {
        required: true,
        minlength: 4,
      },
      category: {
        required: true,
      },
      price: {
        required: true,
        number: true,
        digits:true,
      },
      stock: {
        required: true,
        number: true,
        digits:true,
      },
      description: {
        required: true,
      },
    },
  });
});
// add category
$(document).ready(function () {
  $("#add-category").validate({
    rules: {
      category: {
        required: true,
      },
    },
  });
});
// login validation
$(document).ready(function () {
  $("#admin-login").validate({
    rules: {
      email: {
        required: true,
        email: true,
      },
      password: {
        required: true,
        minlength: 8,
        maxlength: 15,
      },
    },
  });
});
// coupon validation
$(document).ready(function () {
  $("#coupon-page").validate({
    rules: {
      coupon: {
        required: true,
      },
      starting: {
        required: true,
      },
      expiry: {
        required: true,
      },
      offer: {
        required: true,
        number: true,
        minlength: 1,
        maxlength: 2,
      },
    },
  });
});
// Edit coupon validation
$(document).ready(function () {
  $("#edit-coupon").validate({
    rules: {
      coupon: {
        required: true,
      },
      starting: {
        required: true,
      },
      expiry: {
        required: true,
      },
      offer: {
        required: true,
        number: true,
        minlength: 1,
        maxlength: 2,
      },
    },
  });
});
// category offer
$(document).ready(function () {
  $("#category-offer").validate({
    rules: {
      category: {
        required: true,
      },
      starting: {
        required: true,
      },
      expiry: {
        required: true,
      },
      catOfferPercentage: {
        required: true,
        number: true,
        minlength: 1,
        maxlength: 2,
      },
    },
  });
});
// edit category offer
$(document).ready(function () {
  $("#edit-categoryOffer").validate({
    rules: {
      category: {
        required: true,
      },
      starting: {
        required: true,
      },
      expiry: {
        required: true,
      },
      catOfferPercentage: {
        required: true,
        number: true,
        minlength: 1,
        maxlength: 2,
      },
    },
  });
});
// product offer
$(document).ready(function () {
  $("#product-offer").validate({
    rules: {
      product: {
        required: true,
      },
      starting: {
        required: true,
      },
      expiry: {
        required: true,
      },
      proOfferPercentage: {
        required: true,
        number: true,
        minlength: 1,
        maxlength: 2,
      },
    },
  });
});
// Edit product offer
$(document).ready(function () {
  $("#edit-prodOffer").validate({
    rules: {
      product: {
        required: true,
      },
      starting: {
        required: true,
      },
      expiry: {
        required: true,
      },
      proOfferPercentage: {
        required: true,
        number: true,
        minlength: 1,
        maxlength: 2,
      },
    },
  });
});
// add banner
$(document).ready(function () {
  $("#add-banner").validate({
    rules: {
      name: {
        required: true,
        minlength:4,
      },
      offer: {
        required: true,
        minlength:2,
      },
      subname: {
        required: true,
        minlength:4,
      },
      image: {
        required: true,
      },
    },
  });
});
// edit banner
$(document).ready(function () {
  $("#edit-banner").validate({
    rules: {
      name: {
        required: true,
        minlength:4,
      },
      offer: {
        required: true,
        minlength:2,
      },
      subname: {
        required: true,
        minlength:4,
      },
    },
  });
});
