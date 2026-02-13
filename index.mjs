import http from 'node:http';
import { createBareServer } from '@tomphttp/bare-server-node';
import express from 'express';
import { hostname } from "node:os";
import { authorize, sendToUnauthorizedPage, shouldDisableCache } from './auth-utils.js';
import {logInfo, logText} from './console-logger.js'

const httpServer = http.createServer();

const app = express();

app.use(express.static("src"));

const bareServer = createBareServer('/y/');

httpServer.on('request', async (req, res) => {
  const isAuthorized = await authorize(req, res)
  if (shouldDisableCache(req)) {
    res.setHeader("Cache-control", "no-cache")
  }
  if (!isAuthorized) {
    res.writeHead(301, { Location: "https://desmos.com/calculator" });
    res.end();
    return
  }

  if (bareServer.shouldRoute(req)) {
    bareServer.routeRequest(req, res);
  } else {
    app(req, res);
  }
});

httpServer.on('upgrade', (req, socket, head) => {
  if (bareServer.shouldRoute(req)) {
    bareServer.routeUpgrade(req, socket, head);
  } else {
    socket.end();
  }
});

httpServer.on('listening', () => {
  const address = httpServer.address();
  logInfo("Listening on:");
  logText(`\thttp://localhost:${address.port}`);
  logText(`\thttp://${hostname()}:${address.port}`);
  logText(
    `\thttp://${address.family === "IPv6" ? `[${address.address}]` : address.address
    }:${address.port}`
  );
});



httpServer.listen({
  port: 3000,
});
