# Family Law Data Showcase

Interactive web interface to explore, visualize, and contribute to the Bangladesh Family Law dataset.

## Features

- **Dashboard**: Visual statistics and overview of the entire dataset (61 acts, 1,520 sections)
- **Hierarchical Browse**: Acts → Sections → Details (intuitive navigation)
- **Smart Search**: Filter acts and sections by keywords
- **Rich Section Details**: View full text, summaries, amendments, and cross-references
- **Inline Feedback**: Integrated feedback form on each section for corrections and suggestions

## Quick Start

### 1. Start the API Server

```bash
# Install Python dependencies (if not already installed)
pip install fastapi uvicorn

# Start the API
cd api
python main.py
```

The API will run on `http://localhost:8000`

### 2. Start the Frontend

```bash
# Install Node dependencies
cd frontend
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:3000`

### 3. Open in Browser

Navigate to `http://localhost:3000` to explore the data!

## Usage

### 1. Dashboard
- View total statistics (1,520 sections from 61 acts)
- See data quality metrics (amendments, references)
- Explore intent categories (12 legal topics)
- Visual charts showing distribution and top acts

### 2. Browse Acts
- View all 61 family law acts sorted by year
- Search acts by title or year
- See section count for each act
- Click any act to view its sections

### 3. Browse Sections (within an act)
- View all sections for the selected act
- Search within sections by title, number, or summary
- See status badges (active, repealed, etc.)
- Preview key terms and metadata
- Click any section for full details

### 4. Section Details
- Full legal text in Bengali
- Plain-language English summary
- Key terms and concepts highlighted
- Complete amendment history with dates
- External references to other laws
- Detailed metadata (word count, character count, etc.)
- **Integrated feedback button** - submit corrections or suggestions directly

### 5. Feedback Collection
- Inline feedback form on every section
- Optional contact info (name, email)
- All feedback automatically tagged with section ID
- Saved to `data/feedback.json` for team review

## API Endpoints

The API provides several endpoints for accessing the data:

- `GET /` - API information
- `GET /stats` - Dataset statistics
- `GET /acts` - List of all acts
- `GET /sections` - Browse sections (with filters)
- `GET /section/{act_id}/{section_number}` - Specific section
- `GET /intents` - Intent categories
- `POST /feedback` - Submit feedback

Full API documentation available at `http://localhost:8000/docs`

## Technology Stack

**Backend:**
- FastAPI (Python web framework)
- JSON data storage

**Frontend:**
- React 18
- Tailwind CSS
- Recharts (for visualizations)
- Vite (build tool)

## For Presentations

This showcase is perfect for:
- Demonstrating dataset quality to stakeholders
- Getting feedback from legal professionals
- Sharing with non-technical audiences
- Collecting data improvement suggestions

## Data Structure

Each section includes:
- Original Bengali text
- English summary (AI-generated)
- Key legal terms
- Amendment history
- Cross-references
- Metadata (word count, status, etc.)

## Feedback Data

All feedback submissions are saved to `data/feedback.json` with:
- Timestamp
- Submitter info (optional)
- Message content
- Related section (optional)

Review feedback regularly to improve the dataset!

## Need Help?

- View API docs: `http://localhost:8000/docs`
- Main dataset: `data/family_laws_final.json`
- Intent mappings: `data/INTENT_MAPPINGS.json`
- See main `README.md` for dataset details

---

**Built by Chitra (Shojeb & Sajid)**
