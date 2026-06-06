const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() +
        path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage,
});

const express = require("express");
const router = express.Router();

const Gym = require("../models/gym");
const axios = require("axios");

// POST API
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, address, phone, latitude, longitude } = req.body;

    const image = req.file
      ? `https://gymbackendv1.onrender.com/${req.file.path.replace(/\\/g, "/")}`
      : "";

    const newGym = new Gym({
      name,
      address,
      phone,
      image,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
    });

    await newGym.save();

    res.status(201).json({
      success: true,
      message: "Gym registered successfully",
      gym: newGym,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
// GET ALL GYMS
router.get("/", async (req, res) => {

  try {

    const gyms = await Gym.find();

    res.status(200).json({
      success: true,
      count: gyms.length,
      gyms: gyms,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

});
// GET NEARBY GYMS
router.get("/nearby", async (req, res) => {

  try {

    const { lat, lng, distance } = req.query;

    const nearbyGyms = await Gym.find({

      location: {

        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },

          $maxDistance: parseInt(distance),
        },

      },

    });

    res.status(200).json({
      success: true,
      count: nearbyGyms.length,
      gyms: nearbyGyms,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

});

// GET ALL EXTERNAL GYMS
router.get("/all-gyms", async (req, res) => {
  try {
    const { lat, lng } = req.query;

    const query = `[out:json];
(
  node["leisure"="fitness_centre"](around:10000,${lat},${lng});
  way["leisure"="fitness_centre"](around:10000,${lat},${lng});

  node["sport"="fitness"](around:10000,${lat},${lng});
  way["sport"="fitness"](around:10000,${lat},${lng});
);
out center;`;

    const response = await axios.post(
      "https://lz4.overpass-api.de/api/interpreter",
      query,
      {
        headers: {
          "Content-Type": "text/plain",
          "User-Agent": "GymApp/1.0",
        },
      }
    );

    const registeredGyms = await Gym.find();

    const registeredNames = registeredGyms.map(
      gym => gym.name?.toLowerCase().trim()
    );

    const gyms = response.data.elements.filter(
      gym => {
        const gymName =
          gym.tags?.name?.toLowerCase().trim();

        if (!gymName) return false;

        return !registeredNames.includes(
          gymName
        );
      }
    );

    res.status(200).json({
      success: true,
      count: gyms.length,
      gyms,
    });

  } catch (error) {
    console.log(error.response?.data);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


module.exports = router;