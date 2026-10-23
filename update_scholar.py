"""Fetch citation counts from a public Google Scholar profile and write scholar.json.

If Scholar blocks the request (captcha / rate limit), the existing scholar.json
is kept untouched so the website never breaks.
"""
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

from scholarly import scholarly

SCHOLAR_ID = "pCDDhPwAAAAJ"
OUT = Path(__file__).resolve().parent.parent / "scholar.json"


def main() -> int:
    try:
        author = scholarly.search_author_id(SCHOLAR_ID)
        author = scholarly.fill(author, sections=["basics", "indices", "publications"])
    except Exception as e:  # blocked, network error, private profile ...
        print(f"Scholar fetch failed: {e}", file=sys.stderr)
        return 0  # keep old file, do not fail the workflow

    papers = []
    for p in author.get("publications", []):
        bib = p.get("bib", {})
        title = (bib.get("title") or "").strip()
        if title:
            papers.append({
                "title": title,
                "year": bib.get("pub_year"),
                "cites": int(p.get("num_citations", 0) or 0),
            })

    if not papers:
        print("No publications returned; keeping existing scholar.json", file=sys.stderr)
        return 0

    data = {
        "updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "total": int(author.get("citedby", sum(x["cites"] for x in papers))),
        "hindex": author.get("hindex"),
        "i10index": author.get("i10index"),
        "papers": papers,
    }
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Saved {len(papers)} papers, total citations {data['total']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
