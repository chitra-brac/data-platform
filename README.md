# Bangladesh Family Law Dataset

**1,512 law sections** from 58 family law acts with AI-generated summaries and smart retrieval.

---

## Quick Start

```bash
pip install -r requirements.txt
export OPENAI_API_KEY=your_key_here
python example.py
```

---

## What's Included

**Enhanced Data:**
- Plain-language summaries of every section
- Key terms extraction
- Amendment history & cross-references
- Smart intent-based retrieval (12 categories)

**12 Intent Categories:**
rape/sexual violence • domestic violence • dowry • child marriage • custody • maintenance • divorce • polygamy • inheritance • marriage registration • dower/mehr • parent maintenance

**Source:** bdlaws.gov.bd + Groq llama-3.3-70b semantic analysis

---

## Data Structure

Each of 1,512 sections contains:

```json
{
  "act_id": "835",
  "act_title": "The Prevention of Repression against Women and Children Act, 2000",
  "year": "2000",
  "section_number": "৯",
  "section_title": "Rape",
  "section_text": "(১) যদি কোনো পুরুষ...",
  "status": "active",
  "semantic_summary": "Defines rape and prescribes life imprisonment...",
  "key_terms": ["rape", "consent", "punishment"],
  "amendments": [{"year": "2003", "description": "Substituted by Act VIII"}],
  "external_references": ["The Penal Code, 1860"],
  "paragraphs": [...],
  "word_count": 245,
  "char_count": 1823
}
```

**Key Fields:**
- `semantic_summary` - AI-generated plain-language explanation
- `key_terms` - Extracted legal concepts
- `amendments` - Historical changes (~40% coverage)
- `external_references` - Cross-references (~35% coverage)
- `status` - active/repealed/omitted/redacted

---

## Usage

### Smart Retrieval

Automatically finds relevant sections based on user intent:

```python
from scripts.retrieval import FamilyLawRetriever

retriever = FamilyLawRetriever(data_file="data/family_laws_final.json")

# Bengali or English query
results = retriever.deterministic_only("আমার স্বামী আমাকে মারধর করে", top_k=5)

# Returns relevant sections:
# [{'section_id': ('1063', '৩'), 'score': 1.0, 'intent': 'domestic_violence_general'}, ...]
```

**How it works:**
1. LLM classifies query intent (GPT-4o-mini function calling)
2. Retrieves mandatory sections for that intent
3. Returns enriched section data with summaries

See [`data/INTENT_MAPPINGS.json`](data/INTENT_MAPPINGS.json) for complete intent → section mappings.

### Direct Data Access

```python
import json

with open('data/family_laws_final.json', 'r', encoding='utf-8') as f:
    sections = json.load(f)

# Filter by criteria
rape_sections = [s for s in sections
                 if 'rape' in s['semantic_summary'].lower()
                 and s['status'] == 'active']

# Access enriched fields
for section in rape_sections[:3]:
    print(f"Act {section['act_id']} §{section['section_number']}")
    print(f"Summary: {section['semantic_summary']}")
    print(f"Terms: {', '.join(section['key_terms'])}")
```

---

## Repository Structure

```
.
├── data/
│   ├── family_laws_final.json      # Main dataset (1,512 sections, 3.3 MB)
│   ├── INTENT_MAPPINGS.json        # Intent → section mappings (12 categories)
│   ├── act_summaries.json          # AI-generated summaries for all 58 acts
│   ├── SAMPLE.json                 # 3 example sections
│   └── feedback.json               # User feedback (created on first submission)
│
├── api/
│   └── main.py                     # FastAPI backend (port 8000)
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                 # Main navigation
│   │   └── components/             # React components
│   ├── package.json                # Node dependencies
│   └── vite.config.js              # Dev server on port 3001
│
├── scripts/
│   ├── retrieval.py                # Intent-based retrieval system
│   ├── openai_batch_parser.py      # LLM enhancement script
│   └── create_ground_truth.py      # Validation tools
│
├── example.py                      # Working demo
├── requirements.txt                # Python dependencies
└── README.md                       # This file
```

---

## Web Platform

Interactive data platform for browsing, verifying, and curating the dataset.

**Running the platform:**
```bash
# Terminal 1 - API
cd api
pip install fastapi uvicorn
python main.py  # Runs on http://localhost:8000

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev  # Runs on http://localhost:3001
```

**Architecture:**
- **Backend:** FastAPI serving data from `data/family_laws_final.json` and `data/INTENT_MAPPINGS.json`
- **Frontend:** React 18 + Tailwind CSS, minimal content-first design
- **Navigation:** Dashboard → Acts → Sections → Detail with prev/next browsing
- **Feedback:** User suggestions saved to `data/feedback.json` (manual review required)

**Key files:**
- `api/main.py` - REST API with endpoints for stats, sections, acts, intents, feedback
- `frontend/src/App.jsx` - Main navigation and state management
- `frontend/src/components/Browser.jsx` - Acts and sections list view
- `frontend/src/components/Dashboard.jsx` - Stats and intent categories overview
- `frontend/src/components/SectionDetail.jsx` - Full section view with navigation
- `frontend/src/components/IntentBrowser.jsx` - Intent category section listings

**Design philosophy:**
- Content-first, minimal chrome
- Metadata shown subtly "in passing" (corners, small gray text)
- No marketing copy, just data
- Feedback collection for crowdsourced improvements (doesn't auto-update data)

**Note:** Intent category suggestions via "Add to intent" require manual update to `INTENT_MAPPINGS.json`. Feedback is append-only to `feedback.json`.

---

## Data Quality

- **Coverage:** 100% semantic summaries, 100% key terms, 18% amendments, 22% cross-refs
- **Languages:** Bengali (original) + English (AI summaries)
- **Status:** 93% active, 7% repealed/omitted/redacted
- **Validation:** Manual review of intent mappings, AI summary spot-checks

---

## TODO

- [x] Generate act-level summaries
- [ ] Admin authentication for data management
- [ ] Fabricated procedural data
- [ ] Real case documents

---

## License

[TBD - Consult regarding derivative works of government legal documents]

**By Chitra (Shojeb & Sajid)** • https://github.com/chitra-brac/family-law-data

**See also:** [USAGE_GUIDE.md](USAGE_GUIDE.md) for detailed retrieval system documentation
