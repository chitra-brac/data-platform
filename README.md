# Bangladesh Family Law Dataset

**1,520 law sections** made easier to understand and use with AI.

---

## What is This?

Legal data from 15 Bangladesh family law acts, enhanced to be:
- ✅ **Easier to read** - Plain-language summaries of complex legal text
- ✅ **Easier to search** - Intelligent system understands what users need
- ✅ **Easier to use** - Ready-to-use code and examples included

---

## Quick Start (5 minutes)

```bash
# 1. Install
pip install -r requirements.txt

# 2. Set your OpenAI API key in example.py (line 10)

# 3. Run
python example.py
```

You'll see the system automatically find relevant laws for queries like:
- "আমি ধর্ষিত হয়েছি" (I was raped)
- "My husband beats me"
- "How do I get a divorce?"

---

## What Makes This Special?

### 🤖 AI-Enhanced Legal Text

Every law section now includes:

| What | Why It Helps |
|------|-------------|
| **Plain summary** | Understand laws without legal training |
| **Key terms** | Quickly scan what a section covers |
| **Amendment history** | See how laws changed over time |
| **Related laws** | Find connected legal information |

**Example:**

Instead of just seeing dense legal Bengali text, you get:

```
📖 Plain Summary:
"Defines rape and prescribes life imprisonment or death penalty,
with additional fine. Covers situations of rape with or without
consent, including when consent is obtained through deception."

🔑 Key Terms: rape, consent, punishment, life imprisonment

📅 Amendments: 2003 (Substituted by Act VIII)

🔗 Related Laws: The Penal Code, 1860
```

### 🎯 Smart Search System

The system understands **what people need**, not just keywords.

**Traditional search problem:**
- User says: "আমি ধর্ষিত হয়েছি" (I was raped)
- Keyword search: ❌ Fails (user doesn't use legal terms)

**Our solution:**
- AI understands: This is about "rape/sexual violence"
- System retrieves: Act 835 Section 9 (Rape law) automatically
- Result: ✅ User gets the right laws immediately

**Powered by:**
- 12 legal intent categories (rape, domestic violence, divorce, etc.)
- AI classification (understands Bengali & English)
- Carefully chosen mandatory sections for each situation

See what each intent maps to: [`data/INTENT_MAPPINGS.json`](data/INTENT_MAPPINGS.json)

---

## The Data

### 📊 Stats

```
Sections:     1,520
Acts:         15 family law acts
Size:         3.3 MB
Languages:    Bengali (primary) + English summaries
Status:       93% active, 7% repealed/omitted/redacted
```

### 📁 Files

**Main Dataset:**
- [`data/family_laws_final.json`](data/family_laws_final.json) - Complete data (1,520 sections)

**Quick Preview:**
- [`data/SAMPLE.json`](data/SAMPLE.json) - 3 example sections to see the structure

**Intent Mappings:**
- [`data/INTENT_MAPPINGS.json`](data/INTENT_MAPPINGS.json) - See which laws match which situations

### 📚 Which Laws Are Included?

The 15 most important family law acts:

1. **Act 835** - Women & Children Protection (rape, sexual harassment)
2. **Act 1063** - Domestic Violence Prevention
3. **Act 607** - Dowry Prohibition
4. **Act 1084** - Child Marriage Prevention
5. **Act 221** - Muslim Family Laws (divorce, custody, maintenance)
6. **Act 580** - Marriage Registration
7. **Act 318** - Family Courts
8. **Act 197** - Dissolution of Muslim Marriages
9. **Act 215** - Guardians and Wards
10. Plus 6 more acts covering Hindu, Christian, and other marriages

---

## How to Use It

### Option 1: Use the Smart Retrieval System (Easiest)

Let the system find relevant laws automatically:

```python
from scripts.retrieval import FamilyLawRetriever

# Load the system
retriever = FamilyLawRetriever(data_file="data/family_laws_final.json")

# Ask a question (Bengali or English)
results = retriever.deterministic_only("আমার স্বামী আমাকে মারধর করে", top_k=5)

# Get back the most relevant law sections automatically
# Returns: Act 1063 §3 (DV definition), §14 (Protection order), etc.
```

**Read the complete guide:** [`USAGE_GUIDE.md`](USAGE_GUIDE.md)

### Option 2: Work with Raw Data Directly

Access the data yourself:

```python
import json

# Load the data
with open('data/family_laws_final.json', 'r', encoding='utf-8') as f:
    sections = json.load(f)

# Each section has this structure:
section = sections[0]
print(section['act_title'])           # "The Prevention of..."
print(section['section_number'])      # "৯"
print(section['section_title'])       # "Rape"
print(section['semantic_summary'])    # "Defines rape and..."
print(section['key_terms'])           # ["rape", "consent", ...]
print(section['status'])              # "active"
```

---

## What Can You Build?

💡 **Ideas:**

1. **Legal chatbot** - Answer family law questions for Bengali speakers
2. **Rights awareness app** - Help people understand their legal rights
3. **Lawyer assistance tool** - Quick reference for legal professionals
4. **Research platform** - Study how Bangladesh laws evolved
5. **Training data** - Train AI models on legal Bengali text

---

## How Was This Made?

### Step 1: Data Collection
- Downloaded from bdlaws.gov.bd (official Bangladesh government legal database)
- Extracted 1,520 sections from 15 family law acts
- Preserved Bengali text exactly as written in official laws

### Step 2: AI Enhancement
- Used AI (Groq llama-3.3-70b) to analyze each section
- Generated plain-language summaries
- Extracted key legal terms
- Identified amendments and cross-references
- **Cost:** FREE (used Groq's free tier)
- **Time:** 3-4 hours processing time

### Step 3: Expert Curation
- Manually mapped 12 intent categories to relevant sections
- Legal expert review of intent → section relationships
- Quality validation of AI-generated summaries

---

## Installation

```bash
# Clone or download this repository
git clone https://github.com/chitra-brac/family-law-data.git
cd family-law-data

# Install Python dependencies
pip install -r requirements.txt

# Required: OpenAI API key (for the smart search)
export OPENAI_API_KEY=your_key_here
```

**Dependencies:**
- `openai` - For intent classification (smart search)
- `python-dotenv` - For environment variables
- `numpy` - For some validation scripts (optional)

---

## Repository Structure

```
.
├── README.md                    # 👈 You are here
├── USAGE_GUIDE.md               # Detailed how-to guide
├── example.py                   # Working demo script
├── requirements.txt             # Python packages needed
│
├── data/
│   ├── family_laws_final.json  # 📊 Main dataset (1,520 sections)
│   ├── SAMPLE.json              # 3 example sections
│   └── INTENT_MAPPINGS.json     # Intent → section mappings
│
└── scripts/
    ├── retrieval.py             # Smart search system
    ├── openai_batch_parser.py   # How the AI enhancement was done
    └── create_ground_truth.py   # Data validation tools
```

---

## Important Notes

### ⚠️ Limitations

- **AI summaries are not legal advice** - For official legal representation, consult a lawyer
- **Summaries may oversimplify** - Complex legal concepts explained in plain language
- **Not all amendments captured** - Historical changes may be incomplete
- **English summaries** - Original laws are in Bengali (fully preserved)

### ✅ Data Quality

- 100% of sections have AI summaries
- 100% of sections have key terms
- ~40% of sections have amendment history
- ~35% of sections have cross-references
- All Bengali numerals preserved (০১২৩৪৫৬৭৮৯)

---

## License

[To be determined - Consult legal team regarding derivative works of government legal documents]

---

## Who Made This?

**BRAC Research Team**

Building tools to make legal information more accessible in Bangladesh.

---

## Questions or Feedback?

- 📧 **Contact:** [To be added]
- 💻 **Repository:** https://github.com/chitra-brac/family-law-data
- 🐛 **Issues:** https://github.com/chitra-brac/family-law-data/issues

---

**Want to help?** We're looking for:
- Legal experts to review AI summaries
- Developers to build applications using this data
- Translators to improve English summaries
- Researchers to add more acts

---

Made with ❤️ for accessible legal information in Bangladesh
