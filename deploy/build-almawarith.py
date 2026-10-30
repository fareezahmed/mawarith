#!/usr/bin/env python3
"""Build the almawarith.com production pages from mcalc/ (the fareez.dev/mcalc copy).

    python3 deploy/build-almawarith.py [OUT_DIR]      # default: deploy/almawarith.com

Production differs from mcalc/ only in build settings:
  - <base href="/"> and root-relative links instead of /mcalc/
  - almawarith.com absolute URLs instead of fareez.dev/mcalc
  - the production Umami website id
  - ?v=<first 8 hex of MD5> on styles.css, site.js and motion.js (cache busting)
On 2026-10-31 this reproduced every page in s3://almawarith-prod byte for byte from
the 22 Oct mcalc/ originals.

Deploy (changed pages only; HTML is text/html; charset=utf-8, max-age=300):
    aws s3 cp deploy/almawarith.com/<page>.html s3://almawarith-prod/<page>.html \
        --content-type 'text/html; charset=utf-8' --cache-control 'max-age=300'
    aws cloudfront create-invalidation --distribution-id E36MILXZBMINT5 --paths '/<page>.html' ...
"""
import hashlib, io, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'mcalc')
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'deploy', 'almawarith.com')
DEV_UMAMI = '95d7e13f-5749-4edc-a724-df39b41f5246'
PROD_UMAMI = '7da06aac-86a3-4434-83f3-4d15c82fa795'
ASSETS = ('styles.css', 'site.js', 'motion.js')
SKIP = {'services.html'}  # empty placeholder that production does not serve


def version(name):
    with open(os.path.join(SRC, name), 'rb') as fh:
        return hashlib.md5(fh.read()).hexdigest()[:8]


def transform(s, versions):
    for f, v in versions.items():
        s = s.replace(f'href="{f}"', f'href="{f}?v={v}"').replace(f'src="{f}"', f'src="{f}?v={v}"')
    s = s.replace(f'data-website-id="{DEV_UMAMI}"', f'data-website-id="{PROD_UMAMI}"')
    s = s.replace('<base href="/mcalc/" />', '<base href="/" />')
    s = s.replace('https://fareez.dev/mcalc/', 'https://almawarith.com/')
    s = s.replace('href="/mcalc/', 'href="/')
    s = s.replace('fareez.dev/mcalc', 'almawarith.com')
    return s


def main():
    versions = {f: version(f) for f in ASSETS}
    os.makedirs(OUT, exist_ok=True)
    for name in sorted(os.listdir(SRC)):
        if not name.endswith('.html') or name in SKIP:
            continue
        with io.open(os.path.join(SRC, name), encoding='utf-8') as fh:
            out = transform(fh.read(), versions)
        left = re.findall(r'.{0,30}(?:/mcalc|fareez\.dev/m(?!eeras)|' + DEV_UMAMI[:8] + r').{0,30}', out)
        if left:
            sys.exit(f'{name}: dev-only reference left after transform: {left}')
        with io.open(os.path.join(OUT, name), 'w', encoding='utf-8', newline='') as fh:
            fh.write(out)
        print('built', name)


if __name__ == '__main__':
    main()
