const express = require("express");
const {
  getShop,
  getShops,
  createShop,
  updateShop,
  deleteShop,
} = require("../controllers/shops");
// Include other resource routers
const reservationRouter = require("./reservations");

const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

// Re-route into other resource routers
router.use("/:shopId/reservations/", reservationRouter);

router
  .route("/")
  .get(getShops)
  .post(protect, authorize("shopOwner"), createShop);
router
  .route("/:id")
  .get(getShop)
  .put(protect, authorize("shopOwner", "admin"), updateShop)
  .delete(protect, authorize("shopOwner", "admin"), deleteShop);

module.exports = router;
