import express from 'express';
import cors from 'cors';
import { getMonitoringStatus, startMonitoring, stopMonitoring } from './monitoringController.js';

const app = express();
const port = 4000;

// Enable CORS
app.use(cors());

app.use(express.json()); // To parse incoming JSON requests

// POST route for starting monitoring
app.post('/monitoring/start', (req, res) => {
  console.log("POST request received for /monitoring/start");
  startMonitoring(req, res);
});

// POST route for stopping monitoring
app.post('/monitoring/stop', (req, res) => {
  console.log("POST request received for /monitoring/stop");
  stopMonitoring(req, res);
});

// GET route for fetching monitoring status
app.get('/monitoring/status', (req, res) => {
  console.log("GET request received for /monitoring/status");
  getMonitoringStatus(req, res);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
