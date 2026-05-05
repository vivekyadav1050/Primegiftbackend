import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import dbConnect from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import { initCronJobs } from "./jobs/cronJobs.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

dbConnect();
initCronJobs();

// app.use(cors({
//   origin: process.env.FRONTEND_URL,
//   credentials: true
// }));

// app.use(cors({
//   origin: "*"
// }));

// app.use(cors({
//   origin: "http://localhost:5173"
// }));

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://primegift-9vrd.vercel.app",
    "https://www.primegift.in",
    "https://primegift.in"
  ],
  credentials: true
}));

app.set("trust proxy", 1);

app.get("/", (req, res) => {
  res.json("first page build");
});

app.use("/api/auth", authRoutes);
app.use("/api/primegift", productRoutes);
app.use("/api/primegift", orderRoutes);

export default app;