const mongoose = require("mongoose");

const gymSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  address: {
    type: String,
    required: true,
  },

  phone: {
    type: String,
  },

  image: {
    type: String,
    default: "",
  },

  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },

    coordinates: {
      type: [Number],
      required: true,
    },
  },
});

gymSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Gym", gymSchema);