const express = require("express");

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require("../middleware/auth");
const {
  getReservations,
  getReservation,
  getReservationsByShopId,
  addReservation,
  updateReservation,
  deleteReservation,
} = require("../controllers/reservations");

router
  .route("/")
  .get(protect, authorize("admin", "shopOwner", "user"), getReservations)
  .get(protect, authorize("admin", "shopOwner"), getReservationsByShopId)
  .post(protect, authorize("user"), addReservation);
router
  .route("/:id")
  .get(protect, authorize("admin", "shopOwner", "user"), getReservation)
  .put(protect, authorize("admin", "shopOwner", "user"), updateReservation)
  .delete(protect, authorize("admin", "shopOwner", "user"), deleteReservation);

module.exports = router;
