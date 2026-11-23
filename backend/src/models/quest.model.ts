import { Schema, model, type InferSchemaType } from "mongoose";
import { CATEGORIES } from "../schemas/quest.schema.js";

const questSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 80 },
    description: { type: String, required: true, trim: true, minlength: 10, maxlength: 500 },
    category: { type: String, required: true, enum: CATEGORIES },
    neighborhood: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    difficulty: { type: Number, required: true, min: 1, max: 5 },
    xp: { type: Number, required: true, min: 10, max: 1000 },
    estimatedMinutes: { type: Number, required: true, min: 5, max: 600 },
    deadline: { type: Date, default: null },
    isNight: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    imageUrl: { type: String, trim: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret._id;
        return ret;
      },
    },
  },
);

questSchema.index({ category: 1, neighborhood: 1, difficulty: 1 });

export type Quest = InferSchemaType<typeof questSchema>;
export const QuestModel = model("Quest", questSchema);
