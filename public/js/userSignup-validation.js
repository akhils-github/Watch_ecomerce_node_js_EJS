var nameError = document.getElementById("name-error");
var emailError = document.getElementById("email-error");
var phoneError = document.getElementById("phone-error");
var passwordError = document.getElementById("password-error");

// var subjectError = document.getElementById('phone-error');
var messageError = document.getElementById("message-error");
var submitError = document.getElementById("submit-error");

//name validate
function validateName() {
  var name = document.getElementById("contact-name").value.trim();

  if (name.length == 0) {
    nameError.innerHTML = "Name is Required";
    nameError.style.color = "red";
    return false;
  }

  if (name.length < 4) {
    nameError.innerHTML = "Minimum length is 4";
    nameError.style.color = "red";
    return false;
  }

  if (!name.match(/^[A-Za-z ]*$/)) {
    nameError.innerHTML = "Enter a valid name";
    nameError.style.color = "red";
    return false;
  }

  nameError.innerHTML = "Name is valid";
  nameError.style.color = "green";
  return true;
}

//email validate
function validateEmail() {
  var email = document.getElementById("contact-email").value.trim();
  if (email.length == 0) {
    emailError.innerHTML = "Email is Required";
    emailError.style.color = "red";
    return false;
  }

  if (
    !email.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{3,}))$/
    )
  ) {
    emailError.innerHTML = "Email is Invalid";
    emailError.style.color = "red";
    return false;
  }
  emailError.innerHTML = "Email is valid";
  emailError.style.color = "green";
  return true;
}

//validate phone number
function validatePhone() {
  var phone = document.getElementById("contact-phone").value.trim();
  if (phone.length == 0) {
    phoneError.innerHTML = "Phone number is Required";
    phoneError.style.color = "red";
    return false;
  }
  if (phone.length <= 9) {
    phoneError.innerHTML = "Enter Valid Phone Number";
    phoneError.style.color = "red";
    return false;
  }
  if (phone.length >= 11) {
    phoneError.innerHTML = "Phone Number Must be 10 Digits";
    phoneError.style.color = "red";
    return false;
  }
  if (!phone.match(/^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/)) {
    phoneError.innerHTML = "Phonenumber must be digits";
    phoneError.style.color("red");

    return false;
  }
  phoneError.innerHTML = "Phone Number is valid";
  phoneError.style.color = "green";
  return true;
}

function validatePassword() {
  var pw = document.getElementById("password").value;
  //check empty password field
  if (pw == "") {
    passwordError.innerHTML = "password is required";
    passwordError.style.color = "red";
    return false;
  }

  //minimum password length validation
  if (pw.length < 8) {
    passwordError.innerHTML = "Password length must be atleast 8 characters";
    passwordError.style.color = "red";
    return false;
  }

  //maximum length of password validation
  if (pw.length > 15) {
    passwordError.innerHTML = "Password length must not exceed 15 characters";
    passwordError.style.color = "red";
    return false;
  } else {
    passwordError.innerHTML = "Password is correct";
    passwordError.style.color = "green";
    return true;
  }
}

// message validation

// function validateSubject() {
//     var subject=document.getElementById('contact-subject').value.trim();
//     var Required=4;
//     var left=Required - subject.length;

//     if(left>0){
//         subjectError.innerHTML =left+ 'more character Required';
//         subjectError.style.color='red'
//         return false;

//     }
//     subjectError.innerHTML='Message is valid';
//     subjectError.style.color='green'
//     return true;

// }

// function validateMessage() {
//     var message =document.getElementById('contact-message').value.trim();
//     var Required=15;
//     var left=Required - message.length;

//     if(left>0){
//         messageError.innerHTML =left+ 'more character Required';
//         messageError.style.color='red'
//         return false;

//     }
//     messageError.innerHTML='Message is valid';
//     messageError.style.color='green'
//     return true;

// }
$(document).on("submit", "form", function (e) {
  console.log(validateName());
  console.log(validateEmail());
  console.log(validatePhone());
  console.log(validatePassword());
  // validateName()
  // validateEmail()
  // validatePhone()
  // validatePassword()

  if (
    validateName() &&
    validateEmail() &&
    validatePhone() &&
    validatePassword()
  ) {
  } else {
    e.preventDefault();
    console.log("function call");
    swal.fire("Invalid data! Please Fullfill the form correctly");
    return true;
  }
});

// function validateForm(f1,f2)
// {
//    var x=document.forms[f1,f2]["audit_id_upload"].value;
//    if (x==null || x=="")
//    {
//       alert("Please Select an Audit");
//       return false;
//    }
//    return true;
// }
