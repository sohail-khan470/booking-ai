const express = require("express");
const router = express.Router();
const serviceCatalogController = require("../controllers/service-catalog-controller");

router.post("/", serviceCatalogController.createService);

router.get("/", serviceCatalogController.getAllServices);

router.get("/duration", serviceCatalogController.getServicesByDuration);

router.get("/:id", serviceCatalogController.getServiceById);

router.put("/:id", serviceCatalogController.updateService);

router.delete("/:id", serviceCatalogController.deleteService);

module.exports = router;
