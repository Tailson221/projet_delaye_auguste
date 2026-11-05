import { Request, Response } from "express";
import db from "../models";

const Users = db.users;

/**
 * Récupère la liste de tous les utilisateurs (GET /api/users).
 */
export const getAll = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await Users.findAll({
      attributes: { exclude: ["password"] },
      order: [["id", "ASC"]]
    });
    res.status(200).json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({
      message: "Erreur lors de la récupération des utilisateurs: " + message
    });
  }
};

/**
 * Récupère un utilisateur par son identifiant (GET /api/users/:id).
 */
export const getById = async (req: Request, res: Response): Promise<void> => {
  const paramId = req.params.id;
  const id = Array.isArray(paramId) ? Number(paramId[0]) : Number(paramId);
  try {
    const data = await Users.findByPk(id, {
      attributes: { exclude: ["password"] }
    });
    if (data) {
      res.status(200).json(data);
    } else {
      res.status(404).json({
        message: `Aucun utilisateur trouvé avec l'id=${id}.`
      });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({
      message: `Erreur lors de la récupération de l'utilisateur id=${id}: ` + message
    });
  }
};

/**
 * Crée un nouvel utilisateur (POST /api/users).
 */
export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const { login, nom, prenom, email, password, role } = req.body;

    if (!login || !nom || !prenom || !email || !password) {
      res.status(400).json({
        message: "Champs obligatoires manquants (login, nom, prenom, email, password)."
      });
      return;
    }

    // Vérifier l'unicité du login ou de l'email
    const existing = await Users.findOne({
      where: {
        login: String(login).trim()
      }
    });

    if (existing) {
      res.status(409).json({
        message: `L'identifiant '${login}' est déjà utilisé par un autre compte.`
      });
      return;
    }

    const newUser = await Users.create({
      login: String(login).trim(),
      nom: String(nom).trim(),
      prenom: String(prenom).trim(),
      email: String(email).trim().toLowerCase(),
      password: String(password),
      role: role || "Éco-Citoyen",
      createdAt: new Date().toISOString()
    });

    // Génération d'un token d'authentification fictif (JWT simulé)
    const fakeToken = `fake-jwt-token-${newUser.id}-${Date.now()}`;

    res.status(201).json({
      id: newUser.id,
      login: newUser.login,
      nom: newUser.nom,
      prenom: newUser.prenom,
      email: newUser.email,
      role: newUser.role,
      token: fakeToken,
      createdAt: newUser.createdAt,
      message: "Utilisateur créé avec succès dans la base PostgreSQL."
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({
      message: "Erreur lors de la création de l'utilisateur: " + message
    });
  }
};

/**
 * Authentification fictive d'un utilisateur (POST /api/users/login).
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { login: userLogin, email, password } = req.body;
    const identifier = userLogin || email;

    if (!identifier || !password) {
      res.status(400).json({
        message: "Identifiant (login ou email) et mot de passe requis."
      });
      return;
    }

    const user = await Users.findOne({
      where: userLogin ? { login: userLogin } : { email: email }
    });

    if (!user || user.password !== password) {
      res.status(401).json({
        message: "Identifiant ou mot de passe incorrect."
      });
      return;
    }

    const fakeToken = `fake-jwt-token-${user.id}-${Date.now()}`;

    res.status(200).json({
      id: user.id,
      login: user.login,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      token: fakeToken,
      message: "Authentification réussie."
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({
      message: "Erreur lors de l'authentification: " + message
    });
  }
};

/**
 * Supprime un utilisateur par son identifiant (DELETE /api/users/:id).
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const paramId = req.params.id;
  const id = Array.isArray(paramId) ? Number(paramId[0]) : Number(paramId);
  try {
    const num = await Users.destroy({
      where: { id: id }
    });
    if (num === 1) {
      res.status(200).json({
        message: `Utilisateur id=${id} supprimé avec succès.`
      });
    } else {
      res.status(404).json({
        message: `Impossible de supprimer l'utilisateur id=${id}. Utilisateur non trouvé.`
      });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({
      message: `Erreur lors de la suppression de l'utilisateur id=${id}: ` + message
    });
  }
};

export default {
  getAll,
  getById,
  create,
  login,
  deleteUser
};
