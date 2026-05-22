#!/usr/bin/env bash
# Upload the static homepage and Mawārīth app to the fareez.dev S3 website bucket.
#
# Requires: AWS CLI configured (env, profile, or SSO).
#
# Environment (optional):
#   AWS_S3_BUCKET              default: fareez.dev
#   AWS_PROFILE                passed to aws --profile
#   CLOUDFRONT_DISTRIBUTION_ID  unset → E3BVH5HH4S1R5R; set to empty string to skip invalidation

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUCKET="${AWS_S3_BUCKET:-fareez.dev}"
PROFILE="${AWS_PROFILE:-}"
CF_ID="${CLOUDFRONT_DISTRIBUTION_ID-E3BVH5HH4S1R5R}"

aws_bin=(aws)
if [[ -n "$PROFILE" ]]; then
  aws_bin+=(--profile "$PROFILE")
fi

echo "→ s3://${BUCKET}/index.html  (site root)"
"${aws_bin[@]}" s3 cp "$ROOT/deploy/fareez.dev/index.html" "s3://${BUCKET}/index.html" \
  --content-type 'text/html; charset=utf-8' \
  --cache-control 'max-age=300'

echo "→ s3://${BUCKET}/mcalc/index.html"
"${aws_bin[@]}" s3 cp "$ROOT/mcalc/index.html" "s3://${BUCKET}/mcalc/index.html" \
  --content-type 'text/html; charset=utf-8' \
  --cache-control 'max-age=300'

if [[ -n "$CF_ID" ]]; then
  echo "→ CloudFront invalidation ${CF_ID}"
  "${aws_bin[@]}" cloudfront create-invalidation \
    --distribution-id "$CF_ID" \
    --paths "/index.html" "/mcalc" "/mcalc/" "/mcalc/index.html"
fi

echo "Done. Open https://fareez.dev/ and https://fareez.dev/mcalc/"
