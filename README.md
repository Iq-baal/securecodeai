# SecureCode AI - Production Ready

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

A production-ready AI security auditing platform that detects vulnerabilities and generates safe fixes instantly using Google's Gemini AI.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Gemini API Key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd securecode-ai
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add your GEMINI_API_KEY
   ```

3. **Run the application:**
   ```bash
   npm run dev
   ```

4. **Validate configuration:**
   ```bash
   npm run validate:config
   ```

## 🏭 Production Deployment

### Build for Production
```bash
npm run build
npm run preview  # Test production build locally
```

### Environment Variables
```bash
GEMINI_API_KEY=your_production_api_key
NODE_ENV=production
```

### Production Features
- ✅ **Input Validation**: Code size limits, content validation
- ✅ **Rate Limiting**: 10 requests/minute per client
- ✅ **Caching**: 5-minute TTL for duplicate scans
- ✅ **Error Handling**: Comprehensive error types and messages
- ✅ **Security**: API key validation, timeout protection
- ✅ **Monitoring**: Real-time system status dashboard

### Testing
```bash
npm run test:prod   # Run production validation tests
npm run test:perf   # Run performance benchmarks
```

## 🔧 Configuration

The application includes production-ready defaults that can be customized:

| Setting | Default | Description |
|---------|---------|-------------|
| Max Code Size | 50KB | Maximum file size for analysis |
| Rate Limit | 10/min | Requests per minute per client |
| Cache TTL | 5 min | How long to cache results |
| Timeout | 30s | Maximum analysis time |

## 📊 Monitoring

Access the system status dashboard via the activity icon in the bottom-right corner:
- Cache usage statistics
- Rate limiting status  
- Configuration overview
- Service health status

## 🛡️ Security Features

### Input Validation
- File size limits (50KB default)
- Content validation and sanitization
- Malicious pattern detection

### Rate Limiting
- Per-client request throttling
- Configurable limits
- Graceful error handling

### API Security
- Secure API key handling
- Request timeout protection
- Error message sanitization

## 🎯 Supported Languages

- JavaScript/TypeScript
- Python
- Java
- C++
- Go
- Ruby
- Solidity

## 📈 Performance

- **Average Response Time**: < 10 seconds
- **Cache Hit Rate**: > 20% for repeated scans
- **Concurrent Users**: Scales with rate limiting
- **Memory Usage**: Optimized with TTL-based caching

## 🔍 Algorithm

The security analysis uses a formal 4-pass algorithm:

1. **AST & Scope Mapping**: Identify variables, functions, and dependencies
2. **Source-to-Sink Dataflow**: Trace untrusted inputs to sensitive operations
3. **Rule Validation**: Apply OWASP Top 10 and SANS 25 security rules
4. **False Positive Filter**: Remove non-exploitable findings

## 📚 Documentation

- [Production Deployment Guide](./PRODUCTION_DEPLOYMENT.md)
- [API Documentation](./docs/api.md) *(coming soon)*
- [Security Best Practices](./docs/security.md) *(coming soon)*

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Run tests: `npm run test:prod`
4. Submit a pull request

## 📄 License

Open Source - See LICENSE file for details

## 🆘 Support

### Common Issues

**"API key not configured"**
- Set `GEMINI_API_KEY` in your `.env.local` file
- Verify the key starts with "AI"

**"Rate limit exceeded"**
- Wait 1 minute between request bursts
- Normal behavior for high usage

**"Analysis timeout"**
- File may be too large (>50KB)
- Try breaking into smaller files

### Getting Help

- Check the [Production Deployment Guide](./PRODUCTION_DEPLOYMENT.md)
- Review system status dashboard for diagnostics
- Run `npm run validate:config` to check configuration

---

**View your app in AI Studio**: https://ai.studio/apps/drive/1gEg5T11Fg85a4chm-8L3zldBuwxhzUwi
