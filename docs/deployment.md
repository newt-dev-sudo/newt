# Deployment Guide

Deploy your Newt bot to cloud hosting for 24/7 uptime.

## Prerequisites

- Built bot from `newt build`
- Discord bot token
- Hosting account (Heroku, Railway, Render, etc.)

## Heroku

### 1. Install Heroku CLI

```bash
# Windows
npm install -g heroku

# Mac
brew tap heroku/brew && brew install heroku

# Linux
sudo snap install heroku --classic
```

### 2. Login to Heroku

```bash
heroku login
```

### 3. Create Heroku App

```bash
heroku create my-newt-bot
```

### 4. Set Environment Variables

```bash
heroku config:set DISCORD_TOKEN=your-token-here
```

### 5. Deploy

```bash
# Initialize git if needed
git init
git add .
git commit -m "Initial bot"

# Add Heroku remote
heroku git:remote -a my-newt-bot

# Deploy
git push heroku main
```

### 6. Scale Up

```bash
heroku ps:scale web=1
```

## Railway

### 1. Create Railway Account

Sign up at [railway.app](https://railway.app)

### 2. Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Connect your bot repository

### 3. Set Environment Variables

In Railway dashboard:
- Add `DISCORD_TOKEN` = your bot token

### 4. Deploy

Railway auto-deploys on push. Your bot will be live at `your-app.railway.app`

## Render

### 1. Create Render Account

Sign up at [render.com](https://render.com)

### 2. Create Web Service

1. Click "New +"
2. Select "Web Service"
3. Connect your GitHub repository

### 3. Configure

- **Build Command:** `npm install`
- **Start Command:** `npm start`

### 4. Set Environment Variables

Add `DISCORD_TOKEN` in the environment variables section

### 5. Deploy

Click "Create Web Service" - Render auto-deploys

## Docker

### 1. Create Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]
```

### 2. Build Image

```bash
docker build -t my-newt-bot .
```

### 3. Run Container

```bash
docker run -d \
  -e DISCORD_TOKEN=your-token \
  --name my-bot \
  my-newt-bot
```

### 4. Deploy to Docker Hub

```bash
docker tag my-newt-bot username/my-newt-bot
docker push username/my-newt-bot
```

## VPS (DigitalOcean, Linode, etc.)

### 1. Connect to Server

```bash
ssh user@your-server-ip
```

### 2. Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 3. Upload Bot Files

```bash
scp -r my-bot user@your-server-ip:/home/user/
```

### 4. Install Dependencies

```bash
cd /home/user/my-bot
npm install
```

### 5. Set Environment Variable

```bash
echo 'export DISCORD_TOKEN="your-token"' >> ~/.bashrc
source ~/.bashrc
```

### 6. Run with PM2 (for uptime)

```bash
npm install -g pm2
pm2 start npm --name "newt-bot" -- start
pm2 save
pm2 startup
```

## GitHub Actions (CI/CD)

### 1. Create Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Bot
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "my-newt-bot"
          heroku_email: "your-email@example.com"
```

### 2. Add Secrets

In GitHub repository settings:
- `HEROKU_API_KEY`
- `DISCORD_TOKEN`

## Choosing a Platform

| Platform | Best For | Cost | Difficulty |
|----------|----------|------|------------|
| Heroku | Beginners | Free tier available | Easy |
| Railway | Quick deployment | Free tier available | Very Easy |
| Render | Simple apps | Free tier available | Easy |
| VPS | Full control | $5-10/month | Medium |
| Docker | Portability | Varies | Medium |

## Keeping Bots Running

### Process Managers

**PM2 (Node.js):**
```bash
npm install -g pm2
pm2 start npm --name "bot" -- start
pm2 startup
pm2 save
```

**Systemd (Linux):**
```ini
[Unit]
Description=Newt Bot
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/bot
ExecStart=/usr/bin/npm start
Restart=always

[Install]
WantedBy=multi-user.target
```

### Monitoring

Check if your bot is running:

```bash
# PM2
pm2 status

# Systemd
systemctl status newt-bot

# Docker
docker ps
```

## Troubleshooting Deployment

### Bot crashes immediately

- Check logs: `heroku logs --tail` (Heroku)
- Verify DISCORD_TOKEN is set
- Check Node.js version compatibility

### Bot goes offline

- Use process manager (PM2, systemd)
- Set up auto-restart
- Check hosting platform uptime

### Environment variables not working

- Verify variable names match exactly
- Check platform-specific syntax
- Restart after adding variables

## Next Steps

- [Token Security](./security.md) - Secure your deployment
- [Troubleshooting](./troubleshooting.md) - Common deployment issues
- [Examples](./examples/hello-world.md) - More bot examples
