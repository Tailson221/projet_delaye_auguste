import { Request, Response } from "express";
import db from "../models";

const Pollutions = db.pollutions;

/**
 * Récupère la liste de toutes les mesures de pollution depuis la base PostgreSQL.
 */
export const getAll = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await Pollutions.findAll({
      order: [["id", "ASC"]]
    });
    res.status(200).json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({
      message: "Erreur lors de la récupération des données de pollution: " + message
    });
  }
};

/**
 * Récupère une mesure de pollution par son identifiant.
 */
export const getById = async (req: Request, res: Response): Promise<void> => {
  const paramId = req.params.id;
  const id = Array.isArray(paramId) ? Number(paramId[0]) : Number(paramId);
  try {
    const data = await Pollutions.findByPk(id);
    if (data) {
      res.status(200).json(data);
    } else {
      res.status(404).json({
        message: `Aucune pollution trouvée avec l'id=${id}.`
      });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({
      message: `Erreur lors de la récupération de la pollution id=${id}: ` + message
    });
  }
};

/**
 * Crée une nouvelle mesure de pollution (POST /api/pollutions).
 */
export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = req.body;
    if (!payload.ville && payload.lieu) {
      payload.ville = payload.lieu;
    }
    if (!payload.lieu && payload.ville) {
      payload.lieu = payload.ville;
    }
    if (!payload.titre && payload.polluant) {
      payload.titre = `Pollution ${payload.polluant} - ${payload.ville || "Non précisé"}`;
    }
    if (!payload.type && payload.polluant) {
      payload.type = payload.polluant;
    }
    if (!payload.date && payload.dateObservation) {
      payload.date = payload.dateObservation;
    }

    const created = await Pollutions.create(payload);
    res.status(201).json(created);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({
      message: "Erreur lors de la création de la pollution: " + message
    });
  }
};

/**
 * Met à jour une mesure de pollution (PUT /api/pollutions/:id).
 */
export const update = async (req: Request, res: Response): Promise<void> => {
  const paramId = req.params.id;
  const id = Array.isArray(paramId) ? Number(paramId[0]) : Number(paramId);
  try {
    const [num] = await Pollutions.update(req.body, { where: { id } });
    if (num === 1) {
      const updated = await Pollutions.findByPk(id);
      res.status(200).json(updated);
    } else {
      res.status(404).json({
        message: `Impossible de mettre à jour la pollution id=${id}. Elle n'existe peut-être pas.`
      });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({
      message: `Erreur lors de la mise à jour de la pollution id=${id}: ` + message
    });
  }
};

/**
 * Supprime une mesure de pollution (DELETE /api/pollutions/:id).
 */
export const deletePollution = async (req: Request, res: Response): Promise<void> => {
  const paramId = req.params.id;
  const id = Array.isArray(paramId) ? Number(paramId[0]) : Number(paramId);
  try {
    const num = await Pollutions.destroy({ where: { id } });
    if (num === 1) {
      res.status(200).json({
        message: `Pollution id=${id} supprimée avec succès.`,
        success: true,
        id
      });
    } else {
      res.status(404).json({
        message: `Impossible de supprimer la pollution id=${id}.`
      });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({
      message: `Erreur lors de la suppression de la pollution id=${id}: ` + message
    });
  }
};

export default { getAll, getById, create, update, deletePollution };
