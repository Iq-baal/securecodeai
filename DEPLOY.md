# Deployment Checklist

## Before You Push

- [x] Code cleaned up
- [x] Test files removed
- [x] Comments updated
- [x] TypeScript types fixed
- [x] Build tested locally
- [x] Environment variables use VITE_ prefix

## Deploy Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Initial commit - SecureCode AI"
git push origin main
```

### 2. Deploy on Vercel
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repo
4. Add environment variable:
   - **Name**: `VITE_GEMINI_API_KEY`
   - **Value**: Your Gemini API key (starts with "AI")
5. Click "Deploy"

### 3. Test Your Deployment
- [ ] Visit your Vercel URL
- [ ] Paste some code and run a scan
- [ ] Check that vulnerabilities are detected
- [ ] Try the auto-fix feature
- [ ] Check scan history works
- [ ] Browse the secure examples library

## Troubleshooting

**"API key not configured"**
- Make sure you added `VITE_GEMINI_API_KEY` in Vercel (not `GEMINI_API_KEY`)
- Redeploy after adding the env var

**Build fails**
- Check the build logs in Vercel
- Make sure `npm run build` works locally first

**App loads but scanning fails**
- Check browser console for errors
- Verify API key is valid in Google AI Studio
- Check if you hit rate limits (10 requests/min)

## Done!

Your app should be live at: `https://your-project-name.vercel.app`
