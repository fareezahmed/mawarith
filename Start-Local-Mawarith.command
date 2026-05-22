#!/bin/bash
# Double-click this file in Finder to serve the calculator and open it in your default browser.
# Cursor's embedded Simple Browser usually cannot reach your Mac's localhost — use Safari or Chrome instead.

cd "$(dirname "$0")"
PORT="${MAWARITH_PORT:-8810}"

echo ""
echo "  Mawārīth local preview"
echo "  ----------------------"
echo "  URL (copy into Safari / Chrome):  http://127.0.0.1:${PORT}/"
echo "  Press Ctrl+C in this window to stop the server."
echo ""

(sleep 0.8 && open "http://127.0.0.1:${PORT}/") &

exec python3 -m http.server "$PORT" --bind 127.0.0.1 --directory mcalc
