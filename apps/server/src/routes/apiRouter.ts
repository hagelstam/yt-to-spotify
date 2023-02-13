import express from "express";
import { convert, download } from "../controllers/apiController";
import { validateConvert } from "../middleware/validateConvert";

const apiRouter = express.Router();

apiRouter.post("/convert", validateConvert, convert);
apiRouter.get("/download/:id", download);

export default apiRouter;
