/* eslint-disable @typescript-eslint/naming-convention */
import express from 'express';
import compression from 'compression';
import morgan from 'morgan';
import type { Express, Request, Response, NextFunction } from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// TypeScript interfaces for type safety
interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
  port: number;
  memory: NodeJS.MemoryUsage;
}

interface ApiStatusResponse {
  message: string;
  version: string;
  environment: string;
  timestamp: string;
}

interface ServerError extends Error {
  status?: number;
}

const app: Express = express();

// Trust proxy for proper client IP detection
app.set('trust proxy', true);

// Security middleware
app.use((req: Request, res: Response, next: NextFunction): void => {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Disable X-Powered-By header for security
  res.removeHeader('X-Powered-By');

  next();
});

// Compression middleware
app.use(compression());

// CORS middleware (customize as needed)
app.use((req: Request, res: Response, next: NextFunction): void => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  next();
});

// Request logging middleware
if (process.env.NODE_ENV === 'production') {
  // Production logging with structured format
  app.use(morgan('combined'));
} else {
  // Development logging with more detail
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req: Request, res: Response): void => {
  const healthData: HealthResponse = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    port: Number(process.env.PORT) || 3000,
    memory: process.memoryUsage(),
  };

  res.status(200).json(healthData);
});

// API status endpoint
app.get('/api/status', (req: Request, res: Response): void => {
  const statusData: ApiStatusResponse = {
    message: 'Server is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  };

  res.status(200).json(statusData);
});

// Static file serving with proper caching
if (process.env.NODE_ENV === 'production') {
  // Production: aggressive caching for static assets
  app.use(
    '/build',
    express.static(join(__dirname, 'build/client'), {
      immutable: true,
      maxAge: '1y',
      etag: true,
      lastModified: true,
    }),
  );
} else {
  // Development: lighter caching for easier debugging
  app.use('/build', express.static('build/client'));
}

// Request timing middleware
app.use((req: Request, res: Response, next: NextFunction): void => {
  const start: number = Date.now();

  res.on('finish', (): void => {
    const duration: number = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });

  next();
});

// Demo page with Material-UI and React Router fallback
app.get('/middleware-demo', (req: Request, res: Response): void => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Express Middleware Demo</title>
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Roboto', sans-serif;
          margin: 0;
          padding: 20px;
          background: #f5f5f5;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          background: white;
          padding: 32px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 { color: #1976d2; }
        .endpoint {
          background: #e3f2fd;
          padding: 12px;
          margin: 8px 0;
          border-radius: 4px;
          border-left: 4px solid #1976d2;
        }
        .method {
          display: inline-block;
          background: #1976d2;
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 Express Server Middleware Demo</h1>
        <p>This server demonstrates custom middleware features with TypeScript:</p>

        <h2>✅ Available Endpoints</h2>
        <div class="endpoint">
          <span class="method">GET</span> <strong>/health</strong> - Server health check with memory usage
        </div>
        <div class="endpoint">
          <span class="method">GET</span> <strong>/api/status</strong> - API status information
        </div>
        <div class="endpoint">
          <span class="method">GET</span> <strong>/middleware-demo</strong> - This demonstration page
        </div>
        <div class="endpoint">
          <span class="method">GET</span> <strong>/</strong> - React Router application (if available)
        </div>

        <h2>🔧 Middleware Features</h2>
        <ul>
          <li>✅ Security headers (X-Content-Type-Options, X-Frame-Options, etc.)</li>
          <li>✅ GZIP compression</li>
          <li>✅ CORS headers</li>
          <li>✅ Request logging (Morgan)</li>
          <li>✅ Request timing</li>
          <li>✅ Error handling</li>
          <li>✅ Static file serving</li>
          <li>✅ Health check endpoint</li>
          <li>✅ Graceful shutdown handling</li>
          <li>✅ TypeScript type safety</li>
        </ul>

        <h2>🔍 Request Headers</h2>
        <pre>${JSON.stringify(req.headers, null, 2)}</pre>

        <h2>📊 Server Information</h2>
        <ul>
          <li>Environment: ${process.env.NODE_ENV || 'development'}</li>
          <li>Node.js Version: ${process.version}</li>
          <li>Server Uptime: ${Math.floor(process.uptime())} seconds</li>
          <li>Process ID: ${process.pid}</li>
          <li>TypeScript: ✅ Enabled</li>
        </ul>
      </div>
    </body>
    </html>
  `);
});

// React Router request handler (merged from server/app.ts)
if (process.env.REACT_ROUTER_MODE === 'production') {
  // Production React Router mode (minimal server)
  // Use dynamic import with .then() to avoid top-level await issues
  import('@react-router/express')
    .then(({ createRequestHandler: createExpressRequestHandler }) => {
      // Use dynamic import for the build
      return import('./build/server/index.js').then((build) => {
        return { createExpressRequestHandler, build };
      });
    })
    .then(({ createExpressRequestHandler, build }) => {
      app.use(
        createExpressRequestHandler({
          build,
          mode: process.env.NODE_ENV,
        }),
      );
    })
    .catch((error) => {
      console.error('Failed to load React Router production handler:', error);

      // Fallback to development mode if production fails
      app.use(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const { default: createRequestHandler } = (await import('@react-router/serve')) as any;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const handler = createRequestHandler({
            build: (await import('./build/server/index.js')) as any,
          });
          return handler(req, res, next);
        } catch (fallbackError) {
          // If React Router app is not available, show a friendly message
          console.log('React Router app not available, serving fallback page');
          res.status(404).send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>Express Server</title>
              <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
              <style>
                body { font-family: 'Roboto', sans-serif; margin: 0; padding: 20px; background: #f5f5f5; text-align: center; }
                .container { max-width: 600px; margin: 50px auto; background: white; padding: 32px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                h1 { color: #1976d2; }
                .mode-toggle { margin: 20px 0; padding: 10px; background: #e3f2fd; border-radius: 4px; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>🚀 Express Server Running</h1>
                <p>The Express server with TypeScript and custom middleware is working!</p>
                <div class="mode-toggle">
                  <p><strong>Mode:</strong> ${process.env.NODE_ENV || 'development'}</p>
                  <p><small>Production mode failed to load React Router, running in fallback mode</small></p>
                </div>
                <p><a href="/health">Health Check</a> | <a href="/api/status">API Status</a> | <a href="/middleware-demo">Middleware Demo</a></p>
              </div>
            </body>
            </html>
          `);
        }
      });
    });
} else {
  // Development mode with custom middleware
  app.use(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Try to serve the React Router app if available
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { default: createRequestHandler } = (await import('@react-router/serve')) as any;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const handler = createRequestHandler({
        build: (await import('./build/server/index.js')) as any,
      });
      return handler(req, res, next);
    } catch (error) {
      // If React Router app is not available, show a friendly message
      console.log('React Router app not available, serving fallback page');
      res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Express Server</title>
          <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Roboto', sans-serif; margin: 0; padding: 20px; background: #f5f5f5; text-align: center; }
            .container { max-width: 600px; margin: 50px auto; background: white; padding: 32px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            h1 { color: #1976d2; }
            .mode-toggle { margin: 20px 0; padding: 10px; background: #e3f2fd; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🚀 Express Server Running</h1>
            <p>The Express server with TypeScript and custom middleware is working!</p>
            <div class="mode-toggle">
              <p><strong>Mode:</strong> ${process.env.NODE_ENV || 'development'}</p>
              <p><small>Use <code>REACT_ROUTER_MODE=production</code> for React Router optimization</small></p>
            </div>
            <p><a href="/health">Health Check</a> | <a href="/api/status">API Status</a> | <a href="/middleware-demo">Middleware Demo</a></p>
          </div>
        </body>
        </html>
      `);
    }
  });
}

// Error handling middleware
app.use((err: ServerError, req: Request, res: Response, next: NextFunction): void => {
  console.error('Server error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  const isProduction: boolean = process.env.NODE_ENV === 'production';

  const errorResponse: {
    error: string;
    stack?: string;
  } = {
    error: isProduction ? 'Internal Server Error' : err.message,
  };

  if (!isProduction && err.stack) {
    errorResponse.stack = err.stack;
  }

  res.status(err.status || 500).json(errorResponse);
});

const port: number = Number(process.env.PORT) || 3000;

app.listen(port, (): void => {
  console.log(`🚀 Express server listening on port ${port}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🏥 Health check: http://localhost:${port}/health`);
  console.log(`📊 API status: http://localhost:${port}/api/status`);
  console.log(`🎭 Middleware demo: http://localhost:${port}/middleware-demo`);
  console.log(`📝 TypeScript: ✅ Enabled`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});

// Graceful shutdown handling
process.on('SIGTERM', (): void => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', (): void => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});
