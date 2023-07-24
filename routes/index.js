var express = require("express");
var router = express.Router();

// require controllers:
const hotelController = require("../controllers/hotel_controller");
const userController = require("../controllers/user_controller");

/* GET home page. */
router.get("/", hotelController.homePageFilters);

router.get("/all", hotelController.listAllHotels);
router.get("/all/:hotel", hotelController.hotelDetails);

router.get("/countries", hotelController.listAllCountries);
router.get("/countries/:country", hotelController.hotelsByCountry);
router.post("/results", hotelController.searchResults);

// Admin Routes:
router.get("/admin", userController.isAdmin, hotelController.adminPage); // slagame middleware dali user-a e admin predi da idem v admin page
router.get("/admin/*", userController.isAdmin);
router.get("/admin/add", hotelController.createHotelGet);
router.post(
  "/admin/add",
  hotelController.upload,
  hotelController.pushToCloudinary,
  hotelController.createHotelPost,
);
router.get("/admin/edit-remove", hotelController.editRemoveGet);
router.post("/admin/edit-remove", hotelController.editRemovePost);
router.get("/admin/:hotelId/update", hotelController.updateHotelGet);
router.post(
  "/admin/:hotelId/update",
  hotelController.upload,
  hotelController.pushToCloudinary,
  hotelController.updateHotelPost,
);
router.get("/admin/:hotelId/delete", hotelController.deleteHotelGet);
router.post("/admin/:hotelId/delete", hotelController.deleteHotelPost);

// User Routes
router.get("/sign-up", userController.signUpGet);
router.post("/sign-up", userController.singUpPost, userController.loginPost);
router.get("/login", userController.loginGet);
router.post("/login", userController.loginPost);
router.get("/logout", userController.logout);
router.get("/confirmation/:data", userController.bookingConfirmation);
router.get("/order-placed/:data", userController.orderPlaced);
router.get("/my-account", userController.myAccount);
router.get("/admin/orders", userController.allOrders);

module.exports = router;
