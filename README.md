# SecureCode AI

AI-powered security auditing platform that detects vulnerabilities and generates fixes using Google's Gemini AI.

## Quick Start

### Prerequisites
- Node.js 18+
- Gemini API Key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Local Development

```bash
# Install dependencies
npm install

# Create .env.local and add your API key
echo "VITE_GEMINI_API_KEY=your_key_here" > .env.local

# Start dev server
npm run dev
```

Visit http://localhost:3000

## Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repo
3. Add environment variable:
   - Name: `VITE_GEMINI_API_KEY`
   - Value: Your Gemini API key
4. Deploy

That's it. Vercel handles the build automatically.

## Features

- **Multi-language Support**: JS, TS, Python, Java, C++, Go, Ruby, Solidity
- **Real-time Scanning**: Instant vulnerability detection
- **Auto-fix**: AI-powered code remediation
- **Scan History**: Track previous audits (stored locally)
- **Secure Examples**: Reference library of secure patterns

## Tech Stack

- React 19 + TypeScript
- Vite (build tool)
- Google Gemini AI
- Tailwind CSS
- LocalStorage (no backend needed)

## Security Analysis

Uses a 4-pass algorithm:
1. AST & Scope Mapping
2. Source-to-Sink Dataflow Analysis
3. OWASP/SANS Rule Validation
4. False Positive Filtering

Scores range from 0-100 (100 = secure, 0 = critical issues)

## Configuration

Default limits (can be adjusted in `services/geminiService.ts`):
- Max code size: 50KB
- Rate limit: 10 requests/minute
- Cache TTL: 5 minutes
- Timeout: 30 seconds

## Supported Languages

JavaScript, TypeScript, Python, Java, C++, Go, Ruby, Solidity

## License

Open Source
