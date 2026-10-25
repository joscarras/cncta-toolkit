# CNCTA Toolkit

Advanced base layout optimizer for Command & Conquer: Tiberium Alliances. Features power plant optimization algorithms, base scanner, layout calculator, and CNCOpt integration.

## Features

- 🔋 **Power Plant Optimizer** - Advanced algorithms for optimal power plant and accumulator placement
- 🔍 **Base Scanner** - Analyze player and NPC bases
- 🔗 **CNCOpt Integration** - Seamless integration with community tools
- 🌐 **Web Extension** - Browser addon for in-game functionality
- 💻 **CLI Interface** - Command-line tools for layout optimization

## Requirements

- [Bun](https://bun.sh/) runtime (recommended) or Node.js 20+
- Firefox (for browser extension development)

## Installation

```bash
# Clone the repository
git clone https://github.com/joscarras/cncta-toolkit.git
cd cncta-toolkit

# Install dependencies
bun install
```

## Configuration

### Environment Setup

Create a `.env` file in the root directory for server configuration:

```env
# Server authentication token (replace with your own secure token)
TOKEN=your-secure-token-here

# Server host URL (e.g., http://localhost:3000 or your production URL)
HOST=http://localhost:3000
```

### Update Token in Code

Edit `src/defaults.ts` and replace the placeholder values:

```typescript
export const token = "your-secure-token-here";  // Replace __TOKEN__
export const host = "http://localhost:3000";     // Replace __HOST__
```

### Browser Extension Signing (Optional)

For Firefox addon signing, add to `.env`:

```env
WEB_EXT_API_KEY=your-amo-api-key
WEB_EXT_API_SECRET=your-amo-api-secret
```

## Usage

### CLI Tools

```bash
# Run layout optimizer once
bun run once

# Run in development mode with auto-reload
bun run dev

# Using Node.js instead of Bun
bun run node:dev
```

### Server Deployment

#### Development Server

```bash
# Start development server with auto-reload
bun run serve:dev

# Or production mode
bun run serve
```

The server will start on the configured `HOST` URL (default: http://localhost:3000).

#### Production Deployment

1. **Set environment variables:**
   ```bash
   export TOKEN="your-production-token"
   export HOST="https://your-domain.com"
   ```

2. **Start the server:**
   ```bash
   bun run serve
   ```

3. **Using Docker (optional):**
   ```bash
   docker-compose up -d
   ```

4. **Using a process manager (PM2):**
   ```bash
   npm install -g pm2
   pm2 start "bun run serve" --name cncta-toolkit
   pm2 save
   pm2 startup
   ```

### Browser Extension

```bash
# Build the extension
bun run addon:bundle

# Run in Firefox for testing
bun run addon:run

# Run with persistent profile
bun run addon:start

# Build and sign for release
bun run addon:release

# Lint the addon
bun run addon:lint
```

### Google Sheet

The add-on's 📊 Sheet button writes every base of the logged-in account to a Google Sheet, one row each: levels, power, and how far each base is from the perfect layouts in `src/addon/perfect.ts`. Every account replaces only its own rows, so several accounts can share one sheet.

1. In the sheet, open Extensions → Apps Script and paste in `sheet/Code.gs`.
2. Deploy → New deployment → Web app, execute as yourself, access: Anyone.
3. Click 📊 Sheet in the game and paste the web app URL when asked. Shift-click the button to change it.

## Project Structure

```
cncta-toolkit/
├── src/
│   ├── addon/       # Browser extension code
│   ├── cli/         # Command-line interface
│   ├── power/       # Power plant optimization algorithms
│   ├── layout/      # Layout calculation utilities
│   ├── scan/        # Base scanner functionality
│   ├── server/      # Web server and API
│   └── defaults.ts  # Configuration constants
├── package.json
├── tsconfig.json
└── docker-compose.yml
```

## API Endpoints

When running the server:

- `POST /upload` - Upload base data (requires Bearer token authentication)
- `POST /sync` - Synchronize base layouts (requires Bearer token authentication)
- `GET /optimize` - Get optimized layout suggestions
- `GET /` - Web interface

All authenticated endpoints require the `Authorization: Bearer <TOKEN>` header.

## Development

```bash
# Type checking
bun run tsc

# Development mode with auto-reload
bun run dev

# Extension development
bun run addon:dev
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Credits

This project was developed by Joseph Carras with assistance from various Claude AI models (Anthropic) for code optimization, architecture design, and documentation.

## License

ISC License - See package.json for details.

## Community

For Command & Conquer: Tiberium Alliances resources and tools:
- [CNCTAOpt](https://www.cnctaopt.com/) - Community optimization tools

---

**Note:** This toolkit is a third-party tool and is not affiliated with or endorsed by Electronic Arts or the official Command & Conquer: Tiberium Alliances game.
