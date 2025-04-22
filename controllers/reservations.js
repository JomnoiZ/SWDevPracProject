const Reservation = require("../models/reservation");
const Shop = require("../models/shop");
const req = require("express/lib/request");

// @desc    Get all appointments
// @route   GET /api/v1/appointments
// @access  Public
// @desc    Get all reservations or reservations for a specific shop
// @route   GET /api/v1/reservations
// @route   GET /api/v1/shops/:shopId/reservations
// @access  Private (user or admin)
exports.getReservations = async (req, res, next) => {
  try {
    let query;

    const populateOptions = {
      path: "shop",
      select: "name province tel openTime closeTime",
    };

    if (req.params.shopId) {
      if (req.user.role === "user") {
        return res.status(401).json({
          success: false,
          error: `User ${req.user.id} is not authorized to view this shop's reservation`,
        });
      }
      query = Reservation.find({ shop: req.params.shopId }).populate(
        populateOptions
      );
    } else {
      if (req.user.role !== "admin") {
        query = Reservation.find({ user: req.user.id }).populate(
          populateOptions
        );
      } else {
        query = Reservation.find().populate(populateOptions);
      }
    }

    const reservations = await query;

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Cannot find reservations",
    });
  }
};

// @desc    Get single appointment
// @route   GET /api/v1/appointments/:id
// @access  Public
exports.getReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate({
      path: "shop",
      select: "name description tel openTime closeTime",
    });
    if (!reservation) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot find reservation" });
    }
    //Make sure user is appointment owner
    if (
      reservation.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        error: `User ${req.user.id} is not authorized to view this reservation`,
      });
    }
    res.status(200).json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, error: "Cannot find reservation" });
  }
};

// @desc    Get single appointment
// @route   GET /api/v1/appointments/:id
// @access  Public
exports.getReservationByShopId = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate({
      path: "shop",
      select: "name description tel openTime closeTime",
    });
    if (!reservation) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot find reservation" });
    }
    //Make sure user is appointment owner
    if (
      reservation.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        error: `User ${req.user.id} is not authorized to view this reservation`,
      });
    }
    res.status(200).json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, error: "Cannot find reservation" });
  }
};

//@desc     Create new appointment
//@route    POST /api/v1/hospitals/:hospitalId/appointments
//@access   Private
exports.addReservation = async (req, res, next) => {
  try {
    req.body.shop = req.params.shopId;

    const shop = await Shop.findById(req.params.shopId);

    if (!shop) {
      return res.status(404).json({
        success: false,
        error: `No shop with the id of ${req.params.shopId}`,
      });
    }

    req.body.user = req.user.id;

    //Check for existed reservation
    const existedReservations = await Reservation.find({ user: req.user.id });

    //If the user is not an admin, they can only create 3 reservation.
    if (existedReservations.length >= 3 && req.user.role !== "admin") {
      return res.status(400).json({
        success: false,
        error: `The user with ID ${req.user.id} has already made 3 Reservations`,
      });
    }

    const reservation = await Reservation.create(req.body);
    res.status(200).json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: "Cannot create Reservation",
    });
  }
};

// @desc    Update appointment
// @route   PUT /api/v1/appointments/:id
// @access  Private
exports.updateReservation = async (req, res, next) => {
  try {
    let reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: `No reservation with the id of ${req.params.id}`,
      });
    }

    //Make sure user is appointment owner
    if (
      reservation.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        error: `User ${req.user.id} is not authorized to update this reservation`,
      });
    }

    reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: "Cannot update Reservation",
    });
  }
};

// @desc    Delete appointment
// @route   DELETE /api/v1/appointments/:id
// @access  Private
exports.deleteReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: `No reservation with the id of ${req.params.id}`,
      });
    }

    //Make sure user is reservation owner
    if (
      reservation.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        error: `User ${req.user.id} is not authorized to delete this reservation`,
      });
    }

    await reservation.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: "Cannot delete Reservation",
    });
  }
};
