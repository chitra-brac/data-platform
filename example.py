"""
Example: Using the Intent-Based Retrieval System

This demonstrates how to use the enhanced dataset with intelligent retrieval.
"""

import os
from scripts.retrieval import FamilyLawRetriever

# Set OpenAI API key (required for intent classification)
# Get your key from: https://platform.openai.com/api-keys
os.environ['OPENAI_API_KEY'] = 'your-api-key-here'  # Replace with your key


def main():
    print("=" * 80)
    print("Bangladesh Family Law - Intelligent Retrieval Demo")
    print("=" * 80)
    print()

    # Initialize retriever
    print("📚 Loading dataset...")
    retriever = FamilyLawRetriever(data_file="data/family_laws_final.json")
    print(f"✅ Loaded {len(retriever.sections)} law sections")
    print()

    # Example queries (both Bengali and English)
    test_queries = [
        ("আমি ধর্ষিত হয়েছি। আমি কি করতে পারি?", "bn"),
        ("My husband beats me. What can I do?", "en"),
        ("How do I get a divorce?", "en"),
        ("যৌতুক দাবি করছে। আমি কী করব?", "bn"),
    ]

    for query, lang in test_queries:
        print("=" * 80)
        print(f"🔍 Query: {query}")
        print(f"   Language: {lang}")
        print("=" * 80)
        print()

        # Get relevant sections
        results = retriever.deterministic_only(query, top_k=3)

        if results:
            print(f"✅ Found {len(results)} relevant sections")
            print(f"🎯 Detected Intent: {results[0]['intent']}")
            print()

            # Display each section
            for i, result in enumerate(results, 1):
                section_id = result['section_id']
                section = retriever.section_index.get(section_id)

                if section:
                    print(f"{i}. Act {section['act_id']} - Section {section['section_number']}")
                    print(f"   📖 {section['section_title']}")
                    print(f"   💡 {section['semantic_summary'][:150]}...")
                    print(f"   🔑 Key Terms: {', '.join(section['key_terms'][:5])}")
                    print(f"   ⚖️  Status: {section['status']}")
                    print(f"   📊 Relevance: {result['score']:.2f} ({result['relevance_type']})")
                    print()
        else:
            print("❌ No results found")
            print()

    print("=" * 80)
    print("✅ Demo Complete!")
    print()
    print("Next Steps:")
    print("- Read USAGE_GUIDE.md for detailed documentation")
    print("- Explore data/family_laws_final.json to see the full dataset")
    print("- Customize intent mappings in scripts/retrieval.py")
    print("=" * 80)


if __name__ == "__main__":
    # Check if API key is set
    if os.environ.get('OPENAI_API_KEY') == 'your-api-key-here':
        print("⚠️  Please set your OpenAI API key in example.py")
        print("   Get your key from: https://platform.openai.com/api-keys")
        print()
        print("   Then replace 'your-api-key-here' with your actual key")
        exit(1)

    main()
