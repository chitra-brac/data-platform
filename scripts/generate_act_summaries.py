"""
Generate semantic summaries for each act based on its sections
Uses OpenAI to create concise, plain-language summaries of what each act covers
"""

import json
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def load_data():
    """Load the family laws data"""
    data_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'family_laws_final.json')
    with open(data_file, 'r', encoding='utf-8') as f:
        return json.load(f)

def group_by_act(sections):
    """Group sections by act"""
    acts = {}
    for section in sections:
        act_id = section['act_id']
        if act_id not in acts:
            acts[act_id] = {
                'id': act_id,
                'title': section['act_title'],
                'year': section['year'],
                'sections': []
            }
        acts[act_id]['sections'].append(section)
    return acts

def generate_act_summary(act_data):
    """Generate a summary for an entire act based on its sections"""
    # Get section summaries and titles
    section_info = []
    for s in act_data['sections'][:20]:  # Use first 20 sections to avoid token limits
        section_info.append(f"Section {s['section_number']}: {s['section_title']} - {s['semantic_summary']}")

    sections_text = "\n".join(section_info)

    prompt = f"""You are summarizing Bangladesh family law legislation for legal professionals and researchers.

Act Title: {act_data['title']}
Year: {act_data['year']}
Total Sections: {len(act_data['sections'])}

Here are summaries of the key sections in this act:

{sections_text}

Generate a concise 2-3 sentence plain-language summary of what this act covers overall. Focus on:
- The main purpose and scope of the act
- Key topics it addresses
- Who it applies to

Write in clear, accessible English suitable for both legal professionals and non-experts."""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a legal expert specializing in Bangladesh family law, creating clear summaries for researchers and practitioners."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=150
        )

        summary = response.choices[0].message.content.strip()
        return summary
    except Exception as e:
        print(f"Error generating summary for {act_data['title']}: {e}")
        return None

def main():
    print("Loading data...")
    sections = load_data()

    print("Grouping sections by act...")
    acts = group_by_act(sections)

    print(f"\nFound {len(acts)} acts\n")

    act_summaries = []

    for i, (act_id, act_data) in enumerate(sorted(acts.items()), 1):
        print(f"[{i}/{len(acts)}] Generating summary for: {act_data['title']}")

        summary = generate_act_summary(act_data)

        if summary:
            act_summaries.append({
                'act_id': act_id,
                'title': act_data['title'],
                'year': act_data['year'],
                'section_count': len(act_data['sections']),
                'summary': summary
            })
            print(f"  ✓ Generated: {summary[:80]}...")
        else:
            print(f"  ✗ Failed to generate summary")

        print()

    # Save to file
    output_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'act_summaries.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(act_summaries, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Saved {len(act_summaries)} act summaries to {output_file}")

    # Print summary
    print("\n" + "="*80)
    print("SAMPLE SUMMARIES:")
    print("="*80)
    for act in act_summaries[:5]:
        print(f"\n{act['title']} ({act['year']})")
        print(f"Sections: {act['section_count']}")
        print(f"Summary: {act['summary']}")

if __name__ == "__main__":
    main()
