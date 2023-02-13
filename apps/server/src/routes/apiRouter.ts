import express from "express";
import { convert, download } from "../controllers/apiController";
import { setRequestId } from "../middleware/setReqestId";
import { uploadCover } from "../middleware/uploadCover";
import { validateConvert } from "../middleware/validateConvert";

const apiRouter = express.Router();

apiRouter.post(
  "/convert",
  setRequestId,
  uploadCover.single("cover"),
  validateConvert,
  convert
);
apiRouter.get("/download/:id", download);

export default apiRouter;
