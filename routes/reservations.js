const express = require("express");

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require("../middleware/auth");
const {
  getReservations,
  getReservation,
  addReservation,
  updateReservation,
  deleteReservation,
} = require("../controllers/reservations");

// TODO: give access RUD to admin after finishing the routes
router.route("/").get(protect, getReservations).post(protect, addReservation);
router
  .route("/:id")
  .get(protect, getReservation)
  .put(protect, authorize("admin", "shopOwner", "user"), updateReservation)
  .delete(protect, authorize("admin", "shopOwner", "user"), deleteReservation);

module.exports = router;
