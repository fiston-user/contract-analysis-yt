import mongoose, { Schema } from "mongoose";
import { IUser } from "./user.model";

interface IRisk {
  risk: string;
  explanation: string;
  severity: "low" | "medium" | "high";
}

interface IOpportunity {
  opportunity: string;
  explanation: string;
  impact: "low" | "medium" | "high";
}

interface ICompensationStructure {
  baseSalary: string;
  bonuses: string;
  equity: string;
  otherBenefits: string;
}

export interface IContractAnalysis extends Document {
  userId: IUser["_id"];
  contractText: string;
  risks: IRisk[];
  opportunities: IOpportunity[];
  summary: string;
  recommendations: string[];
  keyClauses: string[];
  legalCompliance: string;
  negotiationPoints: string[];
  contractDuration: string;
  terminationConditions: string;
  overallScore: number;
  compensationStructure: ICompensationStructure;
  performanceMetrics: string[];
  intellectualPropertyClauses: string | string[];
  createdAt: Date;
  version: number;
  userFeedback: {
    rating: number;
    comments: string;
  };
  customFields: { [key: string]: string };
  expirationDate: Date;
  language: string;
  aiModel: string;
  contractType: string;
  financialTerms?: {
    description: string;
    details: string[];
  };
  //   projectId: IProject["_id"];
}

const ContractAnalysisSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  contractText: { type: String, required: true },
  risks: [{ risk: String, explanation: String, severity: String }],
  opportunities: [{ opportunity: String, explanation: String, impact: String }],
  summary: { type: String, required: true },
  recommendations: [{ type: String }],
  keyClauses: [{ type: String }],
  legalCompliance: { type: String },
  negotiationPoints: [{ type: String }],
  contractDuration: { type: String },
  terminationConditions: { type: String },
  overallScore: { type: Number, min: 0, max: 100 },
  compensationStructure: {
    baseSalary: String,
    bonuses: String,
    equity: String,
    otherBenefits: String,
  },
  performanceMetrics: [{ type: String }],
  intellectualPropertyClauses: {
    type: Schema.Types.Mixed,
    validate: {
      validator: function (v: any) {
        return (
          typeof v === "string" ||
          (Array.isArray(v) && v.every((item) => typeof item === "string"))
        );
      },
      message: (props: { value: any }) =>
        `${props.value} is not a valid string or array of strings!`,
    },
  },
  createdAt: { type: Date, default: Date.now },
  version: { type: Number, default: 1 },
  userFeedback: {
    rating: { type: Number, min: 1, max: 5 },
    comments: String,
  },
  customFields: { type: Map, of: String },
  expirationDate: { type: Date, required: false },
  language: { type: String, default: "en" },
  aiModel: { type: String, default: "gemini-pro" },
  contractType: { type: String, required: true },
  financialTerms: {
    description: String,
    details: [String],
  },
  //   projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
});

export default mongoose.model<IContractAnalysis>(
  "ContractAnalysis",
  ContractAnalysisSchema
);
