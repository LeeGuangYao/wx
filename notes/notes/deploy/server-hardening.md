# Notes Server Hardening

## What Code Already Handles

- `/api/folders/*` and `/api/notes/*` are protected by route-level auth middleware before controllers run.
- `/api/auth/login` blocks the same IP for one day after five failed password attempts.
- Common scanner paths such as `/.env`, `/.git`, `/wp-login.php`, `/phpmyadmin`, `/node_modules`, and backup file extensions return `404`.
- Express hides the `X-Powered-By` header.

## What Must Be Done On The Server

These cannot be fully solved in application code:

- Stop exposing Node port `3175` directly to the internet.
- Put Nginx in front of the app.
- Use HTTPS.
- Add Nginx-level sensitive-path blocking and login rate limiting.
- Configure the firewall to expose only SSH, HTTP, and HTTPS.

## Temporary Direct-IP Mode

If you are not ready to configure Nginx yet, keep the app reachable directly on the public port:

```bash
PORT=3175
HOST=0.0.0.0
```

In this mode, the application-level protections still work: login is required, common scanner paths return `404`, and one IP is blocked for a day after five failed password attempts.

When Nginx and HTTPS are ready, change `HOST` back to `127.0.0.1` so Node is only reachable from the local reverse proxy.

## Step 1: Prepare A Domain

HTTPS with Let's Encrypt needs a domain. Create an A record:

```text
notes.example.com -> your server public IP
```

Wait until DNS resolves:

```bash
dig notes.example.com +short
```

## Step 2: Install Nginx And Certbot

```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
```

## Step 3: Start Notes On Local Port Only

Run the Node app on `3175`, but expose it through Nginx. Keep the app `.env` like this:

```bash
PORT=3175
HOST=127.0.0.1
DB_PATH=./data/notes.db
NOTES_AUTH_ENABLED=true
NOTES_AUTH_USERNAME=your-private-username
NOTES_AUTH_PASSWORD=your-long-random-password
NOTES_SESSION_SECRET=your-at-least-32-char-random-secret
NOTES_SESSION_DAYS=30
```

If using PM2:

```bash
cd /home/ubuntu/wx/wx/notes/notes
npm install
npm run build
pm2 start server.js --name notes-app
pm2 save
```

If the app already exists in PM2:

```bash
cd /home/ubuntu/wx/wx/notes/notes
git pull
npm install
npm run build
pm2 restart notes-app --update-env
```

## Step 4: Create The Nginx Config

Copy `deploy/nginx-notes.conf.example` to the server:

```bash
sudo cp deploy/nginx-notes.conf.example /etc/nginx/conf.d/notes.conf
sudo nano /etc/nginx/conf.d/notes.conf
```

Replace every `notes.example.com` with your real domain.

## Step 5: Get HTTPS Certificate

Before enabling the HTTPS server block, certbot can create the certificate:

```bash
sudo certbot --nginx -d notes.example.com
```

Then test and reload Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Step 6: Firewall

Allow SSH, HTTP, and HTTPS. Deny direct public access to `3175`.

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 3175/tcp
sudo ufw enable
sudo ufw status
```

## Step 7: Verify

The direct Node port should not be reachable from your local machine:

```bash
curl -i http://your-server-ip:3175/
```

The domain should work through HTTPS:

```bash
curl -I https://notes.example.com/
curl -i https://notes.example.com/.env
curl -i https://notes.example.com/api/auth/session
```

Expected:

- `https://notes.example.com/` returns the app.
- `https://notes.example.com/.env` returns `404`.
- `https://notes.example.com/api/auth/session` returns JSON.
