import express from "express";

const PORT = 8080;

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  return res.status(200).json({ message: "Hello Team!" });
});

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}`);
});
