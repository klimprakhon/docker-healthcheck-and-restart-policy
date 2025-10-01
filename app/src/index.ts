import express from "express";

const app = express();

app.get("/", (_req, res) => {
  res.send("Hello World!");
});

// Healthcheck as Readiness Probe
app.get("/health", (_req, res) => {
  res.json({ status: "OK" });
});

app.get("/unhealthy", (_req, res) => {
  res.status(500).json({ error: "Unhealthy" });
});

app.get("/done", (_req, res) => {
  res.json({ message: "Shutting down in 5 seconds with exit code 0" });
  setTimeout(() => {
    process.exit(0);
  }, 5000);
});

app.get("/fail", (_req, res) => {
  res.json({ message: "Crashing in 5 seconds with exit code 1" });
  setTimeout(() => {
    process.exit(1); // non-zero exit -> restart policy triggers
  }, 5000);
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
