#!/bin/sh

set -u

COTTAGE_ROOT="${COTTAGE_ROOT:-/mnt/ada pool/Ruddy/Rusanth/Live Servers/Cottage}"
AVAILABILITY_FILE="$COTTAGE_ROOT/static-site/airbnb-availability.json"
STATE_FILE="$COTTAGE_ROOT/nas/airbnb-calendar-monitor.state"
SYNC_CONTAINER="${SYNC_CONTAINER:-lakefront-airbnb-calendar-sync}"
MAX_AGE_SECONDS="${MAX_AGE_SECONDS:-21600}"
RECIPIENTS="${RECIPIENTS:-karansuba6@gmail.com ruddyrusanth@gmail.com tharan.pir@gmail.com}"

now="$(date +%s)"
status="healthy"
detail="Airbnb calendar sync is healthy."

if ! /usr/bin/docker inspect -f '{{.State.Status}}' "$SYNC_CONTAINER" 2>/dev/null | /usr/bin/grep -qx running; then
  status="container-down"
  detail="The Airbnb calendar sync container is not running."
elif [ ! -s "$AVAILABILITY_FILE" ]; then
  status="missing-feed"
  detail="The Airbnb availability file is missing or empty."
else
  synced_at="$(/usr/bin/jq -r '.syncedAt // empty' "$AVAILABILITY_FILE" 2>/dev/null || true)"
  if [ -z "$synced_at" ]; then
    status="never-synced"
    detail="The Airbnb availability file has no syncedAt timestamp."
  else
    synced_epoch="$(date -d "$synced_at" +%s 2>/dev/null || true)"
    if [ -z "$synced_epoch" ]; then
      status="invalid-timestamp"
      detail="The Airbnb availability file has an invalid syncedAt timestamp: $synced_at"
    else
      age=$((now - synced_epoch))
      if [ "$age" -gt "$MAX_AGE_SECONDS" ]; then
        status="stale-feed"
        detail="The Airbnb availability feed has not refreshed for $((age / 3600)) hours."
      else
        detail="Airbnb availability last synced $((age / 60)) minutes ago."
      fi
    fi
  fi
fi

previous=""
[ -f "$STATE_FILE" ] && previous="$(/usr/bin/cat "$STATE_FILE" 2>/dev/null || true)"

if [ "$status" != "healthy" ] && [ "$previous" != "$status" ]; then
  printf '%s\n\n%s\n\nHost: %s\nFile: %s\n' \
    "Lakefront Serenity Airbnb calendar alert" \
    "$detail" \
    "$(hostname)" \
    "$AVAILABILITY_FILE" | /usr/bin/mail -s "Lakefront Serenity: Airbnb calendar alert" $RECIPIENTS 2>/dev/null || true
  printf '%s\n' "$status" > "$STATE_FILE"
elif [ "$status" = "healthy" ] && [ -n "$previous" ]; then
  printf '%s\n\nThe Airbnb calendar sync has recovered.\n\n%s\n' \
    "Lakefront Serenity Airbnb calendar recovered" \
    "$detail" | /usr/bin/mail -s "Lakefront Serenity: Airbnb calendar recovered" $RECIPIENTS 2>/dev/null || true
  rm -f "$STATE_FILE"
fi

printf '%s status=%s detail=%s\n' "$(date -Is)" "$status" "$detail"
