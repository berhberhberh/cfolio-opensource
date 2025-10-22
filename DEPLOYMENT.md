# Deployment Guide for Cryptfolio

This guide will help you deploy Cryptfolio to Vercel with a PostgreSQL database.

## Prerequisites

1. A [Vercel account](https://vercel.com)
2. A PostgreSQL database (recommended: [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app))
3. Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Set Up Database

### Option A: Using Neon (Recommended - Free Tier Available)

1. Go to [https://neon.tech](https://neon.tech) and sign up
2. Create a new project
3. Copy the connection string (starts with `postgresql://`)
4. Keep this for later - you'll need it for Vercel environment variables

### Option B: Using Supabase

1. Go to [https://supabase.com](https://supabase.com) and create a project
2. Go to Project Settings > Database
3. Copy the connection string under "Connection string" (Direct connection)
4. Make sure to use the Direct connection string (not pooling)

### Option C: Using Railway

1. Go to [https://railway.app](https://railway.app)
2. Create a new PostgreSQL database
3. Copy the DATABASE_URL from the variables tab

## Step 2: Push Code to Git Repository

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_REPO_URL
git push -u origin main
```

## Step 3: Deploy to Vercel

1. Go to [https://vercel.com](https://vercel.com) and log in
2. Click "Add New Project"
3. Import your Git repository
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: Leave default

## Step 4: Add Environment Variables

In the Vercel project settings, go to "Environment Variables" and add:

### Required Variables

1. **DATABASE_URL**
   - Value: Your PostgreSQL connection string from Step 1
   - Example: `postgresql://user:password@host:5432/database`

2. **NEXTAUTH_SECRET**
   - Generate with: `openssl rand -base64 32`
   - Value: The generated secret string

3. **NEXTAUTH_URL**
   - Value: `https://your-app-name.vercel.app`
   - You'll get this URL after deployment, update it then

4. **ADMIN_SECRET**
   - Generate with: `openssl rand -base64 32`
   - Value: A secure random string (keep this safe!)
   - Used for generating beta keys

## Step 5: Run Database Migrations

After your first deployment:

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Link your project:
   ```bash
   vercel link
   ```

3. Pull environment variables:
   ```bash
   vercel env pull .env
   ```

4. Run Prisma migration:
   ```bash
   npx prisma migrate deploy
   ```

5. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

## Step 6: Generate Beta Keys

You'll need beta keys for users to register. Use this API endpoint:

```bash
curl -X POST https://your-app.vercel.app/api/admin/generate-beta-key \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  -H "Content-Type: application/json"
```

This will return a beta key like:
```json
{
  "success": true,
  "betaKey": "abc123def456..."
}
```

Share this key with users to let them register!

## Step 7: Update NEXTAUTH_URL

1. After deployment, you'll get a URL like `https://cryptfolio-xyz.vercel.app`
2. Go back to Vercel project settings > Environment Variables
3. Update `NEXTAUTH_URL` to your actual deployment URL
4. Redeploy the project

## Troubleshooting

### Database Connection Issues

- Make sure your DATABASE_URL includes `?schema=public` at the end
- For Neon/Supabase, use the direct connection string, not pooled
- Check that your database allows connections from Vercel's IP ranges

### Authentication Issues

- Verify NEXTAUTH_SECRET is set and is at least 32 characters
- Make sure NEXTAUTH_URL matches your deployment URL exactly (no trailing slash)
- Clear browser cookies and try again

### Build Failures

- Check build logs in Vercel dashboard
- Make sure all environment variables are set
- Verify `prisma generate` runs during build

## Managing Beta Keys

### Generate Multiple Keys at Once

Create a script to generate multiple beta keys:

```bash
for i in {1..10}; do
  curl -X POST https://your-app.vercel.app/api/admin/generate-beta-key \
    -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
    -H "Content-Type: application/json"
  echo ""
done
```

### Check Database for Keys

You can connect to your database and run:

```sql
SELECT key, "isUsed", "usedAt" FROM "BetaKey" ORDER BY "createdAt" DESC;
```

## Custom Domain (Optional)

1. Go to Vercel project settings > Domains
2. Add your custom domain
3. Update NEXTAUTH_URL to use your custom domain
4. Redeploy

## Maintenance

### Update Database Schema

If you need to update the database schema:

1. Modify `prisma/schema.prisma`
2. Run migration locally:
   ```bash
   npx prisma migrate dev --name your_migration_name
   ```
3. Push changes to Git
4. Vercel will automatically run migrations on deployment

### Backup Database

Regularly backup your PostgreSQL database:
- Neon: Automatic backups included
- Supabase: Use the backup feature in dashboard
- Railway: Set up automatic backups in project settings

## Support

For issues with:
- **Vercel**: https://vercel.com/docs
- **Prisma**: https://www.prisma.io/docs
- **NextAuth**: https://next-auth.js.org
