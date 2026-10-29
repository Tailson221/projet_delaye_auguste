import { Application, Router } from "express";
import pollutionController from "../controllers/pollution.controllers";

export default (app: Application): void => {
  const router = Router();

  // Route GET /api/pollutions (Liste de toutes les pollutions)
  router.get("/", pollutionController.getAll);

  // Route GET /api/pollutions/:id (Détail d'une pollution par ID)
  router.get("/:id", pollutionController.getById);

  // Route POST /api/pollutions (Création d'une pollution)
  router.post("/", pollutionController.create);

  // Route PUT /api/pollutions/:id (Mise à jour d'une pollution)
  router.put("/:id", pollutionController.update);

  // Route DELETE /api/pollutions/:id (Suppression d'une pollution)
  router.delete("/:id", pollutionController.deletePollution);

  // Exposition sous /api/pollutions et /api/pollution (singulier et pluriel)
  app.use("/api/pollutions", router);
  app.use("/api/pollution", router);
};
