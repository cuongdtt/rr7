import { PassThrough } from "node:stream";
import type { EntryContext } from "react-router";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter } from "react-router";
import * as ReactDOM from 'react-dom/server'
import { CacheProvider } from "@emotion/react";
import createEmotionCache from "./createCache";

const streamTimeout = 5000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext
) {
  const cache = createEmotionCache();
  return new Promise((resolve, reject) => {
    const { pipe, abort } = ReactDOM.renderToPipeableStream(
      <CacheProvider value={cache}>
        <ServerRouter
          context={routerContext}
          url={request.url}
        />
      </CacheProvider>,
      {
        onShellReady() {
          responseHeaders.set("Content-Type", "text/html");

          const body = new PassThrough();
          const stream =
            createReadableStreamFromReadable(body);

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            })
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
      }
    );
    setTimeout(abort, streamTimeout + 1000);
  });
}
