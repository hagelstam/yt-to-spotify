import { NextFunction, Request, Response } from "express";
import { v4 as uuid } from "uuid";

export const setRequestId = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const id = uuid();
  req.id = id;
  return next();
};
