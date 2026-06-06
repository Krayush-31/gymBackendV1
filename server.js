const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const gymRoutes = require("./routes/gymRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded images
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// Health Check Route
app.get("/", (req, res) => {
  res.send("Gym Finder Backend Running");
});

// API Routes
app.use("/api/gyms", gymRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
  });

// Local Development Only
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;