import { Schema, model, Document } from "mongoose";
import mongoose from "mongoose";

export interface ISetupResponse extends Document {
  userId: string;
  responses: {
    strength: {
      question: string;
      answer: string;
    };
    vitality: {
      question: string;
      answer: string;
    };
    agility: {
      question: string;
      answer: string;
    };
    intelligence: {
      question: string;
      answer: string;
    };
    perception: {
      question: string;
      answer: string;
    };
  };
  createdAt: Date;
}

const SetupResponseSchema = new Schema<ISetupResponse>(
  {
    userId: { type: String, required: true },
    responses: {
      strength: {
        question: String,
        answer: String,
      },
      vitality: {
        question: String,
        answer: String,
      },
      agility: {
        question: String,
        answer: String,
      },
      intelligence: {
        question: String,
        answer: String,
      },
      perception: {
        question: String,
        answer: String,
      },
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Force recompilation of the model in dev/hot-reload environments
if (mongoose.models.SetupResponse) {
  delete mongoose.models.SetupResponse;
}

const SetupResponse = model<ISetupResponse>(
  "SetupResponse",
  SetupResponseSchema
);
export default SetupResponse;
