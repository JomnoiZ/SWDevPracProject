const mongoose = require("mongoose");
const { Types } = mongoose;
const Reservation = require("../models/reservation");
const Shop = require("../models/shop");

// @desc    Get all reservations
// @route   GET /api/v1/reservations
// @access  Public
// @desc    Get all reservations or reservations for a specific shop
// @route   GET /api/v1/reservations
// @route   GET /api/v1/shops/:shopId/reservations
// @access  Public
exports.getReservations = async (req, res, next) => {
  try {
    let query;

    const populateOptions = {
      path: "shop",
      select:
        "name address district province postalcode tel openTime closeTime shopOwner",
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
      if (req.user.role === "user") {
        query = Reservation.find({ user: req.user.id }).populate(
          populateOptions
        );
      } else if (req.user.role === "shopOwner") {
        const userId = new Types.ObjectId(req.user.id);

        query = Reservation.aggregate([
          {
            $lookup: {
              from: "shops",
              localField: "shop",
              foreignField: "_id",
              as: "shop",
            },
          },
          {
            $unwind: "$shop",
          },
          {
            $match: {
              "shop.shopOwner": userId,
            },
          },
        ]);
      } else {
        query = Reservation.find().populate(populateOptions);
      }
    }

    const reservations = await query;

    console.log(typeof req.user.id, reservations);

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

// @desc    Get single reservation
// @route   GET /api/v1/reservations/:id
// @access  Private
exports.getReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate({
      path: "shop",
      select:
        "name address district province postalcode tel openTime closeTime shopOwner",
    });
    if (!reservation) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot find reservation" });
    }
    // Make sure user is reservation owner
    if (
      reservation.user.toString() !== req.user.id &&
      req.user.role !== "admin" &&
      (reservation.shop.shopOwner.toString() !== req.user.id ||
        req.user.role !== "shopOwner")
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

// @desc    Get reservations by shop id
// @route   GET /api/v1/reservations/:id
// @access  Public
exports.getReservationsByShopId = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate({
      path: "shop",
      select:
        "name address district province postalcode tel openTime closeTime shopOwner",
    });
    if (!reservation) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot find reservation" });
    }

    // Make sure user is reservation owner
    if (
      reservation.user.toString() !== req.user.id &&
      req.user.role !== "admin" &&
      (reservation.shop.shopOwner.toString() !== req.user.id ||
        req.user.role !== "shopOwner")
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

// @desc     Create new reservation
// @route    POST /api/v1/hospitals/:hospitalId/reservations
// @access   Private
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

    // Check for existed reservation
    const existedReservations = await Reservation.find({ user: req.user.id });

    // The user can only create 3 reservation.
    if (existedReservations.length >= 3) {
      return res.status(400).json({
        success: false,
        error: `The user with ID ${req.user.id} has already made 3 Reservations`,
      });
    }

    const reservation = await Reservation.create(req.body);
    res.status(201).json({
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

// @desc    Update reservation
// @route   PUT /api/v1/reservations/:id
// @access  Private
exports.updateReservation = async (req, res, next) => {
  try {
    let reservation = await Reservation.findById(req.params.id).populate({
      path: "shop",
      select:
        "name address district province postalcode tel openTime closeTime shopOwner",
    });
    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: `No reservation with the id of ${req.params.id}`,
      });
    }

    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: `No reservation with the id of ${req.params.id}`,
      });
    }

    // Make sure user is reservation owner
    if (
      reservation.user.toString() !== req.user.id &&
      req.user.role !== "admin" &&
      (reservation.shop.shopOwner.toString() !== req.user.id ||
        req.user.role !== "shopOwner")
    ) {
      return res.status(401).json({
        success: false,
        error: `User ${req.user.id} is not authorized to update this reservation`,
      });
    }

    await Reservation.findByIdAndUpdate(req.params.id, req.body, {
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

// @desc    Delete reservation
// @route   DELETE /api/v1/reservations/:id
// @access  Private
exports.deleteReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate({
      path: "shop",
      select:
        "name address district province postalcode tel openTime closeTime shopOwner",
    });
    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: `No reservation with the id of ${req.params.id}`,
      });
    }

    // Make sure user is reservation owner
    if (
      reservation.user.toString() !== req.user.id &&
      req.user.role !== "admin" &&
      (reservation.shop.shopOwner.toString() !== req.params.shopId ||
        req.user.role !== "shopOwner")
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
