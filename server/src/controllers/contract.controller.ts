import { Request, Response } from "express";
import multer from "multer";
import { IUser } from "../models/user.model";
import redis from "../config/redis";
import {
  analyzeContractWithAI,
  detectContractType,
  extractTextFromPDF,
} from "../services/ai.services";
import ContractAnalysisSchema, {
  IContractAnalysis,
} from "../models/contract.model";
import mongoose, { FilterQuery } from "mongoose";
import { isValidMongoId } from "../utils/mongoUtils";

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(null, false);
      cb(new Error("Only pdf files are allowed"));
    }
  },
}).single("contract");

export const uploadMiddleware = upload;

export const detectAndConfirmContractType = async (
  req: Request,
  res: Response
) => {
  const user = req.user as IUser;

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const fileKey = `file:${user._id}:${Date.now()}`;
    await redis.set(fileKey, req.file.buffer);

    await redis.expire(fileKey, 3600); // 1 hour

    const pdfText = await extractTextFromPDF(fileKey);
    const detectedType = await detectContractType(pdfText);

    await redis.del(fileKey);

    res.json({ detectedType });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to detect contract type" });
  }
};

export const analyzeContract = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { contractType } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  if (!contractType) {
    return res.status(400).json({ error: "No contract type provided" });
  }

  try {
    const fileKey = `file:${user._id}:${Date.now()}`;
    await redis.set(fileKey, req.file.buffer);
    await redis.expire(fileKey, 3600); // 1 hour

    const pdfText = await extractTextFromPDF(fileKey);
    let analysis;

    analysis = await analyzeContractWithAI(pdfText, contractType);
    console.log(analysis);

    //@ts-ignore
    // if (!analysis.summary || !analysis.risks || !analysis.opportunities) {
    //   throw new Error("Failed to analyze contract");
    // }

    const savedAnalysis = await ContractAnalysisSchema.create({
      userId: user._id,
      contractText: pdfText,
      contractType,
      ...(analysis as Partial<IContractAnalysis>),
      language: "en",
      aiModel: "gemini-pro",
    });

    res.json(savedAnalysis);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to analyze contract" });
  }
};

export const getUserContracts = async (req: Request, res: Response) => {
  const user = req.user as IUser;

  try {
    interface QueryType {
      userId: mongoose.Types.ObjectId;
    }

    const query: QueryType = { userId: user._id as mongoose.Types.ObjectId };
    const contracts = await ContractAnalysisSchema.find(
      query as FilterQuery<IContractAnalysis>
    ).sort({ createdAt: -1 });

    res.json(contracts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to get contracts" });
  }
};

export const getContractByID = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user as IUser;

  if (!isValidMongoId(id)) {
    return res.status(400).json({ error: "Invalid contract ID" });
  }

  try {
    const cachedContracts = await redis.get(`contract:${id}`);
    if (cachedContracts) {
      return res.json(cachedContracts);
    }

    //if not in cache, get from db
    const contract = await ContractAnalysisSchema.findOne({
      _id: id,
      userId: user._id,
    });

    if (!contract) {
      return res.status(404).json({ error: "Contract not found" });
    }

    //Cache the results for future requests
    await redis.set(`contract:${id}`, contract, { ex: 3600 }); // 1 hour

    res.json(contract);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get contract" });
  }
};
