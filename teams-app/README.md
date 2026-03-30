# HubSpot CRM — Microsoft 365 Copilot Plugin

This folder contains the Microsoft Teams App package that registers the HubSpot CRM
app as a Microsoft 365 Copilot plugin.

---

## Section 1: Local Development with ngrok

Microsoft 365 Copilot requires a **public HTTPS URL** to reach your API.
During local development, ngrok tunnels your localhost to a public URL.

### Steps

1. **Install ngrok and authenticate**
   ```bash
   # Install: https://ngrok.com/download
   ngrok config add-authtoken <your-authtoken>
   ```
   Get your authtoken at: https://dashboard.ngrok.com/get-started/your-authtoken

2. **Start your local dev server**
   ```bash
   npm run dev
   # Server runs on http://localhost:3000
   ```

3. **Start the ngrok tunnel** (in a separate terminal)
   ```bash
   ngrok http 3000
   ```

4. **Copy the ngrok HTTPS URL**
   ngrok will display something like:
   ```
   Forwarding  https://abc123.ngrok-free.app -> http://localhost:3000
   ```
   Copy the `https://abc123.ngrok-free.app` part.

5. **Update all config files with your ngrok URL**
   ```bash
   bash set-url.sh https://abc123.ngrok-free.app
   ```

6. **Build the app package**
   ```bash
   bash build.sh
   ```
   This produces `appPackage.zip`.

7. **Upload to Teams Admin Center**
   - Go to https://admin.teams.microsoft.com
   - Navigate to: **Teams apps > Manage apps > Upload new app**
   - Upload `appPackage.zip`

8. **Test in Microsoft 365 Copilot** with the example prompts in Section 3.

> **Important:** Every time ngrok restarts, you get a **new URL**.
> Repeat steps 4–7 whenever ngrok restarts.
>
> **Tip:** ngrok's paid plan provides a **static domain** (e.g., `yourname.ngrok-free.app`)
> that never changes — highly recommended for development to avoid the re-upload cycle.

---

## Section 2: Production Deployment to Vercel

1. **Deploy your Next.js app to Vercel**
   ```bash
   vercel --prod
   ```
   Your app will be live at `https://hubspot-copilot.vercel.app` (or your custom domain).

2. **Update all config files with your Vercel URL**
   ```bash
   bash set-url.sh https://hubspot-copilot.vercel.app
   ```

3. **Build the app package**
   ```bash
   bash build.sh
   ```

4. **Re-upload `appPackage.zip` to Teams Admin Center**
   - Go to https://admin.teams.microsoft.com
   - Find the existing app and click **Update** (or upload as new)
   - Upload the new `appPackage.zip`

5. **Enable Graph Connector in Microsoft Admin Center**
   - Go to https://admin.microsoft.com
   - Navigate to: **Settings > Search & intelligence > Data sources**
   - Enable and configure the HubSpot connector if applicable

---

## Section 3: Test Prompts for Copilot

Use these prompts in Microsoft 365 Copilot to verify the plugin is working:

1. **Create a contact:**
   > "Using HubSpot CRM, create a new contact for Sarah Johnson, email sarah.johnson@example.com, phone 555-234-5678"

2. **Update a contact:**
   > "Update HubSpot contact 12345678 — change their job title to VP of Sales and company to Acme Corp"

3. **Search for deals:**
   > "Search HubSpot deals for Acme Corp renewal"

4. **Pipeline status check:**
   > "What deals do we have in HubSpot related to enterprise accounts?"

5. **Combined workflow:**
   > "In HubSpot CRM, find all deals with 'Q2' in the name and tell me their amounts and close dates"

---

## Section 4: Troubleshooting

### ngrok URL changed and plugin stopped working
ngrok generates a new URL every time it restarts (on the free plan).
Re-run the full cycle:
```bash
bash set-url.sh https://<new-ngrok-url>.ngrok-free.app
bash build.sh
# Re-upload appPackage.zip to Teams Admin Center
```
**Fix:** Upgrade to ngrok's paid plan for a static domain.

### Copilot says plugin not found
- Wait 10–15 minutes after uploading — Copilot plugin registration is not instant.
- Verify the app is **Allowed** in Teams Admin Center (not blocked).
- Make sure your M365 tenant has **Microsoft 365 Copilot licenses** assigned.
- Check that the `copilotAgents.plugins` section in `manifest.json` is present and valid.

### API calls return 401 or 404
- **401:** The API requires authentication. For local dev, confirm `auth.type: none` in
  `ai-plugin.yaml`. For production, configure OAuth and update the auth block.
- **404:** The URL in `openapi.json` or `ai-plugin.yaml` doesn't match where your server
  is actually running. Re-run `set-url.sh` with the correct URL and rebuild.
- Verify ngrok is still running: `curl https://<your-ngrok-url>/openapi.json`

### Graph Connector stuck on crawling
- Graph Connectors can take 24–48 hours for the initial crawl.
- Check status at: https://admin.microsoft.com > Search & intelligence > Data sources
- Ensure the connector's OAuth credentials (client ID/secret) are valid and not expired.
- Review connector logs in Microsoft Search Admin Center for specific errors.

### Admin consent errors in Azure AD
- The app may require **tenant-wide admin consent** for Microsoft Graph permissions.
- Go to: https://portal.azure.com > Azure Active Directory > App registrations
- Find your app, go to **API permissions**, click **Grant admin consent for [tenant]**
- Ensure the app registration has the correct redirect URIs configured.
- If using OAuth in production, verify `auth.reference_id` in `ai-plugin.yaml` matches
  the OAuth registration in Teams Developer Portal.

---

## File Reference

| File | Purpose |
|------|---------|
| `manifest.json` | Teams App manifest — defines the plugin registration |
| `ai-plugin.yaml` | Copilot plugin descriptor — describes actions for the AI |
| `openapi.json` | OpenAPI 3.0 spec — documents all API routes and schemas |
| `color.png` | App icon 192×192 (orange, for Teams app listing) |
| `outline.png` | App icon 32×32 (white on transparent, for Teams sidebar) |
| `set-url.sh` | Swaps the base URL across all config files |
| `build.sh` | Zips manifest + icons into `appPackage.zip` |
| `appPackage.zip` | Generated — upload this to Teams Admin Center |
