import path from "path";

export const PORT = process.env.PORT ?? 8080;

export const FILES_PATH = path.join(__dirname, "../../uploads");

export const MB_IN_BYTES = 1_000_000;
