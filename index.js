/**

* Main Server Entry Point
*
* Responsibilities:
* * Initialize the HTTP server
* * Connect to MongoDB (via native driver)
* * Initialize default tiers
* * Start listening on configured port
    */
   
require("module-alias/register");
const http = require("http");
const app = require("./src/app");
const { connectDB } = require("./src/config/db.config");
const config = require("./src/config/app.config");
const Tier = require("./src/models/Tier");

// Create an HTTP server using the Express app
const server = http.createServer(app);

/**

* Initialize DB + start server
  */
const startServer = async () => {
  try {
    await connectDB();

    await Tier.initializeTiers();
    console.log("[TIERS] Default tiers initialized");

    server.listen(config.PORT, () => {
      console.log(`[SERVER] Running at ${config.BASE_URL}`);
    });
  } catch (err) {
    console.error("[STARTUP ERROR]", err.message || err);
    process.exit(1);
  }
};

startServer();
