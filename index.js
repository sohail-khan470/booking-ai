require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const { StatusCodes } = require("http-status-codes");
const cors = require("cors");
const {
  appointmentRoutes,
  serviceCatalogRoutes,
  slotRoutes,
  staffRoutes,
  customerRoutes,
  vapiRoutes,
  authRoutes,
} = require("./routes");
const app = express();
const PORT = process.env.PORT || 3100;
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

/** routes */

app.use("/api/auth", authRoutes);
app.use("/api/vapi", vapiRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/services", serviceCatalogRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/customers", customerRoutes);

//to be implemented
app.use((error, req, res, next) => {
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error.message);
});

app.listen(PORT, () => {
  console.log(`backend is running on port ${PORT}`);
});
