import { Schema, models, model, Model, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  stats: {
    strength: number;
    vitality: number;
    agility: number;
    intelligence: number;
    perception: number;
    [key: string]: number;
  };
  logs: Array<{
    stat: string;
    oldValue: number;
    newValue: number;
    changedAt: Date;
  }>;
  completedQuests: Array<{
    questTitle: string;
    completedAt: Date;
    rewards: Array<{
      type: string;
      value: string;
    }>;
  }>;
  focusLogs: Array<{
    stat: string;
    questTitle: string;
    chosenAt: Date;
  }>;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    stats: {
      strength: { type: Number, default: 1 },
      vitality: { type: Number, default: 1 },
      agility: { type: Number, default: 1 },
      intelligence: { type: Number, default: 1 },
      perception: { type: Number, default: 1 },
    },
    logs: [
      {
        stat: String,
        oldValue: Number,
        newValue: Number,
        changedAt: { type: Date, default: Date.now },
      },
    ],
    completedQuests: [
      {
        questTitle: String,
        completedAt: { type: Date, default: Date.now },
        rewards: [
          {
            type: String,
            value: String,
          },
        ],
      },
    ],
    focusLogs: [
      {
        stat: String,
        questTitle: String,
        chosenAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default (models.User as Model<IUser>) ||
  model<IUser>("User", UserSchema);
