import { Application } from "express";
import pollutionRoutes from "./pollution.routes";
import userRoutes from "./user.routes";

export default (app: Application): void => {
  pollutionRoutes(app);
  userRoutes(app);
};
