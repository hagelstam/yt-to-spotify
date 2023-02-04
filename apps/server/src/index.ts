import cors from "cors";
import express from "express";

const PORT = 8080;

const app = express();

app.disable("x-powered-by");
app.use(express.json());
app.use(cors());

app.get("/", (_req, res) => {
  return res.json({ message: "Hello Team!" });
});

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}`);
});
