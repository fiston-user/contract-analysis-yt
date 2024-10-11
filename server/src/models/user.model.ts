import { Document, model, Schema } from "mongoose";

export interface IUser extends Document {
  googleId: string;
  email: string;
  displayName: string;
  profilePicture: string;
  isPremium: boolean;
}

const UserSchema: Schema = new Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  profilePicture: { type: String },
  isPremium: { type: Boolean, default: false },
});

export default model<IUser>("User", UserSchema);
