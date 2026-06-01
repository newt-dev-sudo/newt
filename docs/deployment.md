# Deployment Guide

Deploy your Newt bot to cloud hosting for 24/7 uptime.

## Prerequisites

- Newt CLI installed
- Discord bot token
- Hosting account (Railway, Render, etc.)

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

### 4. Configure Build and Start

Since Newt uses the CLI directly, configure Railway to:
- **Build Command:** `npm install -g @newt-dev/cli`
- **Start Command:** `newt run your-bot.newt`

### 5. Deploy

Railway auto-deploys on push. Your bot will be live at `your-app.railway.app`

## Render

### 1. Create Render Account

Sign up at [render.com](https://render.com)

### 2. Create Web Service

1. Click "New +"
2. Select "Web Service"
3. Connect your GitHub repository

### 3. Configure

- **Build Command:** `npm install -g @newt-dev/cli`
- **Start Command:** `newt run your-bot.newt`

### 4. Set Environment Variables

Add `DISCORD_TOKEN` in the environment variables section

### 5. Deploy

Click "Create Web Service" - Render auto-deploys

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

### 3. Install Newt CLI

```bash
npm install -g @newt-dev/cli
```

### 4. Upload Bot Files

```bash
scp your-bot.newt user@your-server-ip:/home/user/
```

### 5. Set Token

```bash
newt token YOUR_BOT_TOKEN
```

### 6. Run with PM2 (for uptime)

```bash
npm install -g pm2
pm2 start "newt run /home/user/your-bot.newt" --name "newt-bot"
pm2 save
pm2 startup
```

## Choosing a Platform

| Platform | Best For | Cost | Difficulty |
|----------|----------|------|------------|
| Railway | Quick deployment | Free tier available | Very Easy |
| Render | Simple apps | Free tier available | Easy |
| VPS | Full control | $5-10/month | Medium |

## Keeping Bots Running

### Process Managers

**PM2 (Node.js):**
```bash
npm install -g pm2
pm2 start "newt run your-bot.newt" --name "newt-bot"
pm2 save
pm2 startup
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
ExecStart=/usr/bin/newt run your-bot.newt
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
```

## Troubleshooting Deployment

### Bot crashes immediately

- Check logs (platform-specific)
- Verify DISCORD_TOKEN is set correctly
- Check Node.js version compatibility (18+)

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
- [Examples](./examples/hello-world.md) - More bot examples
