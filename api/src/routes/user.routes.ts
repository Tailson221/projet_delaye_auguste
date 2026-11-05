import { Application, Router } from "express";
import userController from "../controllers/user.controllers";

export default (app: Application): void => {
  const router = Router();

  // Route GET /api/users (Liste des utilisateurs)
  router.get("/", userController.getAll);

  // Route GET /api/users/:id (Détails d'un utilisateur par ID)
  router.get("/:id", userController.getById);

  // Route POST /api/users (Création d'un utilisateur / Inscription)
  router.post("/", userController.create);

  // Route POST /api/users/login (Authentification fictive)
  router.post("/login", userController.login);

  // Route DELETE /api/users/:id (Suppression d'un utilisateur)
  router.delete("/:id", userController.deleteUser);

  // Exposition sous /api/users et /api/user (pluriel et singulier)
  app.use("/api/users", router);
  app.use("/api/user", router);
};

