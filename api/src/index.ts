import express, { Application, Request, Response } from "express";
import cors, { CorsOptions } from "cors";
import db from "./models";
import initRoutes from "./routes";

const app: Application = express();

const corsOptions: CorsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type, Authorization",
  exposedHeaders: "Authorization"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// health checks
app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Welcome to Pollution API." });
});

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "OK" });
});

db.sequelize
  .sync()
  .then(async () => {
    console.log("Synced db.");
    try {
      const count = await db.pollutions.count();
      if (count === 0) {
        await db.pollutions.bulkCreate([
          {
            ville: "Biarritz",
            lieu: "Plage des Dunes, Biarritz",
            titre: "Déchets plastiques abondants sur le rivage",
            type: "Plastique",
            polluant: "Plastique",
            valeur: 85.0,
            date: "2026-10-18",
            dateObservation: "2026-10-18",
            latitude: 43.4832,
            longitude: -1.5586,
            photoUrl: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80",
            description: "Accumulation majeure de bouteilles, sacs plastiques et fragments de filets de pêche échoués le long de la plage après la tempête."
          },
          {
            ville: "Nancy",
            lieu: "Berges de la Meurthe, Nancy",
            titre: "Déversement suspect d’effluents colorés",
            type: "Eau",
            polluant: "Chimique",
            valeur: 65.4,
            date: "2026-10-18",
            dateObservation: "2026-10-18",
            latitude: 48.6921,
            longitude: 6.1844,
            photoUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
            description: "Une canalisation d’évacuation déverse un liquide rougeoyant avec une forte odeur de solvant directement dans la Meurthe."
          },
          {
            ville: "Fontainebleau",
            lieu: "Forêt de Fontainebleau, Parcelle 42",
            titre: "Dépôt sauvage de pneus et gravats en sous-bois",
            type: "Dépôt sauvage",
            polluant: "Dépôt sauvage",
            valeur: 110.0,
            date: "2026-10-17",
            dateObservation: "2026-10-17",
            latitude: 48.4047,
            longitude: 2.7016,
            photoUrl: "https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=800&q=80",
            description: "Déversement clandestin estimé à plus de 40 pneus usagés et plusieurs mètres cubes de gravats de chantier en pleine forêt domaniale."
          },
          {
            ville: "Le Havre",
            lieu: "Zone Industrielle Nord, Le Havre",
            titre: "Émanations âcres et fumée noire persistante",
            type: "Air",
            polluant: "NO2",
            valeur: 48.2,
            date: "2026-10-17",
            dateObservation: "2026-10-17",
            latitude: 49.4944,
            longitude: 0.1079,
            photoUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
            description: "Brûlage sauvage de résidus industriels en soirée causant un nuage de fumée irritant pour les riverains."
          },
          {
            ville: "Paris",
            lieu: "Centre-ville, Paris",
            titre: "Pic de particules fines PM2.5",
            type: "Air",
            polluant: "PM2.5",
            valeur: 28.5,
            date: "2026-10-18",
            dateObservation: "2026-10-18",
            latitude: 48.8566,
            longitude: 2.3522,
            photoUrl: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80",
            description: "Qualité de l'air dégradée au centre-ville par manque de vent et concentration de trafic."
          }
        ]);
        console.log("Jeu de données initial pour la table pollution inséré avec succès.");
      }
    } catch (seedErr: unknown) {
      console.warn("Remarque : impossible d'insérer les données d'initialisation :", seedErr);
    }
  })
  .catch((err: Error) => {
    console.log("Failed to sync db: " + err.message);
  });

initRoutes(app);

// set port, listen on 0.0.0.0 for Render and container environments
const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}.`);
});

export default app;
