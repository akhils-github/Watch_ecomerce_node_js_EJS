// addAddress form my profile
$(document).ready(function () {
  $("#addAddress-form").validate({
    rules: {
      name: {
        required: true,
        minlength: 4,
      },
      address: {
        required: true,
        minlength: 4,
      },
      town: {
        required: true,
        minlength: 3,
      },
      district: {
        required: true,
        minlength: 3,
      },
      state: {
        required: true,
        minlength: 3,
      },
      pincode: {
        required: true,
        number: true,
        minlength: 5,
        maxlength: 8,
      },
      phone: {
        required: true,
        number: true,
        minlength: 10,
        maxlength: 10,
      },
      payment_method: {
        required: true,
      },
    },
  });
});
// checkout side addAddress form
$(document).ready(function () {
  $("#addAddress").validate({
    rules: {
      name: {
        required: true,
        minlength: 4,
      },
      address: {
        required: true,
        minlength: 4,
      },
      town: {
        required: true,
        minlength: 3,
      },
      district: {
        required: true,
        minlength: 3,
      },
      state: {
        required: true,
        minlength: 3,
      },
      pincode: {
        required: true,
        number: true,
        minlength: 5,
        maxlength: 8,
      },
      phone: {
        required: true,
        number: true,
        minlength: 10,
        maxlength: 10,
      },
      payment_method: {
        required: true,
      },
    },
  });
});
// checkout side edit-address modal
$(document).ready(function () {
  $("#edit-address").validate({
    rules: {
      name: {
        required: true,
        minlength: 4,
      },
      address: {
        required: true,
        minlength: 4,
      },
      town: {
        required: true,
        minlength: 3,
      },
      district: {
        required: true,
        minlength: 3,
      },
      state: {
        required: true,
        minlength: 3,
      },
      pincode: {
        required: true,
        number: true,
        minlength: 5,
        maxlength: 8,
      },
      phone: {
        required: true,
        number: true,
        minlength: 10,
        maxlength: 10,
      },
      payment_method: {
        required: true,
      },
    },
  });
});

// checkout side check box
$(document).ready(function () {
  $("#checkout-address").validate({
    rules: {
      fullAddress: {
        required: true,
      },
      test: {
        required: true,
      },
    },
  });
});
// login validation
$(document).ready(function () {
  $("#user-login").validate({
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
// edit profile validation
$(document).ready(function () {
  $("#edit-profile").validate({
    rules: {
      email: {
        required: true,
        email: true,
      },
      username: {
        required: true,
        minlength: 4,
      },
      mobileno: {
        required: true,
        minlength: 10,
        maxlength: 10,
      },
    },
  });
});
// change password page
$(document).ready(() => {
  $("#changePassword").validate({
    rules: {
      password: {
        required: true,
      },
      newPassword: {
        required: true,
      },
    },
  });
});
// number page
$(document).ready(() => {
  $("#number").validate({
    rules: {
      phone: {
        required: true,
        minlength: 10,
        maxlength: 10,
      },
    },
  });
});
// otp page
$(document).ready(() => {
  $("#otp").validate({
    rules: {
      otp: {
        required: true,
        minlength: 6,
        maxlength: 6,
      },
    },
  });
});
