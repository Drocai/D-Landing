# GitHub Pages Deployment Guide

## Overview

This guide will help you enable GitHub Pages and deploy your D RoC landing page.

## What Was Added

1. **GitHub Actions Workflow** (`.github/workflows/deploy.yml`)
   - Automatically deploys your site when you push to the `main` branch
   - Can also be triggered manually from the Actions tab

2. **index.html** (lowercase)
   - GitHub Pages requires `index.html` with a lowercase 'i'
   - This file is identical to your existing `Index.html`

3. **README.md**
   - Documentation for your repository

## Step-by-Step Setup Instructions

### Step 1: Enable GitHub Pages

1. Go to your repository on GitHub: https://github.com/Drocai/D-Landing
2. Click on **Settings** (top navigation bar)
3. Scroll down and click on **Pages** in the left sidebar
4. Under "Build and deployment":
   - **Source**: Select **"GitHub Actions"** from the dropdown
   - This allows the workflow to deploy your site
5. Click **Save** if prompted

### Step 2: Merge This PR

1. Review the changes in this pull request
2. Click the **"Merge pull request"** button
3. Confirm the merge
4. The workflow will automatically trigger and deploy your site

### Step 3: Wait for Deployment

1. Go to the **Actions** tab in your repository
2. You'll see the "Deploy to GitHub Pages" workflow running
3. Wait for it to complete (usually takes 1-2 minutes)
4. Once completed, your site will be live!

### Step 4: Access Your Site

Your site will be available at:
- **https://drocai.github.io/D-Landing/**

You can find the exact URL in:
- Repository Settings → Pages (it will show "Your site is live at...")
- The workflow run details in the Actions tab

## How It Works

- **Trigger**: Every push to the `main` branch triggers the deployment
- **Process**: The workflow uploads all files to GitHub Pages
- **Result**: Your site is updated automatically

## Manual Deployment

If you need to redeploy manually:
1. Go to **Actions** tab
2. Click on **"Deploy to GitHub Pages"** workflow
3. Click **"Run workflow"** button
4. Select the `main` branch
5. Click **"Run workflow"**

## Troubleshooting

### Site Not Loading

- Check that GitHub Pages is enabled in Settings → Pages
- Verify the workflow completed successfully in the Actions tab
- Wait a few minutes - deployments can take time to propagate

### Workflow Fails

- Check that the Pages permissions are set correctly in Settings → Pages
- Ensure "GitHub Actions" is selected as the source
- Review the workflow logs in the Actions tab for specific errors

### 404 Error

- Make sure `index.html` (lowercase) exists in the repository
- Verify the deployment completed successfully

## Next Steps

After merging:
1. Share your live site URL: https://drocai.github.io/D-Landing/
2. Any future changes to `main` will automatically deploy
3. You can update content by editing files and pushing to `main`

## Support

If you encounter issues:
- Check the Actions tab for workflow run details
- Review the workflow logs for error messages
- Ensure all files (images, etc.) are committed to the repository
