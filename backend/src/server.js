import app from "./app.js";
import { connectDB, sequelize } from "./config/db.js";

const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
  // Connect to MySQL
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`
=============================================================
  🏢 LAXMI ENTERPRISES ERP - BACKEND API SERVER
  🚀 Status: Running on http://localhost:${PORT}
  📡 API Base: http://localhost:${PORT}/api/v1
  🩺 Health: http://localhost:${PORT}/api/health
  🛢️ Database: MySQL (Hostinger Ready)
  ⚙️ Environment: ${process.env.NODE_ENV || "development"}
=============================================================
    `);
  });

  // Graceful shutdown handling
  const shutdown = async (signal) => {
    console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      try {
        await sequelize.close();
        console.log("🔒 MySQL connection pool closed.");
        process.exit(0);
      } catch (err) {
        console.error("Error closing MySQL connection:", err);
        process.exit(1);
      }
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};

startServer();
