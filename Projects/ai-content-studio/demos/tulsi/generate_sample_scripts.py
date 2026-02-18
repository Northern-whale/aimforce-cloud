"""Generate Sample Scripts for Tulsi"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from character_system import CharacterManager
from script_engine import ScriptGenerator, ScriptValidator
from script_engine.models import ScriptGenerationRequest, ContentFormat


def generate_tulsi_scripts():
    """Generate 5 sample scripts for Tulsi"""
    
    # Initialize systems
    char_manager = CharacterManager(storage_dir=Path(__file__).parent / "characters")
    script_gen = ScriptGenerator()  # Will work even without API key using templates
    validator = ScriptValidator()
    
    # Get Tulsi character
    tulsi = char_manager.get_character("pawsitive-pets-denver-tulsi")
    if not tulsi:
        print("❌ Tulsi character not found. Run create_tulsi.py first!")
        return
    
    print(f"🐕 Generating scripts for {tulsi.profile.name}...")
    print(f"{'='*60}\n")
    
    # Define 5 sample content scenarios
    scenarios = [
        {
            "name": "New Toy Review",
            "request": ScriptGenerationRequest(
                character_id=tulsi.profile.character_id,
                business_name="Pawsitive Pets Denver",
                business_type="pet_store",
                content_type="product_review",
                content_format=ContentFormat.REEL,
                product_name="ChewMaster Extreme Ball",
                product_description="An ultra-durable rubber ball with bounce action and treat compartment",
                target_duration=30,
                include_humor=True,
            )
        },
        {
            "name": "Store Tour",
            "request": ScriptGenerationRequest(
                character_id=tulsi.profile.character_id,
                business_name="Pawsitive Pets Denver",
                business_type="pet_store",
                content_type="day_in_life",
                content_format=ContentFormat.REEL,
                location="Denver, CO",
                custom_instructions="Show three main sections: toy aisle, treat station, grooming area",
                target_duration=45,
            )
        },
        {
            "name": "Pet Care Tip: Winter Paw Care",
            "request": ScriptGenerationRequest(
                character_id=tulsi.profile.character_id,
                business_name="Pawsitive Pets Denver",
                business_type="pet_store",
                content_type="educational",
                content_format=ContentFormat.SHORT,
                season_theme="winter",
                custom_instructions="Teach about protecting dog paws in cold weather",
                target_duration=20,
            )
        },
        {
            "name": "Customer Pet Spotlight",
            "request": ScriptGenerationRequest(
                character_id=tulsi.profile.character_id,
                business_name="Pawsitive Pets Denver",
                business_type="pet_store",
                content_type="showcase",
                content_format=ContentFormat.REEL,
                custom_instructions="Feature a customer's adorable puppy who just bought their first collar",
                target_duration=25,
            )
        },
        {
            "name": "Holiday Special: Valentine's Day",
            "request": ScriptGenerationRequest(
                character_id=tulsi.profile.character_id,
                business_name="Pawsitive Pets Denver",
                business_type="pet_store",
                content_type="seasonal",
                content_format=ContentFormat.REEL,
                season_theme="Valentine's Day",
                special_occasion="Valentine's Day Pet Photo Event",
                custom_instructions="Promote Valentine's themed pet treats and photo booth event",
                target_duration=30,
            )
        },
    ]
    
    scripts = []
    
    for i, scenario in enumerate(scenarios, 1):
        print(f"Script {i}: {scenario['name']}")
        print(f"{'-'*60}")
        
        try:
            script = script_gen.generate_script(tulsi, scenario['request'])
            
            # Validate
            is_valid, issues = validator.validate(script)
            score = validator.score_engagement_potential(script)
            
            # Print script
            print(f"\n📝 SCRIPT:")
            print(f"\nHOOK ({script.hook.duration_seconds}s):")
            print(f"{script.hook.content}\n")
            print(f"STORY ({script.story.duration_seconds}s):")
            print(f"{script.story.content}\n")
            print(f"CALL TO ACTION ({script.call_to_action.duration_seconds}s):")
            print(f"{script.call_to_action.content}\n")
            
            # Print validation
            print(f"📊 VALIDATION:")
            print(f"   Valid: {'✅ Yes' if is_valid else '❌ No'}")
            print(f"   Score: {score['total_score']}/100 (Grade: {score['grade']})")
            print(f"   Recommendation: {score['recommendation']}")
            
            if issues:
                print(f"   Issues:")
                for issue in issues:
                    print(f"      - {issue}")
            
            scripts.append({
                'name': scenario['name'],
                'script': script,
                'validation': {'is_valid': is_valid, 'score': score, 'issues': issues}
            })
            
            # Save script
            output_dir = Path(__file__).parent / "scripts"
            output_dir.mkdir(exist_ok=True)
            
            script_file = output_dir / f"script_{i}_{scenario['name'].lower().replace(' ', '_')}.txt"
            with open(script_file, 'w') as f:
                f.write(f"{scenario['name']}\n")
                f.write(f"{'='*60}\n\n")
                f.write(f"HOOK ({script.hook.duration_seconds}s):\n{script.hook.content}\n\n")
                f.write(f"STORY ({script.story.duration_seconds}s):\n{script.story.content}\n\n")
                f.write(f"CTA ({script.call_to_action.duration_seconds}s):\n{script.call_to_action.content}\n\n")
                f.write(f"---\n")
                f.write(f"Score: {score['total_score']}/100 ({score['grade']})\n")
                f.write(f"Duration: {script.total_duration_seconds}s | Words: {script.word_count}\n")
            
            print(f"💾 Saved to: {script_file}")
            
        except Exception as e:
            print(f"❌ Error generating script: {e}")
            import traceback
            traceback.print_exc()
        
        print(f"\n{'='*60}\n")
    
    print(f"✅ Generated {len(scripts)} scripts for Tulsi!")
    return scripts


if __name__ == "__main__":
    generate_tulsi_scripts()
