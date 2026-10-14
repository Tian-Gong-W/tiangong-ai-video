#!/usr/bin/env python3
"""Fetch OG image from a URL and save locally.

Pure stdlib — no external dependencies required.

Usage:
    python3 fetch-og-image.py "https://example.com" "public/og.png"
"""

import re
import sys
import urllib.request
import urllib.error
from html.parser import HTMLParser


class OGImageParser(HTMLParser):
    """Extract og:image and twitter:image from HTML meta tags."""

    def __init__(self):
        super().__init__()
        self.og_image = None
        self.twitter_image = None

    def handle_starttag(self, tag, attrs):
        if tag != "meta":
            return
        d = dict(attrs)

        # og:image
        prop = d.get("property", "").lower()
        if prop == "og:image" and d.get("content"):
            self.og_image = d["content"]

        # twitter:image
        name = d.get("name", "").lower()
        if name == "twitter:image" and d.get("content"):
            self.twitter_image = d["content"]


def fetch_og_image(url: str, output_path: str) -> bool:
    """Fetch the OG image from url and save to output_path.

    Returns True on success, False on failure.
    """
    print(f"Fetching page: {url}")

    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                       "AppleWebKit/537.36 (KHTML, like Gecko) "
                       "Chrome/120.0.0.0 Safari/537.36",
    }

    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            # Read only first 100KB to find meta tags (they're in <head>)
            html = resp.read(100_000).decode("utf-8", errors="replace")
    except (urllib.error.URLError, OSError) as e:
        print(f"Error fetching page: {e}")
        return False

    parser = OGImageParser()
    parser.feed(html)

    image_url = parser.og_image or parser.twitter_image
    if not image_url:
        print("No og:image or twitter:image found.")
        return False

    # Resolve relative URLs
    if image_url.startswith("//"):
        image_url = "https:" + image_url
    elif image_url.startswith("/"):
        from urllib.parse import urlparse
        parsed = urlparse(url)
        image_url = f"{parsed.scheme}://{parsed.netloc}{image_url}"

    print(f"Found image: {image_url}")
    print(f"Downloading to: {output_path}")

    try:
        req = urllib.request.Request(image_url, headers=headers)
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = resp.read()
    except (urllib.error.URLError, OSError) as e:
        print(f"Error downloading image: {e}")
        return False

    if len(data) < 1000:
        print(f"Warning: Image is very small ({len(data)} bytes), may be invalid.")

    import os
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)

    with open(output_path, "wb") as f:
        f.write(data)

    size_kb = len(data) / 1024
    print(f"Saved: {output_path} ({size_kb:.1f} KB)")
    return True


def main():
    if len(sys.argv) < 3:
        print(f"Usage: {sys.argv[0]} <url> <output_path>")
        print(f"Example: {sys.argv[0]} 'https://example.com' 'public/og.png'")
        sys.exit(1)

    url = sys.argv[1]
    output_path = sys.argv[2]

    if not fetch_og_image(url, output_path):
        sys.exit(1)


if __name__ == "__main__":
    main()
