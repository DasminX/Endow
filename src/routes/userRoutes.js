const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.post("/forgot-password", authController.forgotPassword);

router.use(authController.protect);
router.delete("/delete-connected-account/:id", userController.deleteConnectedAccount)

router.get("/me", userController.getMe, userController.getUser);
router.patch("/updateMyPassword", authController.updatePassword);
router.patch("/updateMe", userController.updateMe);
router.delete("/deleteMe", userController.deleteMe);

router.post('/add-account', userController.addAccount)

// ONLY FOR API, ADMIN PANEL NOT READY YET
router.use(authController.restrictTo("admin"));
router.route("/").get(userController.getAllUsers);
router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
