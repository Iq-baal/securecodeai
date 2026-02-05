# Project Structure

## Root Level
- `App.tsx` - Main application component with routing and state management
- `index.tsx` - React application entry point
- `types.ts` - Global TypeScript interfaces and enums
- `vite.config.ts` - Build configuration with environment variables

## Components Directory (`/components`)
Reusable UI components following single responsibility principle:
- `ScanHistory.tsx` - Historical scan results management
- `ScanLoader.tsx` - Loading states during analysis
- `SecureExamplesLibrary.tsx` - Reference secure code patterns
- `SecurityReport.tsx` - Vulnerability report display and remediation
- `VulnerabilityCard.tsx` - Individual vulnerability presentation

## Services Directory (`/services`)
Business logic and external integrations:
- `geminiService.ts` - Google Gemini AI integration for scanning and fixing
- `historyService.ts` - LocalStorage management for scan persistence

## Data Directory (`/data`)
Static data and configuration:
- `secureExamples.ts` - Curated secure coding examples

## VSCode Extension (`/vscode-extension`)
Separate package for IDE integration:
- `package.json` - Extension metadata and dependencies
- `src/extension.ts` - Extension entry point

## Naming Conventions
- **Components**: PascalCase with descriptive names
- **Services**: camelCase with `Service` suffix
- **Types**: PascalCase interfaces, UPPERCASE enums
- **Files**: camelCase for utilities, PascalCase for components

## Import Patterns
- Relative imports for local files
- Absolute imports using `@/` alias for root-level imports
- External dependencies imported first, followed by internal modules

## Component Structure
Components follow this pattern:
1. React/external imports
2. Local type/interface imports
3. Props interface definition
4. Component implementation with hooks
5. Helper functions (if any)
6. Default export

## State Management
- Local component state using `useState`
- No global state management library
- Props drilling for shared state between components