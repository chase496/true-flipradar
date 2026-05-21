# FlipRadar — Dropshipping Intelligence Platform

AI-powered product research for dropshippers. Built with React, Node/Express, and the Anthropic API.

## Features

| Feature | Description |
|---|---|
| **Winning Product Feed** | Daily AI-generated dashboard of 12 curated products across 4 niches, cached for 24 hours |
| **Product Trend Scanner** | Enter any niche and get 7 AI-analysed products with flip scores, margins, and key risks (5 free/day) |
| **Supplier Finder** | Platform-by-platform sourcing playbooks for AliExpress, CJDropshipping, and Alibaba |
| **Profit Calculator** | Real-time profit/margin calculation with actual platform fees for eBay, Amazon, and Shopify |
| **Competition Analyser** | Market saturation scores, gap analysis, and enter/avoid verdicts |

## Tech Stack

- **Frontend**: React 18, React Router v6, Tailwind CSS, Vite
- **Backend**: Node.js, Express, Server-Sent Events (SSE) for streaming
- **AI**: Anthropic API (`claude-sonnet-4-6`) via `@anthropic-ai/sdk`
- **Monetisation**: Free tier (5 scans/day) + Pro upgrade modal

## Quick Start

### 1. Clone and install

```bash
cd flipradar
npm run install:all
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-...
PORT=3001
CLIENT_URL=http://localhost:5173
```

Get an API key at [console.anthropic.com](https://console.anthropic.com).

### 3. Run in development

```bash
npm run dev
```

This starts both the Express server (port 3001) and the Vite dev server (port 5173) concurrently.

Open [http://localhost:5173](http://localhost:5173).

## Project Structure

```
flipradar/
├── package.json          # Root workspace — runs server + client together
├── .env.example
├── server/
│   ├── package.json
│   ├── index.js          # Express app, CORS, routes
│   ├── middleware/
│   │   └── rateLimit.js  # 5 free scans/day per client ID
│   └── routes/
│       ├── scanner.js    # POST /api/scanner — SSE stream
│       ├── supplier.js   # POST /api/supplier — SSE stream
│       ├── competition.js# POST /api/competition — SSE stream
│       └── feed.js       # GET /api/feed, POST /api/feed/refresh
└── client/
    ├── package.json
    ├── vite.config.js    # Proxies /api → localhost:3001
    ├── tailwind.config.js
    ├── src/
    │   ├── App.jsx
    │   ├── hooks/
    │   │   └── useStreaming.js   # SSE reader with abort + error handling
    │   ├── utils/
    │   │   ├── clientId.js      # localStorage UUID for rate limiting
    │   │   └── fees.js          # Platform fee calculations
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── ProductCard.jsx
    │   │   ├── FlipScoreBadge.jsx
    │   │   └── UpgradeModal.jsx
    │   └── pages/
    │       ├── Dashboard.jsx
    │       ├── Scanner.jsx
    │       ├── SupplierFinder.jsx
    │       ├── ProfitCalculator.jsx
    │       └── CompetitionAnalyser.jsx
```

## Rate Limiting

- Scanner uses `x-client-id` header (UUID stored in localStorage) for per-user daily limits
- 5 free scans/day, resets at midnight local server time
- Supplier Finder and Competition Analyser are unrestricted on the free tier
- Hitting the limit shows the upgrade modal

## Deployment

1. Build the client: `cd client && npm run build`
2. Serve the `client/dist` folder from your Express server or a CDN
3. Set environment variables on your host (Railway, Render, Fly.io, etc.)
4. The server's in-memory rate limit and feed cache reset on restart — use Redis for production persistence
