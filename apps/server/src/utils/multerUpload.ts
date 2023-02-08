import multer from "multer";
import { FILES_PATH, MB_IN_BYTES } from "./constants";

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
    console.log(file.mimetype);
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
