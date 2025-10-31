# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Material-UI + React Router v7 example project demonstrating how to integrate Material-UI with React Router v7 using TypeScript and server-side rendering (SSR).

## Common Development Commands

### Server Management
- `npm run dev` - Start development server with PM2 auto-restart and Vite HMR
- `npm run start` - Start production server with optimized static asset serving
- `npm run stop` - Stop PM2 server
- `npm run restart` - Restart PM2 server
- `npm run logs` - View PM2 server logs (last 100 lines)
- `npm run delete` - Delete PM2 process

### Build and Type Checking
- `npm run build` - Build the application for production (React Router v7 build process)
- `npm run typecheck` - Run TypeScript type checking and generate React Router types via `react-router typegen`

## Architecture Overview

### Hybrid Express + React Router v7 Server Architecture
- **Main Server** (`server.ts`): Express server that conditionally loads development or production modes
- **Development Mode**: Uses Vite dev server with middleware mode for HMR and SSR loading `./server/app.ts` via `viteDevServer.ssrLoadModule()`
- **Production Mode**: Serves static assets with cache headers and uses `@react-router/express` with compiled server bundle from `./build/server/index.js`
- **React Router Handler** (`server/app.ts`): Express app with context injection using `@react-router/express`

**Development Mode Pattern:**
```typescript
const viteDevServer = await import("vite").then(vite =>
  vite.createServer({ server: { middlewareMode: true } })
);
app.use(viteDevServer.middlewares);
app.use(async (req, res, next) => {
  const source = await viteDevServer.ssrLoadModule('./server/app.ts');
  const handler = source.app;
  return handler(req, res, next);
});
```

**Production Mode Pattern:**
```typescript
app.use('/build', express.static('build/client', { immutable: true, maxAge: '1y' }));
app.use(createRequestHandler({
  build: await import('./build/server/index.js'),
  mode: 'production',
}));
```

### React Router v7 App Structure
- **File-Based Routing**: Routes automatically detected from `/app/routes/` directory
- **Route Components**: Export default component and optional `meta()` function for SEO
- **Context Injection**: Server can inject context via `getLoadContext()` in `server/app.ts`

### Material-UI + Emotion SSR Integration
- **Theme Configuration** (`app/theme.tsx`): Material-UI v7 theme with CSS variables for light/dark mode
- **Emotion Cache** (`app/createCache.ts`): Custom cache with `@layer mui` for style encapsulation and SSR optimization
- **Streaming SSR**: Uses `renderToPipeableStream` with bot detection and critical CSS extraction
- **Layer Management**: Emotion server integration wraps styles in CSS layers to prevent conflicts

### Path Aliases
- `~/*` maps to `./app/*` - Use this for clean imports within the app directory

## Key Files Structure

```
server/
├── server.ts          # Main Express server with dev/prod mode switching
└── app.ts            # React Router v7 handler with context injection

app/
├── root.tsx          # Root layout with theme provider and streaming SSR
├── routes/           # File-based routing components
├── components/       # Shared reusable components
├── theme.tsx         # Material-UI theme with CSS variables
├── createCache.ts    # Emotion cache with layer management
├── entry.client.tsx  # Client-side hydration with HydratedRouter
└── entry.server.tsx  # Advanced SSR with streaming and CSS extraction
```

## Development Notes

### Adding New Routes
1. Create route component in `/app/routes/[name].tsx`
2. Export default component and optional `meta()` function
3. React Router v7 automatically detects and includes the route

### Server Context Pattern
The server uses `getLoadContext()` to inject values that can be accessed in route loaders/actions:
```typescript
// server/app.ts
getLoadContext() {
  return { VALUE_FROM_EXPRESS: 'Hello from Express' };
}

// In route loader
export async function loader({ context }: LoaderFunctionArgs) {
  console.log(context.VALUE_FROM_EXPRESS); // 'Hello from Express'
}
```

### SSR Streaming Architecture
- Uses React 18's `renderToPipeableStream` for progressive rendering
- Custom transform stream handles HTML and CSS injection
- Bot detection with `isbot` for complete content loading vs streaming
- 5-second stream timeout with comprehensive error boundaries

### Emotion + Material-UI Integration
- **Critical CSS Extraction**: Server-side emotion integration extracts and injects critical styles
- **Layer-Based Organization**: Custom emotion cache wraps all styles in `@layer mui`
- **Client-Side Hydration**: Maintains style continuity between server and client
- **Development Workarounds**: Vite SSR config has specific optimizations for Material-UI

### TypeScript Configuration
- React Router v7 type generation via `react-router typegen`
- Path alias resolution for `~/*` imports
- Full type safety for server context and route loaders/actions