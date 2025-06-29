import { Schema, model, Document } from "mongoose";
import { GeminiSections } from "../gemini";

export interface UserProfile {
  name?: string;
  age?: number;
  gender?: string;
  bio?: string;
  goals?: string;
  preferences?: string;
  [key: string]: unknown;
}

export interface IUser extends Document {
  email: string;
  password: string;
  setupCompleted: boolean;
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
    questDescription: string; // Add description field
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
  // Profile info for Gemini AI
  profile?: UserProfile;
  // Badges earned by the user
  badges?: Array<{
    title: string;
    description: string;
    icon: string;
    color: string;
    awardedAt: Date;
  }>;
  // Cached quests (updated daily)
  questCache?: {
    quests: GeminiSections | unknown;
    updatedAt: Date;
  };
  // Internal quest logs for AI
  questLogs?: Array<{
    date: Date;
    skippedSections: string[];
    progress: Record<string, number>;
  }>;
  // Milestones for badge awarding
  milestones?: Array<{
    badge: string;
    achieved: boolean;
    achievedAt?: Date;
    criteria: string;
  }>;
  xp?: number;
  level?: number;
  passives?: Array<{
    title: string;
    description: string;
    unlockCondition?: string;
    awardedAt?: Date;
  }>;
  titles?: Array<{
    title: string;
    description: string;
    unlockCondition?: string;
    awardedAt?: Date;
  }>;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    setupCompleted: { type: Boolean, default: false },
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
        questDescription: String, // Add description field
        completedAt: { type: Date, default: Date.now },
        rewards: [
          {
            type: { type: String },
            value: { type: String },
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
    // Profile info for Gemini AI
    profile: {
      name: String,
      age: Number,
      gender: String,
      bio: String,
      goals: String,
      preferences: String,
      // Add more fields as needed
    },
    // Badges earned by the user
    badges: [
      {
        title: String,
        description: String,
        icon: String,
        color: String,
        awardedAt: { type: Date, default: Date.now },
      },
    ],
    // Cached quests (updated daily)
    questCache: {
      quests: Schema.Types.Mixed,
      updatedAt: Date,
    },
    // Internal quest logs for AI
    questLogs: [
      {
        date: { type: Date, default: Date.now },
        skippedSections: [String],
        progress: Schema.Types.Mixed,
      },
    ],
    // Milestones for badge awarding
    milestones: [
      {
        badge: String,
        achieved: Boolean,
        achievedAt: Date,
        criteria: String,
      },
    ],
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    passives: [
      {
        title: String,
        description: String,
        unlockCondition: String,
        awardedAt: { type: Date, default: Date.now },
      },
    ],
    titles: [
      {
        title: String,
        description: String,
        unlockCondition: String,
        awardedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Force recompilation of the model in dev/hot-reload environments
// This ensures we always use the latest schema definition
import mongoose from "mongoose";
if (mongoose.models.User) {
  delete mongoose.models.User;
}

const User = model<IUser>("User", UserSchema);
export default User;
