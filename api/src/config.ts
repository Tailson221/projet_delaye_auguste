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
    host: process.env.DB_HOST || "dpg-d1hnd1bipnbc73faldmg-a.oregon-postgres.render.com",
    port: process.env.DB_PORT || "5432",
    user: process.env.DB_USER || "cnam_db_6xuy_user",
    password: process.env.DB_PASSWORD || "fGkskYzc8Vwqho8X9bTXcnGq42q3X9bE",
    bdname: process.env.DB_NAME || "cnam_db_6xuy"
  }
};

export const { BDD } = config;
export default config;
