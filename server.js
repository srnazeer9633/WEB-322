const HTTP_PORT = process.env.PORT || 8080;
const exp = require("express");
const app = exp();
const path = require("path");
const bodyParser = require("body-parser");
const handlebars = require("express-handlebars");
app.use(exp.static("static"));

app.engine(".hbs", handlebars.engine({ extname: ".hbs" }));
app.set("view engine", ".hbs");
app.use(bodyParser.urlencoded({ extended: true }));

//mongoose connection setup
const mongoose = require("mongoose");

//mongoose registration schema setup
const register = mongoose.createConnection("mongodb+srv://srnazeer:Mongoguy123@senecaweb.d5smcuf.mongodb.net/?retryWrites=true&w=majority");
const registerSchema = new mongoose.Schema({firstname: String,lastname: String, email: String, password: String, confirmpassword: String, phn: String, address: String});

//mongoose blog schema setup
const blog = mongoose.createConnection("mongodb+srv://srnazeer:Mongoguy123@senecaweb.d5smcuf.mongodb.net/?retryWrites=true&w=majority");
const blogSchema = new mongoose.Schema({ blog: String });

const loginDetails = register.model("registration", registerSchema);
const blogDetails = blog.model("blog", blogSchema);

//routes
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "/blog.html"));
});

app.get("/read_more", function (req, res) {
  res.sendFile(path.join(__dirname, "/read_more.html"));
});

app.get("/registration", function (req, res) {
  res.render("registration", { layout: false });
});

app.post("/registration", function (req, res) {
  var registrationData = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmpassword,
    address: req.body.address,
    phn: req.body.phn,
  };

  function phn(num) {
    const phone = /^\d{3}-\d{3}-\d{4}$/;
    return phone.test(num);
  }

  if (
    registrationData.firstname == "" ||
    registrationData.lastname == "" ||
    registrationData.email == "" ||
    registrationData.password == "" ||
    registrationData.confirmPassword == "" ||
    registrationData.address == "" ||
    registrationData.phn == ""
  ) {
    var regiError = "The field with * should be entered!!!";
    res.render("registration", {
      regiError: regiError,
      data: registrationData,
      layout: false,
    });
    return;
  } else if (phn(registrationData.phn) != true) {
    var phoneError = "follow the format 123-456-7890, include -";
    res.render("registration", {
      phoneError: phoneError,
      data: registrationData,
      layout: false,
    });
  } else if (
    registrationData.password.length < 6 ||
    registrationData.password.length > 12
  ) {
    var pssError = "The password length should be between 6 to 12 characters";
    res.render("registration", {
      pssError: pssError,
      data: registrationData,
      layout: false,
    });
  } else {
    res.render("dashboard", { layout: false });
  }
  let userInfo = new loginDetails(registrationData);
  userInfo.save((e, data) => {
    if (e) {
      console.log(e);
    } else {
      console.log(data);
    }
  });
});

app.get("/login", function (req, res) {
  res.render("login", { layout: false });
});

app.post("/login", function (req, res) {
  var loginData = {
    user: req.body.username,
    password: req.body.password,
  };

  function specialChar(str) {
    const speStr = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    return speStr.test(str);
  }

  if (loginData.user == "" || loginData.password == "") {
    var loginError = "The useremail and the password should be entered!!!";
    res.render("login", {
      loginError: loginError,
      data: loginData,
      layout: false,
    });
    //return;
  } else {
    console.log("loginData: ", loginData);
    loginDetails
      .find({ email: loginData.user, password: loginData.password })
      .exec()
      .then((data) => {
        if (data) {
          res.render("dashboard", {
            firstname: data.firstname,
            lastname: data.lastname,
            username: data.username,
            layout: false,
          });
        } else {
          var loginError =
            "The useremail and the password should be entered!!!";
          res.render("login", {
            loginError: loginError,
            data: loginData,
            layout: false,
          });
        }
      });
    //res.render("dashboard", { layout: false });
  }
});

app.use(function (req, res) {
  res.status(404).send("Page not found");
});

var port = process.env.PORT || 8080;
app.listen(port, function () {
  console.log("Express http server listening on port " + port);
});
