"""
Simple API to serve Bangladesh Family Law data for demo/showcase
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import os
from datetime import datetime

app = FastAPI(title="Family Law Data Showcase API")

# CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load data
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_FILE = os.path.join(BASE_DIR, "data", "family_laws_final.json")
INTENT_FILE = os.path.join(BASE_DIR, "data", "INTENT_MAPPINGS.json")
FEEDBACK_FILE = os.path.join(BASE_DIR, "data", "feedback.json")

with open(DATA_FILE, 'r', encoding='utf-8') as f:
    sections = json.load(f)

with open(INTENT_FILE, 'r', encoding='utf-8') as f:
    intent_data = json.load(f)
    intents = intent_data.get('intents', {})


class Feedback(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    organization: Optional[str] = None
    message: str
    section_id: Optional[str] = None


@app.get("/")
def root():
    return {
        "message": "Family Law Data Showcase API",
        "total_sections": len(sections),
        "docs": "/docs"
    }


@app.get("/stats")
def get_stats():
    """Get dataset statistics for dashboard"""
    acts = {}
    status_count = {}

    for s in sections:
        # Count by act
        act_id = s['act_id']
        if act_id not in acts:
            acts[act_id] = {
                'id': act_id,
                'title': s['act_title'],
                'year': s['year'],
                'count': 0
            }
        acts[act_id]['count'] += 1

        # Count by status
        status = s.get('status', 'unknown')
        status_count[status] = status_count.get(status, 0) + 1

    with_amendments = sum(1 for s in sections if s.get('amendments'))
    with_refs = sum(1 for s in sections if s.get('external_references'))

    return {
        "total_sections": len(sections),
        "total_acts": len(acts),
        "acts": sorted(acts.values(), key=lambda x: -x['count']),
        "status": status_count,
        "with_amendments": with_amendments,
        "with_references": with_refs,
        "intent_categories": len(intents)
    }


@app.get("/acts")
def get_acts():
    """Get list of all acts with section counts"""
    acts = {}
    for s in sections:
        act_id = s['act_id']
        if act_id not in acts:
            acts[act_id] = {
                'id': act_id,
                'title': s['act_title'],
                'year': s['year'],
                'count': 0
            }
        acts[act_id]['count'] += 1
    return {"acts": sorted(acts.values(), key=lambda x: -int(x['year']) if x['year'].isdigit() else 0)}


@app.get("/sections")
def get_sections(
    act_id: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
):
    """Get sections with filters"""
    filtered = sections

    if act_id:
        filtered = [s for s in filtered if s['act_id'] == act_id]

    if status:
        filtered = [s for s in filtered if s.get('status') == status]

    if search:
        search_lower = search.lower()
        filtered = [s for s in filtered if
                   search_lower in s.get('section_title', '').lower() or
                   search_lower in s.get('semantic_summary', '').lower() or
                   search_lower in s.get('section_text', '').lower()]

    total = len(filtered)
    return {
        "total": total,
        "sections": filtered[offset:offset + limit]
    }


@app.get("/section/{act_id}/{section_num}")
def get_section(act_id: str, section_num: str):
    """Get specific section"""
    section = next((s for s in sections
                   if s['act_id'] == act_id and s['section_number'] == section_num), None)
    if not section:
        raise HTTPException(404, "Section not found")
    return section


@app.get("/intents")
def get_intents():
    """Get intent categories"""
    return {
        "intents": [
            {
                "name": k,
                "display": k.replace('_', ' ').title(),
                "description": v.get('description', ''),
                "count": len(v.get('mandatory_sections', []))
            }
            for k, v in intents.items()
        ]
    }


@app.post("/feedback")
def submit_feedback(feedback: Feedback):
    """Save feedback from users"""
    entry = {
        **feedback.dict(),
        "timestamp": datetime.now().isoformat()
    }

    # Load and append
    if os.path.exists(FEEDBACK_FILE):
        with open(FEEDBACK_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
    else:
        data = []

    data.append(entry)

    with open(FEEDBACK_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    return {"message": "Thanks for your feedback!"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
