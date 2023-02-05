import { Request, Response } from "express";

export const getAllUsers = (_req: Request, res: Response) => {
  return res.status(200).json([{ id: 1, name: "James", email: "james@gmail.com" }]);
};
