import multer from "multer";
import { FILES_PATH } from "./constants";

const MB_IN_BYTES = 1_000_000;

export const multerUpload = multer({
  limits: { fileSize: 5 * MB_IN_BYTES, files: 1 },
  storage: multer.diskStorage({
    destination: (req, _file, cb) => {
      cb(null, `${FILES_PATH}/${req.id}`);
    },
    filename: (_req, _file, cb) => {
      cb(null, "cover.png");
    },
  }),
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/jpg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});
