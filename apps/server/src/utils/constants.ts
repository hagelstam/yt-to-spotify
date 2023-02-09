import path from "path";

export const PORT = process.env.PORT ?? 8080;

export const SERVER_URL = process.env.SERVER_URL ?? `http://localhost:${PORT}`;

export const CLIENT_URL = process.env.CLIENT_URL ?? `http://localhost:3000`;

export const FILES_PATH = path.join(__dirname, "../../uploads");
