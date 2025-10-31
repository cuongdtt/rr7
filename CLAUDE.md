# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Material-UI + React Router example project demonstrating how to integrate Material-UI with React Router v6 using TypeScript and server-side rendering (SSR).

## Common Development Commands

### Development
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run typecheck` - Run TypeScript type checking and generate React Router types

### Package Management
- `npm install` - Install dependencies
- `npm run typecheck` - Generates React Router types via `react-router typegen`

## Architecture Overview

### Routing Architecture
- **File-Based Routing**: Routes are defined in `react-router.config.ts` and implemented in `/app/routes/`
- **Root Layout**: `app/root.tsx` provides the main layout structure and error boundaries
- **Route Components**: Each route in `/app/routes/` exports a component and optional `meta()` function for SEO

### Material-UI Integration
- **Theme Configuration**: `app/theme.tsx` contains the Material-UI theme with CSS variables for light/dark mode
- **Emotion Cache**: `app/createCache.ts` configures Emotion cache for SSR optimization
- **Component Structure**: Uses Container, Typography, and Box patterns for consistent layouts

### SSR Architecture
- **Entry Points**:
  - `app/entry.client.tsx` - Client-side hydration
  - `app/entry.server.tsx` - Server-side rendering with critical CSS extraction
- **CSS Extraction**: Emotion server integration extracts critical styles during SSR
- **Bot Detection**: Special handling for crawlers to ensure complete content loading

### Path Aliases
- `~/*` maps to `./app/*` - Use this for clean imports within the app directory

## Key Files Structure

```
app/
├── root.tsx           # Root layout with theme provider and error boundaries
├── routes.ts         # Route definitions exported for React Router
├── routes/           # Individual route components
├── components/       # Shared reusable components
├── theme.tsx         # Material-UI theme configuration
├── createCache.ts    # Emotion cache setup for SSR
├── entry.client.tsx  # Client-side entry point
└── entry.server.tsx  # Server-side entry point with SSR logic
```

## Development Notes

### Adding New Routes
1. Create route component in `/app/routes/[name].tsx`
2. Export default component and optional `meta()` function
3. React Router automatically detects and includes the route

### Styling Guidelines
- Use Material-UI's `sx` prop for one-off custom styles
- Extend the theme in `app/theme.tsx` for global design changes
- Leverage Emotion's `css` prop for complex component-specific styles

### SSR Considerations
- All components must work on both server and client
- Use `isbot` detection for crawler-specific optimizations
- Critical CSS is automatically extracted and injected during SSR