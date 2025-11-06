import { Schema, model } from "mongoose";
const ErrorLogSchema = new Schema({
  name: String,
  message: String,
  stack: String,
  meta: Schema.Types.Mixed
}, { timestamps: true });
export default model("ErrorLog", ErrorLogSchema);
