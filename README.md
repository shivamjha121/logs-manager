# API Logger Middleware with MongoDB and Winston

This project provides a reusable logging middleware for Node.js applications using Express and MongoDB via Mongoose. It logs detailed API request and response data including metadata such as request/response bodies, headers, status codes, and more.

## Features
- Logs incoming API requests and outgoing responses
- Captures request/response bodies and headers
- Saves logs to MongoDB
- Uses Winston for formatted console output
- Custom logger function for manual log entries

## Installation
```bash
npm install logs-manager
```

## Usage

### 1. Connect to MongoDB
```js
import { connectMongoDB } from 'logs-manager';

await connectMongoDB('mongodb://localhost:27017/your-db');
```

### 2. Use Middleware in Express App
```js
import express from 'express';
import { apiRequestLogger } from 'logs-manager';

const app = express();
app.use(express.json());
app.use(apiRequestLogger('MyApp'));
```

### 3. Manually Log Data
```js
import { logData } from 'logs-manager';

await logData('MyApp', 'error', 'Something went wrong', {
  method: 'POST',
  url: '/example',
  statusCode: 500,
  responseTime: 120,
  error: { message: 'Unexpected error' },
});
```

### 4. Full Example
```js
import {
    apiRequestLogger,
    connectMongoDB,
    logData,
} from "logs-manager";
import express from "express";

const app = express();
const port = 3000;
const mongoUrl = "mongo url";
const appName = "testapp";

connectMongoDB(mongoUrl);

app.use(express.json());
app.use(apiRequestLogger(appName));

app.get("/", (req, res) => {
    res.send("Hello from test app!");
});

app.get("/error", (req, res) => {
    res.status(500).json({ staus: 500, error: "Internal server error" });
});

app.get("/log", async (req, res) => {
    await logData(appName, "info", "Manually logged from /log route", {
        body: req.body,
    });
    res.send("Custom log saved.");
});

app.listen(port, () => {
    console.log(`🚀 Listening on http://localhost:${port}`);
});
```

## Log Schema Fields
- `appName`: Application identifier (string, required)
- `level`: Log level (`info`, `error`, etc.)
- `message`: Log message
- `timestamp`: Date and time
- `method`: HTTP method (GET, POST, etc.)
- `url`: Request URL
- `statusCode`: HTTP status code
- `responseTime`: Time taken for response (ms)
- `requestBody`: Body of the request
- `requestHeaders`: Request headers
- `responseBody`: Body of the response
- `responseHeaders`: Response headers
- `error`: Error object if any

## Dependencies
- [mongoose](https://www.npmjs.com/package/mongoose)

## License
MIT
