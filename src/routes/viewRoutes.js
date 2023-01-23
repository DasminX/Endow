const express = require("express");
const viewsController = require("../controllers/viewsController");
const authController = require("../controllers/authController");

const router = express.Router();

router.get("/", authController.isLoggedIn, viewsController.getHomepage);

router.get("/login", authController.isLoggedIn, authController.redirectIfLoggedIn, viewsController.getLoginForm); // TODO ZMIANA ISLOGGEDIN I REDIRECT NA JEDNA FUNKCJE
router.get("/signup", authController.isLoggedIn, authController.redirectIfLoggedIn, viewsController.getSignupForm); // TODO PODZIELENIE HOME LOGGED IN LOGGED OUT
router.get('/forgot-password', authController.isLoggedIn, authController.redirectIfLoggedIn, viewsController.getForgotPasswordForm)

router.get("/me", authController.protect, viewsController.getAccount);
router.get("/my-apps", authController.protect, viewsController.getMyApps);
router.get("/subscription", authController.protect, viewsController.getSubscription);

module.exports = router;
