import express from "express";
import multer from "multer";
import { download, upload } from "../controllers/apiController";
import { prepareUpload } from "../middleware/prepareUpload";
import { MB_IN_BYTES } from "../utils/constants";

const apiRouter = express.Router();

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    cb(null, `./uploads/${req.id}`);
  },
  filename: (_req, _file, cb) => {
    cb(null, "cover.jpg");
  },
});

const uploadFiles = multer({
  storage,
  limits: { files: 1, fileSize: 10 * MB_IN_BYTES },
});

apiRouter.post("/upload", prepareUpload, uploadFiles.single("cover"), upload);
apiRouter.get("/download/:id", download);

export default apiRouter;
