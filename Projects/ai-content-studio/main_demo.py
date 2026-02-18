#!/usr/bin/env python3
"""
AI Content Studio - Complete Demo
Demonstrates the full content generation pipeline
"""

import sys
from pathlib import Path

# Add project to path
sys.path.insert(0, str(Path(__file__).parent))

from character_system import CharacterManager, CharacterType, ToneType
from script_engine import ScriptGenerator, ScriptValidator
from script_engine.models import ScriptGenerationRequest, ContentFormat
from voice_synthesis import VoiceSynthesizer, VoiceManager
from content_pipeline import ContentPipeline


def main():
    print("=" * 70)
    print("  AI CONTENT STUDIO - Complete Demo")
    print("  Character-Driven Content Generation for Local Businesses")
    print("=" * 70)
    print()
    
    # Initialize all systems
    print("🔧 Initializing systems...")
    char_manager = CharacterManager(storage_dir=Path("characters"))
    script_generator = ScriptGenerator()
    voice_manager = VoiceManager()
    voice_synthesizer = VoiceSynthesizer(output_dir=Path("output/audio"))
    
    pipeline = ContentPipeline(
        character_manager=char_manager,
        script_generator=script_generator,
        voice_synthesizer=voice_synthesizer,
        output_dir=Path("output")
    )
    
    print("✅ Systems initialized!\n")
    
    # Create Tulsi character if not exists
    print("🐕 Creating Tulsi character (pet store mascot)...")
    
    try:
        tulsi = char_manager.create_character(
            template_name="pet_store_mascot",
            character_name="Tulsi",
            business_name="Pawsitive Pets Denver",
            description="Tulsi is an energetic and friendly golden retriever who loves helping pet parents find the best products for their furry friends!",
            visual_description="Friendly golden retriever with bright red collar",
            business_location="Denver, CO",
            default_tone=ToneType.PLAYFUL,
            values=["pet wellness", "family-friendly", "quality"],
            quirks=["Always sniffs products first", "Gets excited about squeaky toys"],
            expertise=["dog nutrition", "pet toys", "grooming"],
            catchphrases=[
                "Hey pet parents!",
                "Paws up for this one!",
                "This gets four paws from me!",
                "Tail-waggingly good!"
            ],
        )
        print(f"✅ Tulsi created! (ID: {tulsi.profile.character_id})\n")
    except:
        # Character might already exist
        tulsi = char_manager.get_character("pawsitive-pets-denver-tulsi")
        print(f"✅ Tulsi loaded! (existing character)\n")
    
    # Display character info
    print(f"📋 Character Profile:")
    print(f"   Name: {tulsi.profile.name}")
    print(f"   Type: {tulsi.profile.character_type}")
    print(f"   Personality: {', '.join(tulsi.profile.personality.traits)}")
    print(f"   Voice: {tulsi.profile.voice.voice_name}")
    print(f"   Catchphrases: {len(tulsi.profile.speaking.catchphrases)}")
    print()
    
    # Generate sample content
    print("📝 Generating sample content...")
    print("-" * 70)
    
    # Example 1: Product Review
    print("\n🎬 Example 1: Product Review (30s Reel)")
    print("-" * 70)
    
    request1 = ScriptGenerationRequest(
        character_id=tulsi.profile.character_id,
        business_name="Pawsitive Pets Denver",
        business_type="pet_store",
        content_type="product_review",
        content_format=ContentFormat.REEL,
        product_name="ChewMaster Extreme Ball",
        product_description="Ultra-durable rubber ball with treat compartment",
        target_duration=30,
        include_humor=True,
    )
    
    result1 = pipeline.generate_content(
        character_id=tulsi.profile.character_id,
        request=request1,
        generate_audio=False,  # Set to True if you have ElevenLabs API key
        validate=True
    )
    
    script1 = result1['script']
    print(f"\n📝 Generated Script:")
    print(f"\nHOOK ({script1.hook.duration_seconds}s):")
    print(f"{script1.hook.content}")
    print(f"\nSTORY ({script1.story.duration_seconds}s):")
    print(f"{script1.story.content}")
    print(f"\nCTA ({script1.call_to_action.duration_seconds}s):")
    print(f"{script1.call_to_action.content}")
    
    if result1['validation']:
        val = result1['validation']
        score = val['engagement_score']
        print(f"\n📊 Quality Score: {score['total_score']}/100 (Grade: {score['grade']})")
        print(f"   {score['recommendation']}")
    
    print()
    
    # Example 2: Pet Care Tip
    print("\n🎬 Example 2: Pet Care Tip (20s Short)")
    print("-" * 70)
    
    request2 = ScriptGenerationRequest(
        character_id=tulsi.profile.character_id,
        business_name="Pawsitive Pets Denver",
        business_type="pet_store",
        content_type="educational",
        content_format=ContentFormat.SHORT,
        season_theme="winter",
        # Note: custom_instructions removed to use templates
        target_duration=20,
    )
    
    result2 = pipeline.generate_content(
        character_id=tulsi.profile.character_id,
        request=request2,
        generate_audio=False,
        validate=True
    )
    
    script2 = result2['script']
    print(f"\n📝 Generated Script:")
    print(f"\n{script2.hook.content}")
    print(f"\n{script2.story.content}")
    print(f"\n{script2.call_to_action.content}")
    
    if result2['validation']:
        score = result2['validation']['engagement_score']
        print(f"\n📊 Quality Score: {score['total_score']}/100 (Grade: {score['grade']})")
    
    print()
    
    # Create content package
    print("\n📦 Creating deliverable content package...")
    package_dir = pipeline.create_content_package(result1)
    print(f"✅ Package created: {package_dir}")
    
    # Summary
    print("\n" + "=" * 70)
    print("✅ DEMO COMPLETE!")
    print("=" * 70)
    print(f"\n📁 Output Locations:")
    print(f"   - Characters: {char_manager.storage_dir}/")
    print(f"   - Scripts: {pipeline.output_dir}/")
    print(f"   - Packages: {pipeline.output_dir}/packages/")
    
    print(f"\n🎭 Created Character: Tulsi")
    print(f"   - {len(char_manager.list_characters())} total characters")
    
    print(f"\n📝 Generated Content:")
    print(f"   - 2 sample scripts")
    print(f"   - Validation scores included")
    print(f"   - Ready for voice synthesis (add ElevenLabs API key)")
    
    print(f"\n🚀 Next Steps:")
    print(f"   1. Add API keys to .env file")
    print(f"   2. Run with generate_audio=True for voice synthesis")
    print(f"   3. Create more characters for different businesses")
    print(f"   4. Explore script templates in script_engine/templates.py")
    print(f"   5. Check business templates in business_templates/templates.json")
    
    print("\n" + "=" * 70)


if __name__ == "__main__":
    main()
