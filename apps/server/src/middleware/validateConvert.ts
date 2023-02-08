import { NextFunction, Request, Response } from "express";
import { object, string } from "yup";

const convertSchema = object({
  title: string().min(1).max(50).required(),
  artist: string().min(1).max(50).required(),
  url: string().url().required(),
});

export const validateConvert = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await convertSchema.validate(req.body);
    return next();
  } catch (err) {
    if (err instanceof Error) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(400).json({ error: "missing fields" });
  }
};
