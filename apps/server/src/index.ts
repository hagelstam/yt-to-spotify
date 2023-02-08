import app from "./app";
import { PORT, SERVER_URL } from "./utils/constants";

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} on ${SERVER_URL}`);
});
