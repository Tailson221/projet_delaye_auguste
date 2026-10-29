import { Sequelize } from "sequelize";
import { BDD } from "../config";
import definePollutions, { PollutionModel } from "./pollutions.model";

const connectionUrl =
  process.env.DATABASE_URL ||
  `postgres://${BDD.user}:${BDD.password}@${BDD.host}/${BDD.bdname}`;

const isLocalHost = connectionUrl.includes("localhost") || connectionUrl.includes("127.0.0.1");
const useSsl =
  process.env.DB_SSL === "true" ||
  (process.env.DB_SSL !== "false" && !isLocalHost);

const sequelize = new Sequelize(connectionUrl, {
  dialect: "postgres",
  protocol: "postgres",
  dialectOptions: useSsl
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    : {},
  define: {
    timestamps: false
  }
});

export interface Database {
  Sequelize: typeof Sequelize;
  sequelize: Sequelize;
  pollutions: PollutionModel;
}

export const db: Database = {
  Sequelize,
  sequelize,
  pollutions: definePollutions(sequelize, Sequelize)
};

export default db;
