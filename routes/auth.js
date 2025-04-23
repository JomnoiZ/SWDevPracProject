const express = require("express");
const {
  registerUser,
  loginUser,
  registerShopOwner,
  loginShopOwner,
  getMe,
  logout,
} = require("../controllers/auth");

const router = express.Router();

const { protect } = require("../middleware/auth");

router.post("/user/register", registerUser);
router.post("/shop-owner/register", registerShopOwner);

router.post("/user/login", loginUser);
router.post("/shop-owner/login", loginShopOwner);

router.get("/me", protect, getMe);
router.get("/logout", protect, logout);

module.exports = router;
