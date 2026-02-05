# Technology Stack

## Frontend Framework
- **React 19.2.4** with TypeScript
- **Vite** as build tool and development server
- **Lucide React** for icons

## AI Integration
- **Google Gemini AI** (`@google/genai`) for security analysis and code remediation
- Uses `gemini-3-pro-preview` model with structured JSON responses
- Implements thinking budget for complex dataflow analysis

## Build System & Development

### Common Commands
```bash
# Install dependencies
npm install

# Start development server (port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Setup
- Requires `GEMINI_API_KEY` in `.env.local`
- Vite configuration handles environment variable injection

## TypeScript Configuration
- Target: ES2022
- Module: ESNext with bundler resolution
- JSX: react-jsx
- Path aliases: `@/*` maps to project root
- Experimental decorators enabled

## Styling
- **Tailwind CSS** with custom cyber-themed color palette
- Custom CSS classes for cyber aesthetic (`cyber-500`, `cyber-800`, etc.)
- Responsive design with mobile-first approach

## Architecture Patterns
- **Service Layer**: Separate services for AI integration and data persistence
- **Component-based**: Modular React components with clear separation of concerns
- **Type Safety**: Comprehensive TypeScript interfaces and enums
- **State Management**: React hooks for local state management

## Browser Storage
- LocalStorage for scan history persistence
- No external database dependencies for demo purposes