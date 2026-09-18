# ClicheKiller — Deployment Guide

## 1. Repository Setup
- **Owner:** `tbahsan`
- **Repo Name:** `ClicheKiller`
- **Live URL:** `https://tbahsan.github.io/ClicheKiller/`

## 2. GitHub Pages Configuration
1. Repository **Settings** → **Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Pushes to `main` branch trigger `.github/workflows/pages.yml`, which tests, builds, and deploys automatically.
