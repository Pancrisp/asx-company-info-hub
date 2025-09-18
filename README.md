# ASX Company Information Dashboard

Visit https://asx-company-info-hub.vercel.app/ to preview app

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Technical design

### Global state management via TickerDataContext

I have elected to use a centralised data management context to ensure ticker price data remains synced across all sections of the app, preventing data inconsistencies and redundant API calls.

```typescript
// Central ticker data context manages all price data
const TickerDataContext = createContext<TickerDataContextValue>({
  getQuoteData, // Unified data accessor
  isTickerLoading, // Loading state management
  watchTickers, // Add tickers to global watch list
  unwatchTickers, // Remove tickers from watch list
  watchedTickers // Current watched ticker list
});
```

### Browser localStorage for persisting tickers in watchlist

Utilising localStorage allows for users to save their watchlists for future reference and comparison needs. Only the ticker symbol is saved, quote data isn't stored as it gets stale quickly. Watchlist state is updated and managed by passing through each ticker to the TickerDataContext

**Benefits of these approaches**

- **Real-time sync** – Updates in one section instantly reflect in all others
- **Memory efficiency** – Single data instance per ticker
- **Consistent UI** – Unified loading states and error handling across sections
- **Component separation of concerns** – Individual components focus solely on UI and presentational logic

### API optimisation

In an ideal scenario, the client would be subscribed to an event based service. But since we're working with standard HTTP requests here, I've chosen to use a balanced approach to polling. Since the data we're working with is delayed by 20 minutes, I have opted to use longer polling intervals to minimise API requests. Considering how we're not working with live data to begin with, I think this is an acceptable trade-off.

Beyond that, aggressive caching also ensures a snappy user experience by serving frequently accessed or static data directly from cache rather than making repeated API requests and avoiding unnecessary DB queries.

- **Parallel requests** – Multiple tickers fetched simultaneously using `useQueries`
- **Cached static data** – Company information is cached indefinitely as it rarely changes
- **Adaptive refetch intervals** – 2 minute intervals during trading hours, 1 hour outside trading hours
- **Background refetch** – Disabled to prevent unnecessary API calls when tab is inactive
- **Retry strategy** – Exponential backoff with maximum 30-second delay
- **Pre-loaded large-cap tickers** – ASX20 stocks metadata (ticker and company name) are included in the app bundle for a better search experience, users can search by company name if they don't know the ticker symbol. The trending stocks section also utilises this metadata. I've only included the top 20 stocks, but there's the option of including ASX200 or even the whole share registry, the impact on the main bundle would be around ~40KB gzipped. The search bar has a fallback state if users search for a ticker outside this list.
  ![CleanShot 2025-09-18 at 14 14 07](https://github.com/user-attachments/assets/fd6d4f39-70e7-4b51-9826-2dedf92a5edc)

### Other considerations and future enhancements

- **Add jitter to polling intervals** – Helps fan-out requests to avoid spikes, reducing peak load on backend services. I've tried implementing this but React Query has their own scheduler for the refetchInterval that inteferes with jitter functions, resulting in edge cases where queries are not consistently being executed.
- **Real-time WebSocket integration** – Live price streaming during market hours, eliminating the need for constant polling. The app currently makes requests for each ticker every 2 minutes, that's very taxing on origin servers.
- **Access to historical data** – Historical price data will allow for more practical comparison features like comparing performance across a time period.
- **Export functionality** – Watchlist and data export options
- **Allow sorting of watchlist columns** – Watchlisted stocks can be sorted by different metrics to allow for easier analysis in bigger tables.

## Product features

- **Instant search experience** – Preloaded tickers allow for instant filtering without debounce delays
- **Trending stocks list** – Pre-loaded popular ASX stocks with frequent price updates
- **Company information** – Detailed company profiles and key statistics
- **Customisable watchlist** – Doubles as a simple comparison tool, add/remove stocks with persistent storage
- **Keyboard navigation** – Fully keyboard accessible interface with intuitive shortcuts

### Addressing User Pain Points

Based on the business case analysis, this app addresses several of the pain points identified in user research:

- **Design decision: Watchlist vs side-by-side comparison** – Rather than implementing the side-by-side card comparison feature outlined in the business case, we opted for a unified watchlist approach that better supports scanning multiple tickers (4 or more). Side-by-side cards become increasingly difficult to scan for comparable metrics as the number of stocks increases, particularly on mobile devices. The watchlist format allows users to quickly scan key metrics across multiple stocks in a consistent vertical layout, making it easier to identify patterns and outliers at a glance.

- **Inefficient multi-tab workflow** – The watchlist feature eliminates the need for users to open multiple browser tabs to track stocks of interest. Users can add stocks to their persistent watchlist and view updates in one place.

- **Mobile experience** – Unlike tab-switching on mobile devices which was identified as "particularly cumbersome," the responsive design provides a streamlined mobile experience with the watchlist and trending stocks accessible from one dashboard.

- **Data loss prevention** – The localStorage-based watchlist persistence ensures users don't lose their curated stock lists.

- **Cognitive overload reduction** – Instead of mentally tracking differences across multiple tabs, the color-coded change indicators and unified interface reduce the cognitive load of monitoring multiple stocks simultaneously.
