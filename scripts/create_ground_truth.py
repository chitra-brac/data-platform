#!/usr/bin/env python3
"""
Create ground truth dataset for LLM parser evaluation.

Selects diverse sections covering:
- Different amendment types
- Different external reference patterns
- Different section statuses
- Edge cases
"""

import json
from pathlib import Path
from typing import List, Dict

def select_diverse_sections(parsed_file: str = 'data/family/samples_test_dedup.json') -> List[Dict]:
    """Select 20-30 diverse sections for ground truth annotation."""

    with open(parsed_file, 'r', encoding='utf-8') as f:
        all_sections = json.load(f)

    selected = []

    # 1. Repealed section with amendment info (Section 5, Act 835)
    selected.append(next(s for s in all_sections if s['act_id'] == '835' and s['section_number'] == '৫'))

    # 2. Section with multiple amendments (Section 9, Act 835 - 14 amendments)
    selected.append(next(s for s in all_sections if s['act_id'] == '835' and s['section_number'] == '৯'))

    # 3. Section with external references (Section 2, Act 835 - refs to Act 11)
    selected.append(next(s for s in all_sections if s['act_id'] == '835' and s['section_number'] == '২'))

    # 4. Repealed section from Penal Code
    selected.append(next((s for s in all_sections if s['act_id'] == '11' and s['status'] == 'repealed'), None))

    # 5. Section with external refs from Penal Code (should reference Section 375)
    sec_375 = next((s for s in all_sections if s['act_id'] == '11' and '375' in s['section_number']), None)
    if sec_375:
        selected.append(sec_375)

    # 6. Simple section with no amendments (Act 1256)
    selected.append(next((s for s in all_sections if s['act_id'] == '1256' and not s['amendments']), None))

    # 7. Section with 1 amendment
    selected.append(next((s for s in all_sections if s['amendments'] and len(s['amendments']) == 1), None))

    # 8. Section with 'inserted' type amendment
    for s in all_sections:
        if s['amendments'] and any(a.get('type') == 'inserted' for a in s['amendments']):
            selected.append(s)
            break

    # 9. Section with 'replaced' type amendment
    for s in all_sections:
        if s['amendments'] and any(a.get('type') == 'replaced' for a in s['amendments']):
            selected.append(s)
            break

    # 10. Section from English act (Act 9 - old English)
    selected.append(next(s for s in all_sections if s['act_id'] == '9' and s['section_number'] == '১'))

    # 11. Section from recent Bengali act (Act 1207)
    selected.append(next((s for s in all_sections if s['act_id'] == '1207'), None))

    # 12. Section from Muslim Family Laws (Act 305) with multiple external refs
    selected.append(next((s for s in all_sections if s['act_id'] == '305' and s['external_references']), None))

    # 13-20: Random selection covering different acts
    remaining_acts = ['64', '180', '476', '1063']
    for act_id in remaining_acts:
        act_sections = [s for s in all_sections if s['act_id'] == act_id]
        if act_sections:
            selected.append(act_sections[0])  # First section
            if len(act_sections) > 5:
                selected.append(act_sections[len(act_sections)//2])  # Middle section

    # Filter out None values
    selected = [s for s in selected if s is not None]

    # Remove duplicates (keep first occurrence)
    seen_ids = set()
    unique_selected = []
    for s in selected:
        section_id = (s['act_id'], s['section_number'], s['section_title'])
        if section_id not in seen_ids:
            seen_ids.add(section_id)
            unique_selected.append(s)

    return unique_selected[:25]  # Cap at 25 sections


def create_ground_truth_template(sections: List[Dict]) -> List[Dict]:
    """Create ground truth template for manual annotation."""

    ground_truth = []

    for idx, section in enumerate(sections, 1):
        gt_entry = {
            "id": f"gt_{idx:03d}",
            "act_id": section['act_id'],
            "section_number": section['section_number'],
            "section_title": section['section_title'],
            "section_text": section['section_text'][:500] + "..." if len(section['section_text']) > 500 else section['section_text'],
            "full_section_text": section['section_text'],

            # Fields to manually verify/annotate
            "ground_truth": {
                "status": {
                    "value": section['status'],
                    "verified": False,  # User must verify
                    "notes": ""
                },
                "amendments": {
                    "count": len(section['amendments']),
                    "verified": False,
                    "amendments_list": [
                        {
                            "marker": a.get('marker'),
                            "type": a.get('type'),
                            "year": a.get('year'),
                            "full_text": a.get('full_text'),
                            "verified": False,
                            "corrections": {}
                        }
                        for a in section['amendments']
                    ],
                    "missing_amendments": [],  # User adds any missed
                    "notes": ""
                },
                "external_references": {
                    "count": len(section['external_references']),
                    "verified": False,
                    "references_list": [
                        {
                            "referenced_act_id": ref.get('referenced_act_id'),
                            "referenced_section": ref.get('referenced_section'),
                            "link_text": ref.get('link_text'),
                            "verified": False,
                            "corrections": {}
                        }
                        for ref in section['external_references']
                    ],
                    "missing_references": [],  # User adds any missed
                    "notes": ""
                },
                "overall_notes": ""
            },

            # Parser output for comparison
            "parser_output": {
                "status": section['status'],
                "amendments": section['amendments'],
                "external_references": section['external_references']
            }
        }

        ground_truth.append(gt_entry)

    return ground_truth


def main():
    """Create ground truth dataset."""

    print("="*80)
    print("CREATING GROUND TRUTH DATASET FOR LLM PARSER EVALUATION")
    print("="*80)

    # Select diverse sections
    print("\n1. Selecting diverse sections...")
    selected_sections = select_diverse_sections()
    print(f"   Selected {len(selected_sections)} sections")

    # Create ground truth template
    print("\n2. Creating ground truth template...")
    ground_truth = create_ground_truth_template(selected_sections)

    # Save
    output_file = Path('data/eval/ground_truth_template.json')
    output_file.parent.mkdir(parents=True, exist_ok=True)

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(ground_truth, f, ensure_ascii=False, indent=2)

    print(f"   ✅ Saved to: {output_file}")

    # Print summary
    print("\n" + "="*80)
    print("GROUND TRUTH DATASET SUMMARY")
    print("="*80)

    for entry in ground_truth:
        print(f"\n{entry['id']}: Act {entry['act_id']}, Section {entry['section_number']}")
        print(f"  Title: {entry['section_title'][:60]}...")
        print(f"  Status: {entry['ground_truth']['status']['value']}")
        print(f"  Amendments: {entry['ground_truth']['amendments']['count']}")
        print(f"  External refs: {entry['ground_truth']['external_references']['count']}")

    print("\n" + "="*80)
    print("NEXT STEPS")
    print("="*80)
    print("1. Open: data/eval/ground_truth_template.json")
    print("2. For each section, manually verify:")
    print("   - status (active/repealed/redacted)")
    print("   - amendments (correct type, year, text)")
    print("   - external_references (correct act_id, section)")
    print("3. Set 'verified: true' for each field after checking")
    print("4. Add any missing amendments/references to 'missing_*' arrays")
    print("5. Save as: data/eval/ground_truth_verified.json")
    print("="*80 + "\n")


if __name__ == '__main__':
    main()
