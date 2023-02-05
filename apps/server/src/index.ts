import app from "./app";
import { PORT } from "./config/constants";

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}`);
});
