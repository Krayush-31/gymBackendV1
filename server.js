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
express.static(
path.join(__dirname, "uploads")
)
);

// Routes
app.use("/api/gyms", gymRoutes);

app.get("/", (req, res) => {
res.send("Backend Working");
});

// MongoDB Connection
mongoose
.connect(process.env.MONGO_URI)
.then(() =>
console.log("MongoDB Connected")
)
.catch((err) => console.log(err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
console.log(
`Server running on port ${PORT}`
);
});
