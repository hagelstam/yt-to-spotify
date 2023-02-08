import express from "express";
import { convert, download } from "../controllers/apiController";
import { prepareConvert } from "../middleware/prepareConvert";
import { validateConvert } from "../middleware/validateConvert";
import { multerUpload } from "../utils/multerUpload";

const apiRouter = express.Router();

apiRouter.post(
  "/convert",
  prepareConvert,
  multerUpload.single("cover"),
  validateConvert,
  convert
);
apiRouter.get("/download/:id", download);

export default apiRouter;
