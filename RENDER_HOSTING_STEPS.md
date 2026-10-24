# Host STRIDE on Render - follow these steps

Use **Render with a persistent disk**. You do not need Supabase or Vercel.
This requires a **paid web service plus disk storage**; check the total shown
before confirming payment. Free Render services cannot use a persistent disk.

## 1. Push the hosting update to GitHub

The app now supports Render's public address and listening interface. From
PowerShell, run:

```powershell
cd D:\Projects\my-fitness-tracking
git add STRIDE_ASTRA_v1_FINAL/src/server.mjs STRIDE_ASTRA_v1_FINAL/test/hosting.test.mjs RENDER_HOSTING_STEPS.md
git commit -m "Prepare STRIDE for Render hosting"
git push origin master
```

Do not upload your local database or keys to GitHub.

## 2. Create the Render service

1. Open https://dashboard.render.com and sign in with GitHub.
2. Click **New > Web Service**.
3. Connect **shubhams-git/my-fitness-tracking**.
4. Enter these settings:

| Field | Enter |
|---|---|
| Name | `stride-intelligence` (or an available name) |
| Language / Runtime | `Node` |
| Branch | `master` |
| Region | `Singapore` |
| Root Directory | `STRIDE_ASTRA_v1_FINAL` |
| Build Command | `npm ci` |
| Start Command | `npm start` |
| Instance Type | `Starter` - paid, not Free |

## 3. Add these three environment variables

In **Environment Variables**, add:

| Key | Value |
|---|---|
| `NODE_VERSION` | `24.22.1` |
| `HOST` | `0.0.0.0` |
| `STRIDE_DATA_DIR` | `/var/data/stride` |

Leave `PORT` and `STRIDE_ORIGIN` unset. Render supplies the port and public URL;
the updated app uses them automatically.

## 4. Add the disk - do not skip this

1. Expand **Advanced** on the creation page.
2. Under **Add Disk**, enter:

   | Field | Enter |
   |---|---|
   | Name | `stride-data` (if a name is requested) |
   | Mount Path | `/var/data` |
   | Size | `1 GB` |

3. Set **Health Check Path** to `/health`.
4. Confirm the paid service and disk charges, then click **Deploy Web Service**.

If the creation form does not show disk settings: create the paid service, open
its **Disks** page, add the same disk there, and deploy again. Do not import any
personal data before the disk is attached.

## 5. Get your hosted login key

1. Wait until the service says **Live**.
2. Open the service's **Shell** tab.
3. Run:

   ```sh
   cat /var/data/stride/owner-key.txt
   ```

4. Copy the displayed key privately. Do not send it to anyone.
5. Open the service's `https://...onrender.com` URL.
6. Paste the key into **Owner key**, then click **Unlock journal**.

The hosted key is new. Your old local key is not the hosted login key.

## 6. Move your existing history

1. Open your existing local STRIDE app.
2. Go to **Data & privacy > Export encrypted backup**.
3. Choose a passphrase and download the `.stride` file.
4. Open the hosted STRIDE app.
5. Go to **Data & privacy > Restore a backup**.
6. Select the `.stride` file and enter its passphrase.
7. Click **Preview backup**, check the records, type **RESTORE**, then confirm.

## 7. Confirm storage works

1. Check that your weights and sessions appear on the hosted app.
2. In Render, choose **Manual Deploy > Deploy latest commit**.
3. Wait for **Live**, then reopen STRIDE.
4. Confirm that the same key still unlocks it and your records are still there.
5. Open the same HTTPS URL in Safari on your iPhone.

**Done.** Keep exporting encrypted backups periodically. Keep the disk attached
and use one service instance. Do not delete the service/disk while relying on it
for your records.

Official references checked 25 October 2026:
[Node deployment](https://render.com/docs/deploy-node-express-app),
[persistent disks](https://render.com/docs/disks),
[Node version](https://render.com/docs/node-version).
