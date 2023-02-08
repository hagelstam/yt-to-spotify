import { NextFunction, Request, Response } from "express";
import fs from "fs";
import { v4 as uuid } from "uuid";
import { FILES_PATH } from "../utils/constants";

export const prepareConvert = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const id = uuid();
  fs.mkdirSync(`${FILES_PATH}/${id}`);

  req.id = id;
  return next();
};
