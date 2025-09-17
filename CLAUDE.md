# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Install dependencies
npm install

# Development server with Turbopack
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Run tests
npm test

# Run tests in watch mode
npm test:watch

# Test coverage
npm test:coverage
```

## Architecture Overview

### Global State Management

The app uses a centralized `TickerDataContext` for managing all ticker price data across components. This prevents data inconsistencies and redundant API calls:

- **TickerDataProvider**: Central data management system at `/src/contexts/TickerDataContext.tsx`
- **Global ticker watching**: Components can watch/unwatch tickers via context methods
- **Unified data access**: All components access quote data through `getQuoteData(ticker)`
- **Loading state management**: Centralized loading states per ticker

### Data Persistence

- **Watchlist persistence**: Uses localStorage with key `asx-watchlist` to save user watchlists
- **Only ticker symbols stored**: Quote data is not persisted as it becomes stale
- **Automatic trending stocks**: Top 6 ASX stocks are pre-loaded on initialization

### API Strategy

The app implements aggressive caching and smart refetch intervals:

- **Parallel requests**: Uses TanStack Query's `useQueries` for multiple tickers
- **Adaptive intervals**: 2 minutes during trading hours (10am-4pm AEST), 1 hour outside
- **Company data**: Cached indefinitely (`staleTime: Infinity`)
- **Quote data**: 3-minute stale time during trading hours, 1 hour outside
- **Proxy API**: All external requests go through `/src/app/api/proxy/[...path]/route.ts`

### Key Features Structure

- **TrendingStocks** (`/src/features/TrendingStocks/`): Pre-loaded ASX20 stocks display
- **KeyStatistics** (`/src/features/KeyStatistics/`): Company information and detailed metrics
- **Watchlist** (`/src/features/Watchlist/`): User's saved ticker tracking with localStorage

### Testing Setup

- **Jest configuration**: `/jest.config.js` with Next.js integration
- **Test setup**: `/jest.setup.js` for global test configuration
- **Path mapping**: `@/` alias resolves to `/src/`
- **Test environment**: jsdom for React component testing
- **Coverage**: Excludes main app layout files

### Type Definitions

Core data types are defined in `/src/types/schema.ts`:
- **QuoteData**: Market data interface with price, volume, ratios
- **CompanyData**: Company information structure
- **Stock**: Basic ticker and name pairing

### Key Hooks

- **useTickerData**: Primary hook for individual ticker data (quote + company)
- **useMultipleQuoteData**: Bulk ticker data fetching with parallel queries
- **useWatchlist**: Local storage management for user watchlists

## Framework & Libraries

- **Next.js 15.5.3** with Turbopack for development and build
- **React 19** with TypeScript
- **TailwindCSS 4** for styling
- **TanStack Query v5** for data fetching and caching
- **Headless UI** and **Heroicons** for UI components
- **Jest** with React Testing Library for testing