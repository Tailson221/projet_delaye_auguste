import { Application } from "express";
import pollutionRoutes from "./pollution.routes";

export default (app: Application): void => {
  pollutionRoutes(app);
};
