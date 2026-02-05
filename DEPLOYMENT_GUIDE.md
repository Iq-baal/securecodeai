# 🚀 Quick Deployment Guide

## Option 1: Vercel (Recommended - 2 minutes)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Build and Deploy
```bash
npm run build
vercel --prod
```

### Step 3: Set Environment Variable
```bash
vercel env add GEMINI_API_KEY
# Paste your API key when prompted
# Select "Production" environment
```

### Step 4: Redeploy with Environment Variable
```bash
vercel --prod
```

**Your app is now live!** Vercel will give you a URL like `https://securecode-ai-xyz.vercel.app`

---

## Option 2: Netlify (3 minutes)

### Step 1: Build the App
```bash
npm run build
```

### Step 2: Deploy to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop the `dist/` folder
3. Go to Site Settings → Environment Variables
4. Add `GEMINI_API_KEY` with your API key value
5. Redeploy the site

---

## Option 3: Railway (5 minutes)

### Step 1: Connect Repository
1. Go to [railway.app](https://railway.app)
2. Click "Deploy from GitHub repo"
3. Select your repository

### Step 2: Configure Environment
1. Go to Variables tab
2. Add `GEMINI_API_KEY` = your API key
3. Add `NODE_ENV` = production

### Step 3: Deploy
Railway will automatically build and deploy your app.

---

## Verification Checklist

After deployment, test these features:

- [ ] **Basic Functionality**: Submit a code snippet for analysis
- [ ] **API Key**: Verify no "API key not configured" errors
- [ ] **Rate Limiting**: Submit multiple requests quickly
- [ ] **Caching**: Submit the same code twice (should be faster)
- [ ] **Error Handling**: Submit empty code (should show error)
- [ ] **System Status**: Click activity icon in bottom-right
- [ ] **History**: Check that scan history persists in browser

## Troubleshooting

### "API key not configured"
- Verify `GEMINI_API_KEY` is set in platform environment variables
- Check that the key starts with "AI"
- Redeploy after adding environment variables

### "Build failed"
- Run `npm run build` locally first to check for errors
- Ensure all dependencies are in `package.json`
- Check build logs in deployment platform

### "Rate limit exceeded"
- Normal behavior - wait 1 minute between bursts
- Each user gets 10 requests per minute

## Custom Domain (Optional)

### Vercel
```bash
vercel domains add yourdomain.com
```

### Netlify
1. Go to Domain Settings
2. Add custom domain
3. Configure DNS records

### Railway
1. Go to Settings → Domains
2. Add custom domain
3. Configure DNS records

## Monitoring

After deployment, monitor:
- **Traffic**: Use platform analytics
- **Errors**: Check platform logs
- **API Usage**: Monitor Gemini API console
- **Performance**: Use system status dashboard

## Scaling

### When to Upgrade:
- **Vercel**: >100GB bandwidth or >1000 serverless function invocations
- **Netlify**: >100GB bandwidth or >300 build minutes
- **Railway**: >$5 usage or need databases

### Upgrade Path:
1. **Start**: Free tier on Vercel/Netlify
2. **Growth**: Paid tier ($19-20/month)
3. **Scale**: Railway or cloud providers ($50+/month)
4. **Enterprise**: AWS/GCP with custom setup