# Deployment Checklist

Use this checklist before deploying to production.

## Pre-Deployment

- [ ] **Code Quality**
  - [ ] No console.error/console.warn in production code
  - [ ] All functions have error handling
  - [ ] No hardcoded credentials in code
  - [ ] Removed test data/comments

- [ ] **Environment Setup**
  - [ ] `.env` file in `.gitignore`
  - [ ] `.env.local` created locally with correct values
  - [ ] `.env.example` committed (without secrets)
  - [ ] Verified environment variables work locally

- [ ] **Database**
  - [ ] All tables created in Supabase
  - [ ] Sample children data inserted
  - [ ] Indexes created for performance
  - [ ] Backup configured (automatic in Supabase)
  - [ ] Row-level security policies reviewed

- [ ] **Local Testing**
  - [ ] `npm run dev` starts without errors
  - [ ] Can mark attendance
  - [ ] Can save offering
  - [ ] Monthly report generates
  - [ ] Print function works
  - [ ] Responsive on mobile (DevTools → Toggle device toolbar)

- [ ] **Build**
  - [ ] `npm run build` completes successfully
  - [ ] No build errors or warnings
  - [ ] `dist/` folder created
  - [ ] Check bundle size (should be <500KB)

## GitHub Setup

- [ ] Repository created
- [ ] `node_modules/` is in `.gitignore`
- [ ] `.env` is in `.gitignore`
- [ ] All files committed
- [ ] `main` branch has latest code

## Netlify Deployment

- [ ] Netlify account created
- [ ] GitHub connected to Netlify
- [ ] Repository selected
- [ ] Build command: `npm run build`
- [ ] Publish folder: `dist`
- [ ] Environment variables added:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] Site deployed

## Post-Deployment Verification

- [ ] Site loads at Netlify URL
- [ ] Attendance form displays children
- [ ] Can select attendance (checkboxes work)
- [ ] Can enter offering amount
- [ ] Save button triggers database insert
- [ ] Monthly report shows data
- [ ] Print generates proper format
- [ ] Responsive on mobile
- [ ] All images load correctly
- [ ] No console errors (F12)

## Performance Checks

- [ ] Page loads in <3 seconds
- [ ] No 404 errors in console
- [ ] Images optimized
- [ ] CSS minified
- [ ] JS minified

## Security Final Check

- [ ] No credentials in environment variables visible
- [ ] HTTPS enforced (Netlify default)
- [ ] Database credentials not in code
- [ ] API keys are `anon` key only
- [ ] Row-level security policies in place

## Backup & Recovery

- [ ] Supabase backups enabled (automatic)
- [ ] Database export downloaded locally
- [ ] Screenshot of schema documentation
- [ ] Environment variables documented (in secure location)

## Go Live!

- [ ] Domain/URL shared with church
- [ ] Staff trained on using app
- [ ] Backup contacts for technical issues
- [ ] Monitor first few uses

---

## Rollback Plan

If deployment fails:

1. Check Netlify build logs for errors
2. Verify environment variables are set
3. Test locally: `npm run dev`
4. Check Supabase dashboard for database errors
5. Redeploy: Push new commit → Netlify auto-deploys

## Post-Launch Monitoring

- [ ] Monitor Supabase dashboard daily first week
- [ ] Check for unusual error patterns
- [ ] Verify data is saving correctly
- [ ] Watch for performance issues
- [ ] Collect feedback from users

---

**Deployment Status**: Ready for production

