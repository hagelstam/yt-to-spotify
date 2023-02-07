import express from "express";
import { download, upload } from "../controllers/apiController";

const apiRouter = express.Router();

apiRouter.post("/upload", upload);
apiRouter.get("/download/:id", download);

export default apiRouter;
