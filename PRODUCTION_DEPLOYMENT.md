# 🚀 Production Deployment Guide

## Prerequisites

### 1. Environment Setup
```bash
# Required environment variables
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=production
```

### 2. API Key Configuration
- Obtain a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- The key should start with "AI" (e.g., "AIzaSy...")
- Set it in your `.env.local` file for local development
- For production, set it in your hosting platform's environment variables

## Production Checklist

### ✅ Security
- [x] Input validation (code size limits, content validation)
- [x] Rate limiting (10 requests per minute per client)
- [x] API key validation and secure handling
- [x] Error handling without information leakage
- [x] Timeout protection (30 second limit)

### ✅ Performance
- [x] Response caching (5 minute TTL)
- [x] Request deduplication
- [x] Timeout handling
- [x] Efficient memory usage

### ✅ Reliability
- [x] Comprehensive error handling
- [x] Graceful degradation
- [x] Input validation
- [x] Response validation

### ✅ Monitoring
- [x] System status dashboard
- [x] Configuration logging
- [x] Error tracking
- [x] Performance metrics

## Deployment Steps

### 1. Build for Production
```bash
npm install
npm run build
```

### 2. Environment Configuration
Create production environment file:
```bash
# .env.production
GEMINI_API_KEY=your_production_api_key
NODE_ENV=production
```

### 3. Deploy to Hosting Platform

#### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
# or via CLI:
vercel env add GEMINI_API_KEY
```

#### Netlify Deployment
```bash
# Build and deploy
npm run build
# Upload dist folder to Netlify
# Set GEMINI_API_KEY in Netlify environment variables
```

#### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

### 4. Post-Deployment Verification

#### Health Check Endpoints
The application includes built-in health monitoring:
- System Status: Available via the status icon in bottom-right corner
- Configuration validation: Logged to console on startup

#### Test Production Deployment
1. **API Key Test**: Submit a small code snippet to verify API connectivity
2. **Rate Limiting Test**: Submit multiple requests quickly to verify rate limiting
3. **Caching Test**: Submit the same code twice to verify caching
4. **Error Handling Test**: Submit invalid input to verify error handling

## Production Configuration

### Rate Limiting
- **Default**: 10 requests per minute per client
- **Customizable**: Modify `RATE_LIMIT_PER_MINUTE` in `geminiService.ts`

### Caching
- **Default**: 5 minute TTL
- **Storage**: In-memory (resets on server restart)
- **Customizable**: Modify `CACHE_TTL_MS` in `geminiService.ts`

### Code Size Limits
- **Default**: 50KB maximum
- **Customizable**: Modify `MAX_CODE_SIZE` in `geminiService.ts`

### Timeout Settings
- **Default**: 30 seconds
- **Customizable**: Modify `TIMEOUT_MS` in `geminiService.ts`

## Monitoring & Maintenance

### System Status Dashboard
- Access via the activity icon in the bottom-right corner
- Shows cache usage, rate limiting status, and configuration
- Real-time updates every 5 seconds

### Log Monitoring
Monitor these log patterns in production:
```
✅ Configuration is valid
🔧 Analysis completed in XXXms
⚠️ Suspicious content detected
❌ Rate limit exceeded
❌ API key validation failed
```

### Performance Metrics
Key metrics to monitor:
- Average response time (should be < 10 seconds)
- Cache hit rate (should be > 20% for repeated scans)
- Error rate (should be < 5%)
- API usage and costs

## Scaling Considerations

### Horizontal Scaling
- The current implementation uses in-memory caching and rate limiting
- For multiple instances, consider:
  - Redis for shared caching
  - Database for rate limiting
  - Load balancer with sticky sessions

### Cost Optimization
- Monitor Gemini API usage and costs
- Implement user quotas if needed
- Consider batch processing for large files
- Optimize caching strategy based on usage patterns

## Security Best Practices

### API Key Management
- Never commit API keys to version control
- Use environment variables or secure secret management
- Rotate API keys regularly
- Monitor API key usage for anomalies

### Input Validation
- The system validates code size and content
- Consider additional validation for specific use cases
- Monitor for malicious input patterns

### Rate Limiting
- Current implementation is per-client IP
- Consider user-based rate limiting for authenticated users
- Implement progressive rate limiting for abuse prevention

## Troubleshooting

### Common Issues

#### "API key not configured"
- Verify `GEMINI_API_KEY` is set in environment variables
- Check API key format (should start with "AI")
- Verify API key is active in Google AI Studio

#### "Rate limit exceeded"
- Normal behavior for high usage
- Users should wait 1 minute between bursts
- Consider increasing limits for production use

#### "Analysis timeout exceeded"
- Code file may be too large or complex
- Consider breaking large files into smaller chunks
- Check network connectivity to Gemini API

#### "Cache not working"
- Verify caching is enabled in configuration
- Check system status dashboard for cache statistics
- Cache resets on server restart (expected behavior)

## Support & Updates

### Version Updates
- Monitor for updates to `@google/genai` package
- Test thoroughly before deploying updates
- Keep security patches current

### Feature Flags
The system includes feature flags for:
- Caching (disabled in test environment)
- Rate limiting (enabled in production)
- Analytics (enabled in production)

Modify these in `utils/config.ts` as needed.