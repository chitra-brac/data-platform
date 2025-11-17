# Bangladesh Family Law Dataset (LLM-Enhanced)

**1,520 law sections** from 15 Bangladesh family law acts, enriched with semantic analysis.

---

## Dataset: `data/family_laws_final.json`

**Size:** 3.3 MB | **Format:** JSON | **Encoding:** UTF-8 (Bengali Unicode)

### Structure
```json
{
  "act_id": "835",
  "act_title": "The Prevention of Repression against Women and Children Act, 2000",
  "year": "2000",
  "section_number": "৯",
  "section_title": "Rape",
  "section_text": "(১) If any man commits rape...",
  "status": "active",
  "semantic_summary": "Defines rape and prescribes life imprisonment or death penalty...",
  "key_terms": ["rape", "consent", "sexual intercourse", "punishment"],
  "amendments": [{"year": "2003", "description": "Substituted by Act No. VIII of 2003"}],
  "external_references": ["The Penal Code, 1860"],
  "paragraphs": [...],
  "word_count": 245,
  "char_count": 1823
}
```

---

## Enhanced Fields (LLM-Generated)

| Field | Description | Coverage |
|-------|-------------|----------|
| **semantic_summary** | Plain-language explanation | 100% (1,520/1,520) |
| **key_terms** | Extracted legal concepts | 100% (1,520/1,520) |
| **amendments** | Structured timeline of changes | 40% (~600/1,520) |
| **external_references** | Cross-references to other laws | 35% (~530/1,520) |
| **status** | active/repealed/omitted/redacted | 100% (1,520/1,520) |

---

## Processing

- **Source:** bdlaws.gov.bd (Bangladesh government legal database)
- **Parser:** `scripts/openai_batch_parser.py`
- **LLM:** Groq llama-3.3-70b (FREE tier)
- **Validation:** `scripts/create_ground_truth.py`
- **Time:** ~3-4 hours for full dataset
- **Cost:** FREE (within Groq rate limits)

---

## Acts Covered

1. Prevention of Repression against Women and Children Act, 2000 (Act 835)
2. Domestic Violence (Prevention and Protection) Act, 2010 (Act 1063)
3. Dowry Prohibition Act, 1980 (Act 607)
4. Child Marriage Restraint Act, 2017 (Act 1084)
5. Muslim Family Laws Ordinance, 1961 (Act 221)
6. Muslim Marriages and Divorces (Registration) Act, 1974 (Act 580)
7. Family Courts Ordinance, 1985 (Act 318)
8. Dissolution of Muslim Marriages Act, 1939 (Act 197)
9. Guardians and Wards Act, 1890 (Act 215)
10. Hindu Marriage Disabilities Removal Act, 1946
11. Hindu Widows' Remarriage Act, 1856
12. Hindu Married Women's Right to Property Act, 1937
13. Christian Marriage Act, 1872
14. Divorce Act, 1869
15. Special Marriage Act, 1872

---

## Use Cases

### 1. RAG Systems
Semantic summaries + key terms enable better vector search and context retrieval.

### 2. Legal Research
Amendment tracking shows evolution of laws over time.

### 3. Knowledge Graphs
External references allow building legal connection networks.

### 4. Accessibility
Plain-language summaries make laws understandable to non-lawyers.

### 5. Training Data
High-quality structured data for legal AI model training.

---

## Statistics

```
Total Sections:    1,520
Total Acts:        15
Active Sections:   1,420 (93%)
Repealed:          45 (3%)
Omitted:           35 (2%)
Redacted:          20 (1%)

Average Section Length: 2,400 characters
Longest Section: 12,000+ characters
Shortest Section: 50 characters
```

---

## Data Quality

✅ **100%** semantic summary coverage
✅ **100%** key terms extraction
✅ **100%** status classification
✅ Bengali numerals preserved (০১২৩৪৫৬৭৮৯)
✅ Cross-references validated against known acts
✅ Amendment years chronologically ordered

### Known Limitations
- Semantic summaries are AI-generated (not lawyer-verified)
- Some complex legal language may be oversimplified
- External references depend on explicit citations
- Amendments may not capture all historical changes

---

## Quick Start

### Load the dataset
```python
import json

with open('data/family_laws_final.json', 'r', encoding='utf-8') as f:
    sections = json.load(f)

# Find all rape-related sections
rape_sections = [
    s for s in sections
    if 'rape' in s['semantic_summary'].lower()
    and s['status'] == 'active'
]

print(f"Found {len(rape_sections)} active sections on rape")
```

### Search by act
```python
act_835_sections = [s for s in sections if s['act_id'] == '835']
print(f"Act 835 has {len(act_835_sections)} sections")
```

### Find amended sections
```python
amended = [s for s in sections if s.get('amendments')]
print(f"{len(amended)} sections have amendments")

# Group by year
from collections import Counter
years = [a['year'] for s in amended for a in s['amendments']]
print(Counter(years).most_common(5))
```

---

## Citation

```
Bangladesh Family Law Dataset - LLM-Enhanced Edition
Created: November 2024
Source: bdlaws.gov.bd
Enhancement: Groq llama-3.3-70b semantic analysis
Sections: 1,520 from 15 family law acts
```

---

## License

[To be determined - Consult regarding derivative works of government legal documents]

---

## Contact

**Maintainer:** BRAC Research Team
**Repository:** https://github.com/chitra-brac/family-law-data

---

**Last Updated:** November 2024
