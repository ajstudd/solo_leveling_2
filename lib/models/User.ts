import mongoose, { Schema, models, model, Model } from "mongoose";

const UserSchema = new Schema(
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

export default (models.User as Model<any>) || model("User", UserSchema);
