import { Request, Response } from "express";

export const getUser = (_req: Request, res: Response) => {
  return res.status(200).json({ user: "James" });
};
