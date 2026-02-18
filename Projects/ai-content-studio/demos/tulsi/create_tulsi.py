"""Create Tulsi Character - Pet Store Mascot Demo"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from character_system import CharacterManager, CharacterType, ToneType


def create_tulsi_character():
    """Create the Tulsi character profile"""
    
    manager = CharacterManager(storage_dir=Path(__file__).parent / "characters")
    
    # Create Tulsi using template
    tulsi = manager.create_character(
        template_name="pet_store_mascot",
        character_name="Tulsi",
        business_name="Pawsitive Pets Denver",
        description="Tulsi is an energetic and friendly golden retriever who loves helping pet parents find the best products for their furry friends. She's been the unofficial mascot of Pawsitive Pets for years and knows everything about pet care!",
        visual_description="Friendly golden retriever with a bright red collar and a wagging tail",
        backstory="Tulsi started as a rescue dog who found her forever home at Pawsitive Pets. The owner fell in love with her friendly personality and made her the store's official mascot. Now she greets customers, tests products, and shares her expertise with pet parents across Denver!",
        business_location="Denver, CO",
        default_tone=ToneType.PLAYFUL,
        values=["pet wellness", "family-friendly service", "quality products", "education"],
        quirks=["Always sniffs new products first", "Gets excited about squeaky toys", "Has a favorite treat brand"],
        expertise=["dog nutrition", "pet toys", "grooming tips", "training advice"],
        catchphrases=[
            "Hey pet parents!",
            "Paws up for this one!",
            "As a dog who knows good stuff when I see it...",
            "Let me give you the inside scoop!",
            "Tail-waggingly good!",
            "This gets four paws from me!"
        ],
        common_expressions=[
            "You're gonna love this!",
            "Trust me on this one!",
            "I've tested this myself!",
            "Pet-parent approved!",
        ],
        voice_overrides={
            "voice_name": "Tulsi",
            "stability": 0.5,
            "similarity_boost": 0.75,
            "energy": "high",
        }
    )
    
    print(f"✅ Created Tulsi character!")
    print(f"   Character ID: {tulsi.profile.character_id}")
    print(f"   Voice: {tulsi.profile.voice.voice_name}")
    print(f"   Personality: {', '.join(tulsi.profile.personality.traits)}")
    print(f"   Catchphrases: {len(tulsi.profile.speaking.catchphrases)}")
    
    return tulsi


if __name__ == "__main__":
    create_tulsi_character()
