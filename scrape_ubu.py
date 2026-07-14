#!/usr/bin/env python3
"""UbuWeb Film Scraper — parallel version."""

import requests, re, json, time
from concurrent.futures import ThreadPoolExecutor, as_completed
from html import unescape
from urllib.parse import urljoin
from collections import defaultdict

BASE = "https://www.ubu.com/film/"

def get_decade(year):
    if year is None: return "unknown"
    if year < 1940: return "pre-1940s"
    if year < 1950: return "1940s"
    if year < 1960: return "1950s"
    if year < 1970: return "1960s"
    if year < 1980: return "1970s"
    if year < 1990: return "1980s"
    if year < 2000: return "1990s"
    if year < 2010: return "2000s"
    return "2010s+"

HEADERS = {'User-Agent': 'tube-surf/0.1.0'}

def get_film_links(href, name):
    """Get film links from a filmmaker page. Returns list of (url, title, filmmaker)."""
    try:
        r = requests.get(BASE + href, timeout=10, headers=HEADERS)
        prefix = href.replace('.html', '_')
        films = []
        for link, title in re.findall(r'<a\s+href="([^"]+\.html)"[^>]*>([^<]+)</a>', r.text):
            title = unescape(title.strip())
            if (link.startswith(prefix) and 
                not any(w in title.lower() for w in ('ubuweb', 'back to', 'sound', 'concept'))):
                films.append((urljoin(BASE, link), title, name))
        return films
    except: return []

def scrape_film(url, title, filmmaker):
    """Scrape a single film page. Returns dict or None."""
    try:
        r = requests.get(url, timeout=10, headers=HEADERS)
        if r.status_code != 200: return None
        c = r.text
    except: return None
    
    mp4 = re.search(r'<a[^>]*href="([^"]+\.mp4)"', c)
    if not mp4: return None
    
    path = mp4.group(1)
    if path.startswith('../'):
        mp4_url = urljoin(BASE, path)
    elif path.startswith('/'):
        mp4_url = urljoin('https://www.ubu.com', path)
    elif '://' in path:
        mp4_url = path
    else:
        mp4_url = urljoin(url, path)
    
    hls = re.search(r'<source\s+src="([^"]+\.m3u8)"', c)
    
    years = set()
    for m in re.finditer(r'\((\d{4})\)', title + ' ' + c[:3000]):
        years.add(int(m.group(1)))
    year = sorted(years)[-1] if years else None
    decade = get_decade(year)
    
    return {
        'title': title, 'filmmaker': filmmaker, 'year': year,
        'mp4_url': mp4_url, 'hls_url': hls.group(1) if hls else None,
        'decade': decade
    }

# ── Main ──
print("🎬 tube-surf UbuWeb Scraper (parallel)\n")

# Step 1: Filmmaker list
print("📋 Fetching filmmaker index...")
r = requests.get(BASE + 'index.html', timeout=15)
filmmakers = re.findall(r'<a\s+href="([a-z_]+\.html)"[^>]*>([^<]+)</a>', r.text)
filmmakers = [(h, unescape(n.strip())) for h, n in filmmakers 
              if h not in ('index.html', '') and len(n.strip()) > 2]
print(f"   {len(filmmakers)} filmmakers\n")

# Step 2: Get film links (parallel)
print("🎥 Finding film links (parallel, 15 workers)...")
all_films = []
with ThreadPoolExecutor(max_workers=15) as pool:
    futures = {pool.submit(get_film_links, h, n): (h, n) for h, n in filmmakers}
    for i, f in enumerate(as_completed(futures)):
        if (i+1) % 100 == 0: print(f"   {i+1}/{len(filmmakers)} filmmakers...")
        all_films.extend(f.result())

print(f"   {len(all_films)} film links found\n")

# Step 3: Scrape film pages (parallel)
print(f"🎞️  Extracting video URLs (parallel, 15 workers)...")
decades = defaultdict(list)
with ThreadPoolExecutor(max_workers=15) as pool:
    futures = {pool.submit(scrape_film, url, title, filmmaker): (url, title) for url, title, filmmaker in all_films}
    for i, f in enumerate(as_completed(futures)):
        if (i+1) % 200 == 0: print(f"   {i+1}/{len(all_films)} films...")
        result = f.result()
        if result:
            decades[result.pop('decade')].append(result)

# Output
total = sum(len(v) for v in decades.values())
print(f"\n📊 Total films with MP4s: {total}")
for d in sorted(decades.keys()):
    print(f"   {d}: {len(decades[d])}")

with open('ubuweb_films.json', 'w') as f:
    json.dump({'source': 'ubu.com/film', 'total': total, 'decades': dict(decades)}, f, indent=2, ensure_ascii=False)

print(f"\n✅ Saved ubuweb_films.json")
