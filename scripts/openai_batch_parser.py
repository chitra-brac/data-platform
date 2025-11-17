#!/usr/bin/env python3
"""
OpenAI Batch API Parser for Bangladesh Family Laws

Uses OpenAI Batch API for cost-effective, high-quality structured extraction.
- 50% cheaper than standard API
- No rate limiting
- Processes within 24 hours
"""

import json
import os
import time
from pathlib import Path
from typing import Dict, List
from openai import OpenAI
import logging
from dotenv import load_dotenv

from comprehensive_parser import ComprehensiveBDLawsParser

# Load env
if not load_dotenv('.env'):
    load_dotenv('api/.env')

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

# Configuration
MODEL = "gpt-4o-mini"  # Best balance of cost/quality for batch API
BATCH_FILE = "data/batch_requests.jsonl"
RESULTS_FILE = "data/batch_results.jsonl"


class OpenAIBatchParser:
    """Parser using OpenAI Batch API for structured extraction."""

    def __init__(self, html_dir: str = 'data/html'):
        self.html_parser = ComprehensiveBDLawsParser(html_dir=html_dir)

        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable not set")

        self.client = OpenAI(api_key=api_key)
        self.section_metadata = {}  # Maps custom_id to section data

    def build_llm_prompt(self, section: Dict) -> str:
        """Build the LLM prompt for a section (same as tested parser)."""

        section_text = section['section_text']
        section_number = section['section_number']
        section_title = section.get('section_title', '')

        # Include pre-extracted amendments from HTML footnotes
        regex_amendments = section.get('amendments', [])
        amendments_section = ""
        if regex_amendments:
            amendments_section = "\n\nAMENDMENT FOOTNOTES (extracted from HTML):\n"
            for i, amend in enumerate(regex_amendments, 1):
                amendments_section += f"{i}. {amend.get('full_text', '')}\n"

        prompt = f"""You are a legal text parser for Bangladesh law. Extract structured information from this legal section.

SECTION NUMBER: {section_number}
SECTION TITLE: {section_title}
SECTION TEXT:
{section_text}{amendments_section}

TASK: Extract the following information as JSON:

1. **status**: Determine if section is:
   - "active": Currently in force
   - "repealed": Explicitly repealed/রহিত
   - "omitted": Omitted/বাদ/লোপ
   - "redacted": Contains [***] redactions

2. **amendments**: Parse the "AMENDMENT FOOTNOTES" section if provided. For each amendment extract:
   - type: "replaced"/"inserted"/"repealed"/"omitted"/"substituted"/"amended" (classify based on text)
   - year: Year of amendment (convert Bengali ০১২৩৪৫৬৭৮৯ to English)
   - amending_act_year: Year of the amending act
   - amending_act_number: Number/Roman numeral of the amending act (e.g., "VIII", "XLIV", "26")
   - amending_section: Section number that made the amendment
   - full_text: Complete amendment text

3. **external_references**: List all references to other acts. For each:
   - referenced_act_id: Act number (e.g., "11" for Penal Code)
   - referenced_sections: List of section numbers mentioned
   - context: Surrounding text explaining the reference

4. **semantic_summary**: Brief summary of what this section does (1-2 sentences)

5. **key_terms**: Important legal terms defined or used

IMPORTANT:
- Look for Bengali markers: "প্রতিস্থাপিত" (replaced), "সন্নিবেশিত" (inserted), "রহিত" (repealed), "বিলুপ্ত/লোপ" (omitted), "substituted"
- Convert Bengali numerals to English: ০১২৩৪৫৬৭৮৯ → 0123456789
- Extract act numbers like "Act No. VIII of 1973" → amending_act_year: "1973", amending_act_number: "VIII"
- Extract act numbers like "Ordinance No. XLIV of 1984" → amending_act_year: "1984", amending_act_number: "XLIV"
- Extract section numbers from "by section 3" → amending_section: "3"
- If no data for a field, use null (not empty string)

Respond ONLY with valid JSON matching this schema:
{{
  "status": "active|repealed|omitted|redacted",
  "amendments": [
    {{
      "type": "omitted",
      "year": "1973",
      "amending_act_year": "1973",
      "amending_act_number": "VIII",
      "amending_section": "3",
      "full_text": "The word \\"Bengal\\" was omitted by section 3 and the Second Schedule of the Bangladesh Laws (Revision and Declaration) Act, 1973 (Act No. VIII of 1973)"
    }}
  ],
  "external_references": [
    {{
      "referenced_act_id": "11",
      "referenced_sections": ["375", "376"],
      "context": "..."
    }}
  ],
  "semantic_summary": "This section defines...",
  "key_terms": ["rape", "punishment", "imprisonment"]
}}

JSON:"""
        return prompt

    def prepare_batch_requests(self, html_dir: str) -> Dict:
        """Parse HTML files and prepare batch API requests."""

        html_files = list(Path(html_dir).glob('**/*.html'))

        if not html_files:
            logger.warning(f"No HTML files found in {html_dir}")
            return {'tasks': [], 'sections': []}

        tasks = []
        all_sections = []

        logger.info(f"📝 Preparing batch requests from {len(html_files)} acts...")

        for idx, html_file in enumerate(html_files, 1):
            try:
                logger.info(f"[{idx}/{len(html_files)}] Parsing {html_file.name}...")

                result = self.html_parser.parse_html_file(html_file)
                sections = result['sections']
                act_metadata = result['act_metadata']

                for section_idx, section in enumerate(sections):
                    # Create unique custom_id (include index to handle duplicate section numbers)
                    custom_id = f"{act_metadata['act_id']}_sec{section_idx}_{section['section_number']}"

                    # Build prompt
                    prompt = self.build_llm_prompt(section)

                    # Create batch task
                    task = {
                        "custom_id": custom_id,
                        "method": "POST",
                        "url": "/v1/chat/completions",
                        "body": {
                            "model": MODEL,
                            "temperature": 0,
                            "max_tokens": 2000,
                            "response_format": {
                                "type": "json_object"
                            },
                            "messages": [
                                {
                                    "role": "user",
                                    "content": prompt
                                }
                            ]
                        }
                    }

                    tasks.append(task)
                    all_sections.append(section)

                    # Store metadata for later matching
                    self.section_metadata[custom_id] = {
                        'section': section,
                        'act_metadata': act_metadata
                    }

            except Exception as e:
                logger.error(f"❌ Error parsing {html_file.name}: {str(e)}")
                continue

        logger.info(f"✅ Prepared {len(tasks)} batch requests from {len(html_files)} acts")

        return {
            'tasks': tasks,
            'sections': all_sections,
            'total_acts': len(html_files)
        }

    def create_batch_file(self, tasks: List[Dict], output_file: str = BATCH_FILE) -> str:
        """Write tasks to JSONL file."""

        logger.info(f"📄 Writing {len(tasks)} tasks to {output_file}...")

        with open(output_file, 'w', encoding='utf-8') as f:
            for task in tasks:
                f.write(json.dumps(task, ensure_ascii=False) + '\n')

        logger.info(f"✅ Batch file created: {output_file}")
        return output_file

    def upload_and_submit_batch(self, batch_file: str) -> str:
        """Upload batch file and submit batch job."""

        logger.info(f"⬆️  Uploading batch file to OpenAI...")

        # Upload file
        with open(batch_file, 'rb') as f:
            uploaded_file = self.client.files.create(
                file=f,
                purpose="batch"
            )

        logger.info(f"✅ File uploaded: {uploaded_file.id}")

        # Create batch job
        logger.info(f"🚀 Creating batch job...")

        batch_job = self.client.batches.create(
            input_file_id=uploaded_file.id,
            endpoint="/v1/chat/completions",
            completion_window="24h"
        )

        logger.info(f"✅ Batch job created: {batch_job.id}")
        logger.info(f"   Status: {batch_job.status}")
        logger.info(f"   Total requests: {batch_job.request_counts.total}")

        return batch_job.id

    def check_batch_status(self, batch_id: str) -> Dict:
        """Check batch job status."""

        batch_job = self.client.batches.retrieve(batch_id)

        status_info = {
            'id': batch_job.id,
            'status': batch_job.status,
            'created_at': batch_job.created_at,
            'request_counts': {
                'total': batch_job.request_counts.total,
                'completed': batch_job.request_counts.completed,
                'failed': batch_job.request_counts.failed
            }
        }

        if batch_job.status == 'completed':
            status_info['output_file_id'] = batch_job.output_file_id
            if batch_job.error_file_id:
                status_info['error_file_id'] = batch_job.error_file_id

        return status_info

    def wait_for_completion(self, batch_id: str, poll_interval: int = 60) -> Dict:
        """Wait for batch to complete, polling status."""

        logger.info(f"⏳ Waiting for batch {batch_id} to complete...")
        logger.info(f"   Polling every {poll_interval} seconds...")

        while True:
            status = self.check_batch_status(batch_id)

            logger.info(f"   Status: {status['status']}")
            logger.info(f"   Progress: {status['request_counts']['completed']}/{status['request_counts']['total']}")

            if status['status'] == 'completed':
                logger.info(f"✅ Batch completed!")
                return status

            elif status['status'] == 'failed':
                logger.error(f"❌ Batch failed!")
                return status

            elif status['status'] in ['cancelled', 'expired']:
                logger.warning(f"⚠️  Batch {status['status']}")
                return status

            # Still processing
            time.sleep(poll_interval)

    def download_results(self, output_file_id: str, save_path: str = RESULTS_FILE) -> str:
        """Download batch results."""

        logger.info(f"⬇️  Downloading results from {output_file_id}...")

        result_content = self.client.files.content(output_file_id).content

        with open(save_path, 'wb') as f:
            f.write(result_content)

        logger.info(f"✅ Results saved to {save_path}")
        return save_path

    def parse_results(self, results_file: str) -> Dict:
        """Parse batch results and merge with section data."""

        logger.info(f"📊 Parsing results from {results_file}...")

        results = []
        errors = []

        with open(results_file, 'r', encoding='utf-8') as f:
            for line in f:
                result = json.loads(line.strip())

                if result.get('error'):
                    errors.append(result)
                else:
                    results.append(result)

        logger.info(f"   Successful: {len(results)}")
        logger.info(f"   Errors: {len(errors)}")

        # Merge results with section data
        enhanced_sections = []

        for result in results:
            custom_id = result['custom_id']

            if custom_id not in self.section_metadata:
                logger.warning(f"⚠️  Unknown custom_id: {custom_id}")
                continue

            metadata = self.section_metadata[custom_id]
            section = metadata['section'].copy()

            # Extract LLM response
            try:
                response = result['response']['body']['choices'][0]['message']['content']
                llm_data = json.loads(response)

                # Merge LLM data into section
                section['status'] = llm_data.get('status', section.get('status', 'active'))
                section['semantic_summary'] = llm_data.get('semantic_summary', '')
                section['key_terms'] = llm_data.get('key_terms', [])

                # Replace amendments with LLM-extracted ones if available
                if llm_data.get('amendments'):
                    section['amendments'] = llm_data['amendments']
                    section['amendments_source'] = 'llm'
                else:
                    section['amendments_source'] = 'regex'

                # Replace external references with LLM-extracted ones if available
                if llm_data.get('external_references'):
                    section['external_references'] = llm_data['external_references']
                    section['references_source'] = 'llm'
                else:
                    section['references_source'] = 'regex'

                enhanced_sections.append(section)

            except Exception as e:
                logger.error(f"❌ Error parsing result for {custom_id}: {e}")
                errors.append({'custom_id': custom_id, 'error': str(e)})

        return {
            'sections': enhanced_sections,
            'errors': errors,
            'total_processed': len(results),
            'total_errors': len(errors)
        }

    def run_batch_processing(self, html_dir: str, output_file: str, wait: bool = True) -> Dict:
        """Complete batch processing workflow."""

        logger.info(f"\n{'='*80}")
        logger.info(f"OPENAI BATCH API PROCESSING")
        logger.info(f"{'='*80}\n")

        # Step 1: Prepare requests
        prep_result = self.prepare_batch_requests(html_dir)

        if not prep_result['tasks']:
            logger.error("No tasks to process!")
            return {}

        # Step 2: Create batch file
        batch_file = self.create_batch_file(prep_result['tasks'])

        # Step 3: Upload and submit
        batch_id = self.upload_and_submit_batch(batch_file)

        # Save batch ID for resuming
        with open('data/batch_job_id.txt', 'w') as f:
            f.write(batch_id)

        logger.info(f"\n💡 Batch ID saved to data/batch_job_id.txt")
        logger.info(f"   You can check status anytime with:")
        logger.info(f"   python scripts/openai_batch_parser.py --check-status {batch_id}\n")

        if not wait:
            logger.info(f"⏸️  Not waiting for completion (--no-wait specified)")
            return {'batch_id': batch_id}

        # Step 4: Wait for completion
        status = self.wait_for_completion(batch_id)

        if status['status'] != 'completed':
            logger.error(f"❌ Batch did not complete successfully")
            return status

        # Step 5: Download results
        results_file = self.download_results(status['output_file_id'])

        # Step 6: Parse and merge results
        parsed = self.parse_results(results_file)

        # Step 7: Save final output
        logger.info(f"\n💾 Saving final output to {output_file}...")
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(parsed['sections'], f, ensure_ascii=False, indent=2)

        logger.info(f"✅ Processing complete!")
        logger.info(f"\n{'='*80}")
        logger.info(f"FINAL STATS")
        logger.info(f"{'='*80}")
        logger.info(f"Total sections: {len(parsed['sections'])}")
        logger.info(f"Successful: {parsed['total_processed']}")
        logger.info(f"Errors: {parsed['total_errors']}")
        logger.info(f"Output file: {output_file}")
        logger.info(f"{'='*80}\n")

        return parsed


def main():
    import argparse

    parser = argparse.ArgumentParser(description="OpenAI Batch API Parser")
    parser.add_argument('--input', type=str, default='data/html/family_laws',
                       help='Input directory with HTML files')
    parser.add_argument('--output', type=str, default='data/family_laws_openai_batch.json',
                       help='Output JSON file')
    parser.add_argument('--no-wait', action='store_true',
                       help='Submit batch and exit without waiting')
    parser.add_argument('--check-status', type=str,
                       help='Check status of existing batch job')
    parser.add_argument('--download-results', type=str,
                       help='Download results from completed batch job')

    args = parser.parse_args()

    batch_parser = OpenAIBatchParser(html_dir=args.input)

    # Check status of existing batch
    if args.check_status:
        status = batch_parser.check_batch_status(args.check_status)
        print(json.dumps(status, indent=2))

        if status['status'] == 'completed':
            print(f"\n✅ Batch completed! Download results with:")
            print(f"   python scripts/openai_batch_parser.py --download-results {args.check_status}")
        return

    # Download results from completed batch
    if args.download_results:
        status = batch_parser.check_batch_status(args.download_results)

        if status['status'] != 'completed':
            print(f"❌ Batch not completed yet. Status: {status['status']}")
            return

        # Re-parse HTML files to rebuild section_metadata
        logger.info(f"📝 Re-parsing HTML files to match results...")
        batch_parser.prepare_batch_requests(args.input)

        results_file = batch_parser.download_results(status['output_file_id'])
        parsed = batch_parser.parse_results(results_file)

        # Save output
        with open(args.output, 'w', encoding='utf-8') as f:
            json.dump(parsed['sections'], f, ensure_ascii=False, indent=2)

        print(f"✅ Results saved to {args.output}")
        print(f"   Total sections: {len(parsed['sections'])}")
        print(f"   Errors: {parsed['total_errors']}")
        return

    # Run full batch processing
    batch_parser.run_batch_processing(
        html_dir=args.input,
        output_file=args.output,
        wait=not args.no_wait
    )


if __name__ == '__main__':
    main()
