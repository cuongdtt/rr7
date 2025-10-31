import express from 'express';
import compression from 'compression';
import { createRequestHandler as createExpressRequestHandler } from '@react-router/express';
import * as build from '../build/server/index.js';

const app = express();

app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable('x-powered-by');

// Redirect HTTP to HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// Handle asset requests
if (process.env.NODE_ENV === 'production') {
  app.use(
    '/build',
    express.static('build/client', {
      immutable: true,
      maxAge: '1y',
    }),
  );
} else {
  app.use('/build', express.static('build/client', { maxAge: '1h' }));
}

// Everything else is handled by React Router
app.all(
  '*',
  createExpressRequestHandler({
    build,
    mode: process.env.NODE_ENV,
  }),
);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});

export default app;
