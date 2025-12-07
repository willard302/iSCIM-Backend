import app from "./app.js";

const isDev = process.env.NODE_ENV === "production";

const { PORT = process.env.PORT } = process.env;
app.listen(PORT, () => console.log( 
  isDev ? `🧪 Dev server running at http://localhost:${PORT}` : `✅ Server running on port ${PORT}`));
