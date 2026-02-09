

# Fix Aggressive Polling from Preview

## Problem
The Glances hook polls 7 endpoints every 5 seconds unconditionally. This means:
- 84 requests/minute to your reverse proxy from the Lovable preview alone
- Requests continue even when the tab is hidden or all endpoints are failing
- Your proxy logs get flooded with requests from the preview URL as referrer

## Changes

### 1. Add Page Visibility Check (`src/hooks/useGlances.ts`)
- Only poll when the browser tab is actually visible using the `document.visibilitychange` API
- Pause polling entirely when the tab is in the background

### 2. Back Off on Failure
- If all 7 endpoints fail, increase the interval to 60 seconds instead of retrying every 5 seconds
- Reset to normal interval once a request succeeds again

### 3. Increase Default Poll Interval
- Change from 5 seconds to 30 seconds — system stats don't change fast enough to justify 5s polling
- This alone cuts traffic from 84 to 14 requests/minute

### 4. Stop Polling in Non-Production Contexts (Optional)
- Detect if running inside Lovable preview (check `window.location.hostname`) and either disable polling entirely or set a very long interval (e.g., 120s)

## Technical Details

All changes are in `src/hooks/useGlances.ts`:

```text
Current:  setInterval(fetchStats, 5000)
Proposed: setInterval(fetchStats, 30000) + visibility pause + failure backoff
```

- Use `document.addEventListener('visibilitychange', ...)` to pause/resume
- Track consecutive failures; if all endpoints fail, set interval to 60s
- On success, reset to 30s
- No changes to any other files
