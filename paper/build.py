"""Build index.html from src/*.html.
Bilingual shorthand: [[English||Tiếng Việt]] -> <span class="en">…</span><span class="vi">…</span>
Run: python3 build.py"""
import glob
import os
import re
import sys

here = os.path.dirname(os.path.abspath(__file__))
parts = sorted(glob.glob(os.path.join(here, 'src', '*.html')))
html = ''.join(open(p, encoding='utf-8').read() for p in parts)
pat = re.compile(r'\[\[((?:(?!\[\[|\]\]|\|\|).)*?)\|\|((?:(?!\[\[|\]\]|\|\|).)*?)\]\]', re.S)
html, n = pat.subn(lambda m: f'<span class="en">{m.group(1)}</span><span class="vi">{m.group(2)}</span>', html)
no_js = re.sub(r'<script.*?</script>', lambda m: ' ' * len(m.group(0)), html, flags=re.S)
left = [m.start() for m in re.finditer(r'\[\[|\]\]|\|\|', no_js)]
if left:
    for pos in left[:10]:
        print('unconverted marker near:', repr(html[max(0, pos - 80):pos + 40]), file=sys.stderr)
    sys.exit(1)
open(os.path.join(here, 'index.html'), 'w', encoding='utf-8').write(html)
print(f'index.html: {len(parts)} parts, {n} bilingual pairs, {html.count("<section class=\"slide")} static slides')
