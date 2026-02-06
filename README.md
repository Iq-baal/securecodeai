# SecureCode AI

AI-powered security auditing platform that detects vulnerabilities and generates fixes instantly using Google's Gemini AI.

🔗 **Live Demo**: [securecode-ai.vercel.app](https://securecode-ai.vercel.app)

## Features

- **Multi-language Support**: Analyze JavaScript, TypeScript, Python, Java, C++, Go, Ruby, and Solidity
- **Real-time Scanning**: Instant vulnerability detection with detailed security reports
- **AI-Powered Fixes**: Automatically generate secure code remediation
- **Scan History**: Track and review previous security audits in your browser
- **Secure Examples Library**: Learn from reference implementations of secure coding patterns

## How It Works

SecureCode AI uses a 4-pass security analysis algorithm:

1. **AST & Scope Mapping** - Identifies variables, functions, and dependencies
2. **Source-to-Sink Dataflow Analysis** - Traces untrusted inputs to sensitive operations
3. **OWASP/SANS Rule Validation** - Applies industry-standard security rules
4. **False Positive Filtering** - Removes non-exploitable findings

Security scores range from 0-100, where 100 indicates no exploitable vulnerabilities.

## Usage

### Scan Code

1. Visit the app and choose your input method:
   - **Paste Code**: Copy and paste code directly
   - **Upload File**: Select a source code file from your computer
   - **Scan Repo**: Enter a GitHub repository URL

2. Click "Initialize Scan" to start the analysis

3. Review the security report showing:
   - Overall security score
   - Detected vulnerabilities with severity levels
   - Line-by-line issue breakdown
   - Attack scenarios and risk analysis

### Auto-Fix Vulnerabilities

1. After scanning, click "Deep Auto-Fix" to generate secure code
2. Review the remediated code with security improvements
3. Copy or download the fixed code

### Browse Secure Examples

Navigate to the "Library" tab to explore secure coding patterns for common vulnerabilities across different programming languages.

## Supported Languages

- JavaScript / TypeScript
- Python
- Java
- C++
- Go
- Ruby
- Solidity

## Technology

Built with:
- React 19 + TypeScript
- Google Gemini AI (gemini-3-pro-preview)
- Vite
- Tailwind CSS

## Privacy

- All code analysis happens in real-time
- No code is stored on servers
- Scan history is saved locally in your browser
- No data is shared with third parties

## Local Development

Want to run this locally or contribute?

```bash
# Clone the repository
git clone <repository-url>
cd securecode-ai

# Install dependencies
npm install

# Create .env.local and add your Gemini API key
echo "VITE_GEMINI_API_KEY=your_key_here" > .env.local

# Start development server
npm run dev
```

Get a free Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey).

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## License

Open Source

---

**Note**: This tool is designed for educational and development purposes. Always perform comprehensive security testing before deploying code to production.
