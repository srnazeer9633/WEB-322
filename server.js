//Subin's code
const HTTP_PORT = process.env.PORT || 8080;
const path = require("path");
const bodyParser = require("body-parser");
const handlebars = require("express-handlebars");
const express = require("express");
const app = express();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const clientSessions = require("client-sessions");
const stripJs = require("strip-js");
const Article = require("./edit-service.js");
var fs=require('fs');

app.use(express.static("static"));

app.engine(".hbs", handlebars.engine({ extname: ".hbs" }));
app.set("view engine", ".hbs");
app.use(bodyParser.urlencoded({ extended: true }));
const upload = multer();
//mongoose connection setup
const mongoose = require("mongoose");

//mongoose registration schema setup
const register = mongoose.createConnection(
  "mongodb+srv://srnazeer:Mongoguy123@senecaweb.d5smcuf.mongodb.net/?retryWrites=true&w=majority"
);
const registerSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  email: String,
  password: String,
  confirmpassword: String,
  phn: String,
  address: String,
});


//mongoose blog schema setup
const blog = mongoose.createConnection(
  "mongodb+srv://srnazeer:Mongoguy123@senecaweb.d5smcuf.mongodb.net/?retryWrites=true&w=majority"
);
const blogSchema = new mongoose.Schema({ blog: String });

const loginDetails = register.model("registration", registerSchema);
const blogDetails = blog.model("blog", blogSchema);

app.use(
  clientSessions({
    cookieName: "session",
    secret: "secretSession",
    duration: 2 * 60 * 1000,
    activeDuration: 1000 * 60,
  })
);

app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

//declare function ensure login

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}
// cloudinary.config({
//   cloud_name: "srnazeer",
//   api_key: "159222624719573",
//   api_secret: "oHvjhNJw9QXruZ_R5-6n5s7hwro",
//   secure: true,
// });

app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute =
    "/" +
    (isNaN(route.split("/")[1])
      ? route.replace(/\/(?!.*)/, "")
      : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});

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
    user: req.body.email,
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
        //if the user is valid create a session
        if (data.length > 0) {
          req.session.user = data[0];
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
app.get("/addArticle", ensureLogin, function (req, res) {
  console.log("addArticle");
  res.render("addArticle", { layout: false });
});


app.post("/addArticle", ensureLogin, (req, res) => {
  console.log("i am here");
  console.log(req.body);
  //get the image from the request and then savae it locally and add the path to the request body
  req.body.image="image.png";
  Article.addArticle(req.body)
    .then((data) => {
      console.log("everything is fine");
      res.redirect("/articles");
    })
    .catch((err) => {
      console.log("error");
      res.render("404", { message: err });
    });
});

app.get("/articles", ensureLogin, (req, res) => {
  if (req.query.minDate) {
    Article.getArticleByMinDate(req.query.minDate)
      .then((data) => {
        if (data.length == 0) {
          res.render("articles", { message: "No more articles", layout: false });
          return;
        }
        res.render("articles", { articles: data ,layout: false});
      })
      .catch((err) => {
        res.render("articles", { message: err,layout: false });
      });
  } else {
    Article.getAllArticles()
      .then((data) => {
        res.render("articles", { articles: data,layout:false });
      })
      .catch((err) => {
        res.render("articles", { message: err ,layout:false});
      });
  }
});

app.get("/articles/:id", ensureLogin, (req, res) => {
  Article.getArticleById(req.params.id)
    .then((data) => {
      res.render("article", { article: data });
    })
    .catch((err) => {
      res.render("article", { message: err });
    });
});

app.get("/articles/delete/:id", ensureLogin, (req, res) => {
  Article.deleteArticle(req.params.id)
    .then((data) => {
      res.redirect("/articles");
    })
    .catch((err) => {
      res.render("articles", { message: err });
    });
});

app.get("/articles/edit/:id", ensureLogin, (req, res) => {
  Article.getArticleById(req.params.id)
    .then((data) => {
      res.render("editArticle", { article: data });
    })
    .catch((err) => {
      res.render("articles", { message: err });
    });
});


app.use(function (req, res) {
  res.status(404).send("Page not found");
});

var port = process.env.PORT || 8080;

Article.initialize().then(
  app.listen(port, function () {
    console.log("Express http server listening on port " + port);
  })
)


