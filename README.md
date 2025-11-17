# Locations MCP Server

This project implements a Model Context Protocol (MCP) server with tools for WordPress content extraction, keyword research, and optimized content generation.

## Project Structure
- `api/` – Vercel serverless entry point.
- `src/clients/` – External API clients (WordPress, Google keyword suggestions, Google Trends).
- `src/services/` – Shared services such as caching, logging, and content processing.
- `src/tools/` – MCP tool handlers.
- `src/types/` – Shared interfaces and types.

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment defaults:
   ```bash
   cp .env.example .env
   ```
3. Set the environment variables in `.env`:
   - `WORDPRESS_API_KEY` or `WORDPRESS_OAUTH_TOKEN` – authentication for secured WordPress sites
   - `WORDPRESS_SITE_URL` – default base URL for extraction
   - `GOOGLE_TRENDS_PROXY` – optional proxy URL when Trends is blocked in your region
   - `MAX_PAGES_PER_REQUEST` – caps pagination for WordPress fetches (defaults to 5)
   - `LOG_LEVEL` – `debug`, `info`, `warn`, or `error`
4. Build the project:
   ```bash
   npm run build
   ```

## Tools
- `extract_wordpress_content` – Fetches pages/posts from a WordPress site with pagination, sanitization, and caching.
- `research_keywords` – Generates keyword ideas using Google autocomplete and Trends data with intent classification.
- `generate_optimized_content` – Builds structured content using simple Indian English and reports quality metrics.

Send a `GET` request to `/api/mcp` to list available tools and their schemas. Send a `POST` request with `{ "tool": "tool_name", "input": { ... } }` to execute one.

## Deployment
The `api/mcp.ts` entry is compatible with Vercel serverless functions. The build outputs to `dist/` and the `start` script runs the compiled handler locally. The endpoint enforces a 30-second timeout, validates inputs with Zod, and returns structured JSON responses for MCP compatibility.
