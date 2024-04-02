import createBareServer from '@tomphttp/bare-server-node';
import http from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import serveStatic from 'serve-static';
import * as custombare from './static/customBare.mjs';
import { createRequire } from 'module';
import {authorize, sendToUnauthorizedPage} from './app-auth-utils.js';

const PORT = process.env.PORT || 3000;
const bareServer = createBareServer('/bare/', {
  logErrors: false,
  localAddress: undefined
});

var serve = serveStatic(join(
  dirname(fileURLToPath(import.meta.url)),
  'static/'
), {
  maxAge: 5 * 60 * 1000
});

const server = http.createServer();

server.on('request', async (request, response) => {
  const isAuthorized = await authorize(request, response)

  if (!isAuthorized) {
    sendToUnauthorizedPage(response)
    return
  }

  try {
    if (custombare.route(request, response)) {
      return true;
    }

    if (bareServer.shouldRoute(request)) {
      bareServer.routeRequest(request, response);
    } else {
      serve(request, response, err => {
        response.writeHead(err?.statusCode || 500, null, {
          "Content-Type": "text/plain"
        })
        response.end(err?.stack)
      });
    }
  } catch (e) {
    response.writeHead(500, "Internal Server Error", {
      "Content-Type": "text/plain"
    })
    response.end(e.stack)
  }
});
server.on('upgrade', (req, socket, head) => {
  if (bareServer.shouldRoute(req)) {
    bareServer.routeUpgrade(req, socket, head);
  } else {
    socket.end();
  }
});

server.listen(PORT);

if (process.env.UNSAFE_CONTINUE)
  process.on("uncaughtException", (err, origin) => {
    console.error(`Critical error (${origin}):`)
    console.error(err)
    console.error("UNSAFELY CONTINUING EXECUTION")
    console.error()
  })

console.log(`Server running at http://localhost:${PORT}/.`);
