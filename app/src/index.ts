import express from "express";

const app = express();

let unhealthy = false;

app.get("/", (_req, res) => {
  res.send("Hello World!");
});

// Simple health check endpoint
app.get("/health", (_req, res) => {
  if (unhealthy) {
    res.status(500).json({ error: "Unhealthy" });
  } else {
    res.json({ status: "OK" });
  }
});

app.get("/unhealthy", (_req, res) => {
  unhealthy = true;
  res.json({ status: "App will go unhealthy soon" });
});

setInterval(() => {
  if (unhealthy) {
    console.log("Exiting because of unhealthy state...");
    process.exit(1); // non-zero exit -> restart policy triggers
  }
}, 5000); // 5 seconds to go crash

const port = 8000;
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
