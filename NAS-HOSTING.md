# Lakefront Serenity — NAS hosting

The production preview is a static nginx container on the TrueNAS server.

## NAS paths and service

- Project: `/mnt/ada pool/Ruddy/Rusanth/Live Servers/Cottage`
- Container: `canal-lake-cottage`
- Compose file: `docker-compose.nas.yml`
- Private Tailscale URL: `http://100.113.203.52:8097/`
- Public HTTPS Funnel URL: `https://truenas-scale.taila4f845.ts.net:10000/`

## Update safely

Copy the project to the NAS without `node_modules` or `.git`, then run:

```bash
cd '/mnt/ada pool/Ruddy/Rusanth/Live Servers/Cottage'
docker compose -f docker-compose.nas.yml config
docker compose -f docker-compose.nas.yml up -d
curl -fsSI http://127.0.0.1:8097/
```

## Public domain

The `100.113.203.52` address is private to Tailscale and cannot be used as a public GoDaddy DNS target. A public domain needs one of these routes:

1. A Cloudflare Tunnel from the NAS to a public hostname; or
2. Router port forwarding to an HTTPS reverse proxy on the NAS, with a valid TLS certificate and DDNS if the home public IP changes.

The safer recommendation is a Cloudflare Tunnel. The domain may remain registered at GoDaddy while its DNS is delegated to Cloudflare. Direct checkout should not be enabled until the channel manager, payment account, applicable taxes, cancellation policy, rental agreement and Renter's Code of Conduct are configured.

The current Tailscale Funnel is public and persists in the background. To disable only this cottage endpoint on the NAS:

```bash
docker exec ix-tailscale-tailscale-1 tailscale funnel --https=10000 off
```

## Airbnb sync monitoring

The `lakefront-airbnb-calendar-sync` container refreshes the read-only Airbnb calendar every five minutes. The host-side `scripts/check-airbnb-calendar.sh` check should run every 15 minutes. It alerts `karansuba6@gmail.com`, `ruddyrusanth@gmail.com` and `tharan.pir@gmail.com` when the container is down or the feed is stale for more than six hours, then sends a recovery message when it returns to normal.

The NAS must have outbound email configured in **System Settings → Alert Settings → Email Settings** for `/usr/bin/mail` to deliver these alerts. Configure SMTP and the sender there; do not put an SMTP password in the project files.
