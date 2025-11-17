const express = require("express");
const app = express();
const cors = require("cors");
const fileUpload = require("express-fileupload");
require("dotenv").config();
const database = require("./config/dbConnect");
const cookieParser = require("cookie-parser");
const { cloudinaryConnect } = require("./config/cloudinary");
const morgan = require("morgan"); // only for development purpose
const PORT = process.env.PORT || 5000;

// Middleware
app.use(morgan("tiny")); // only for development purpose
app.use(express.json());
app.use(cookieParser());
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CORS_ORIGIN, // for web
  "http://192.168.0.101:19000", // Expo Go dev server (adjust IP accordingly)
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
database.connect();

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);

cloudinaryConnect();
const userRoute = require("./routes/User");
const productRoute = require("./routes/Product");
const orderRoute = require("./routes/Order");
const newsRoute = require("./routes/News");
const schemeRoute = require("./routes/Scheme");
const analyticsRoute = require("./routes/Analytics");
const shiprocketRoute = require("./routes/Shiprocket");

const chatRoute = require("./routes/chat");
app.use("/api/v1/chat", chatRoute);

// app chatBot
const appChatRoute = require("./routes/appChat");
app.use("/api/v1/appChat", appChatRoute);

// notification routes
const notificationRoutes = require("./routes/notification");
app.use("/api/v1/notifications", notificationRoutes);

//
const { scrapeWebsite } = require("./utils/Scrapping");
app.use("/api/v1/scrape", scrapeWebsite);

// Routes
app.use("/api/v1/auth", userRoute);
app.use("/api/v1/products", productRoute);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/news", newsRoute);
app.use("/api/v1/scheme", schemeRoute);
app.use("/api/v1/analytics", analyticsRoute);
app.use("/api/v1/shiprocket", shiprocketRoute);

app.get("/", (req, res) => {
  res.send("Server is running");
});

// Initialize news cron job (every 30 minutes)
const { initializeNewsCron } = require("./scraper/newsCronJob");
initializeNewsCron();

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
