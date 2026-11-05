import { Sequelize, DataTypes, Model, Optional, ModelStatic } from "sequelize";

export interface UserAttributes {
  id: number;
  login: string;
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role: string;
  createdAt?: string;
}

export interface UserCreationAttributes
  extends Optional<UserAttributes, "id" | "role" | "createdAt"> {}

export interface UserInstance
  extends Model<UserAttributes, UserCreationAttributes>,
    UserAttributes {}

export type UserModel = ModelStatic<UserInstance>;

export default function defineUsers(
  sequelize: Sequelize,
  _seq?: typeof Sequelize
): UserModel {
  const Users = sequelize.define<UserInstance>(
    "user",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      login: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      nom: {
        type: DataTypes.STRING,
        allowNull: false
      },
      prenom: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Éco-Citoyen"
      },
      createdAt: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: () => new Date().toISOString()
      }
    },
    {
      tableName: "users",
      freezeTableName: true,
      timestamps: false
    }
  );

  return Users;
}

