import dotenv from "dotenv";
import path from "path";

// Charger les variables d'environnement depuis le fichier .env
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

export interface DatabaseConfig {
  host: string;
  port: string;
  user: string;
  password: string;
  bdname: string;
}

export interface AppConfig {
  BDD: DatabaseConfig;
}

export const config: AppConfig = {
  BDD: {
    host: process.env.DB_HOST || "",
    port: process.env.DB_PORT || "5432",
    user: process.env.DB_USER || "",
    password: process.env.DB_PASSWORD || "",
    bdname: process.env.DB_NAME || ""
  }
};

export const { BDD } = config;
export default config;
