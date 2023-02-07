import express from "express";
import { download, upload } from "../controllers/apiController";
import { prepareUpload } from "../middleware/prepareUpload";

const apiRouter = express.Router();

apiRouter.post("/upload", prepareUpload, upload);
apiRouter.get("/download/:id", download);

export default apiRouter;
