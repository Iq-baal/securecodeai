# SecureCode AI

SecureCode AI is a public AI security auditing platform that detects vulnerabilities and generates safe fixes instantly. The application provides real-time code security analysis using Google's Gemini AI to identify OWASP Top 10 vulnerabilities, exposed secrets, and insecure patterns.

## Core Features

- **Multi-language Support**: JavaScript, TypeScript, Python, Java, C++, Go, Ruby, Solidity
- **Real-time Scanning**: Instant vulnerability detection with detailed reports
- **Auto-remediation**: AI-powered code fixes with security verification
- **Scan History**: Track and review previous security audits
- **Secure Examples Library**: Reference implementations for secure coding patterns

## User Experience

The platform offers three input modes:
- **Paste Code**: Direct code input for quick analysis
- **File Upload**: Support for common source code file formats
- **Repository Scanning**: GitHub repository URL analysis (with CORS limitations)

## Security Focus

The application implements a formal 4-pass algorithm for comprehensive security analysis:
1. AST & Scope Mapping
2. Source-to-Sink Dataflow Analysis
3. OWASP/SANS Rule Validation
4. False Positive Filtering

Scoring ranges from 0-100, where 100 indicates no exploitable vulnerabilities and lower scores indicate increasing security risks.