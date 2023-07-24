const User = require("../models/user");
const Hotel = require("../models/hotel");
const Passport = require("passport");
const Order = require("../models/order");

// Express validator
const { check, validationResult } = require("express-validator");
const querystring = require("querystring");

exports.signUpGet = (req, res) => {
  res.render("sign_up", { title: "User sign up" });
};

exports.singUpPost = [
  // Validate Data
  check("first_name")
    .isLength({ min: 1 })
    .withMessage("First name bust be specified")
    .isAlphanumeric()
    .withMessage("First name byst alphanumeric"),

  check("surname")
    .isLength({ min: 1 })
    .withMessage("Surname must be specified")
    .isAlphanumeric()
    .withMessage("Surname must be alphanumeric"),

  check("email").isEmail().withMessage("Invalid email adress"),

  check("confirm_email")
    .custom((value, { req }) => value === req.body.email)
    .withMessage("Email adresses dont match"),

  check("password")
    .isLength({ min: 6 })
    .withMessage(
      "Invalid password, password must be a minumum of 6 characters",
    ),

  check("confirm_password")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Password do not match"),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("sign_up", {
        title: "Please fix the following errors:",
        errors: errors.array(),
      });
      return;
    } else {
      const newUser = new User(req.body);
      User.register(newUser, req.body.password, (err) => {
        if (err) {
          console.error(err, "while registering");
          return next(err);
        }
        next(); // move to loginpost
      });
    }
  },
];

exports.loginGet = (req, res) => {
  res.render("login", { title: "Login to continue" });
};

exports.logout = (req, res) => {
  req.logout((err) => {
    err && console.error(err);
    req.flash("info", "You are logged out");
    res.redirect("/");
  });
};

exports.loginPost = Passport.authenticate("local", {
  successRedirect: "/",
  successFlash: "You are now logged in",
  failureRedirect: "/login",
  failureFlash: "Login failed, please try again",
});

exports.bookingConfirmation = async (req, res, next) => {
  try {
    const data = req.params.data;
    const searchData = querystring.parse(data);
    const hotel = await Hotel.find({ _id: searchData.id });
    res.render("confirmation", {
      title: "Confirm your booking",
      hotel,
      searchData,
    });
  } catch (error) {
    next(error);
  }
};

exports.orderPlaced = async (req, res, next) => {
  try {
    const data = req.params.data;
    const parasedData = querystring.parse(data);
    const order = new Order({
      user_id: req.user._id,
      hotel_id: parasedData.id,
      order_details: {
        duration: parasedData.duration,
        dateOfDeparature: parasedData.dateOfDeparature,
        numberOfGuests: parasedData.numberOfGuests,
      },
    });
    await order.save();
    req.flash("info", "Thank you your order has been placed!");
    res.redirect("/my-account");
  } catch (error) {
    next(error);
  }
};

exports.myAccount = async (req, res, next) => {
  try {
    const orders = await Order.aggregate([
      { $match: { user_id: req.user.id } },
      {
        $lookup: {
          from: "hotels",
          localField: "hotel_id",
          foreignField: "_id",
          as: "hotel_data",
        },
      },
    ]);
    res.render("user_account", {
      title: "My Account",
      orders,
    });
  } catch (error) {
    next(error);
  }
};

exports.allOrders = async (req, res, next) => {
  try {
    const orders = await Order.aggregate([
      { $match: { user_id: req.user.id } },
      {
        $lookup: {
          from: "hotels",
          localField: "hotel_id",
          foreignField: "_id",
          as: "hotel_data",
        },
      },
    ]);
    res.render("orders", {
      title: "All orders",
      orders,
    });
  } catch (error) {
    next(error);
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.isAdmin) {
    next();
    return;
  }
  res.redirect("/");
};
