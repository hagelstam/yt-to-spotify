import express from "express";
import multer from "multer";
import { download, upload } from "../controllers/apiController";
import { prepareUpload } from "../middleware/prepareUpload";

const apiRouter = express.Router();

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    cb(null, `./uploads/${req.id}`);
  },
  filename: (_req, _file, cb) => {
    cb(null, "in.jpg");
  },
});

const uploadFiles = multer({ storage });

apiRouter.post("/upload", prepareUpload, uploadFiles.single("cover"), upload);
apiRouter.get("/download/:id", download);

export default apiRouter;
