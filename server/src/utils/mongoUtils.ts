import mongoose from "mongoose";

export function isValidMongoId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}
