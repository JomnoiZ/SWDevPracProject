const mongoose = require("mongoose");

const ShopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      unique: true,
      trim: true,
      maxlength: [50, "Name can not be more than 50 characters"],
    },
    description: {
      type: String,
    },
    address: {
      type: String,
      required: [true, "Please add an address"],
    },
    district: {
      type: String,
      required: [true, "Please add a district"],
    },
    province: {
      type: String,
      required: [true, "Please add a province"],
    },
    postalcode: {
      type: String,
      required: [true, "Please add a postal code"],
      maxlength: [5, "Postal code can not be more than 5 characters"],
    },
    tel: {
      type: String,
    },
    openTime: {
      type: String,
      required: true,
      match: [/^([0-1]\d|2[0-3]):([0-5]\d)$/, "Please use HH:mm format"],
    },
    closeTime: {
      type: String,
      required: true,
      match: [/^([0-1]\d|2[0-3]):([0-5]\d)$/, "Please use HH:mm format"],
    },
    shopOwner: {
      type: mongoose.Schema.ObjectId,
      ref: "ShopOwner",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Reverse populate with virtuals
ShopSchema.virtual("reservations", {
  ref: "Reservation",
  localField: "_id",
  foreignField: "shop",
  justOne: false,
});

module.exports = mongoose.model("Shop", ShopSchema);
