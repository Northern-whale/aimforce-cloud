"""Character Builder - Factory for creating character profiles"""

import json
from pathlib import Path
from typing import Dict, Optional
from .models import (
    Character,
    CharacterProfile,
    CharacterType,
    ToneType,
    VoiceConfig,
    PersonalityTraits,
    SpeakingPatterns,
)


class CharacterBuilder:
    """Build character profiles from templates or custom specs"""
    
    def __init__(self):
        self.templates = self._load_templates()
    
    def _load_templates(self) -> Dict:
        """Load character templates"""
        # Default templates - can be loaded from JSON
        return {
            "pet_store_mascot": {
                "character_type": CharacterType.MASCOT,
                "business_type": "pet_store",
                "personality_archetype": "friendly_helper",
                "traits": ["enthusiastic", "knowledgeable", "playful", "caring"],
                "voice_preset": "warm_female",
            },
            "restaurant_critic": {
                "character_type": CharacterType.PRODUCT_REVIEWER,
                "business_type": "restaurant",
                "personality_archetype": "foodie_expert",
                "traits": ["passionate", "descriptive", "honest", "fun"],
                "voice_preset": "friendly_neutral",
            },
            "retail_guide": {
                "character_type": CharacterType.TOUR_GUIDE,
                "business_type": "retail",
                "personality_archetype": "helpful_friend",
                "traits": ["approachable", "knowledgeable", "trendy", "encouraging"],
                "voice_preset": "upbeat_female",
            },
        }
    
    def create_from_template(
        self,
        template_name: str,
        character_name: str,
        business_name: str,
        **overrides
    ) -> CharacterProfile:
        """Create character from template"""
        if template_name not in self.templates:
            raise ValueError(f"Template '{template_name}' not found")
        
        template = self.templates[template_name]
        
        # Build voice config
        voice = self._create_voice_config(
            character_name,
            template.get("voice_preset", "neutral"),
            overrides.get("voice_overrides", {})
        )
        
        # Build personality
        personality = PersonalityTraits(
            archetype=template["personality_archetype"],
            traits=overrides.get("traits", template["traits"]),
            values=overrides.get("values", []),
            quirks=overrides.get("quirks", []),
            expertise=overrides.get("expertise", [])
        )
        
        # Build speaking patterns
        speaking = self._create_speaking_patterns(
            character_name,
            template["character_type"],
            overrides.get("speaking_overrides", {})
        )
        
        # Create profile
        profile = CharacterProfile(
            character_id=f"{business_name.lower().replace(' ', '-')}-{character_name.lower().replace(' ', '-')}",
            name=character_name,
            character_type=template["character_type"],
            business_type=template["business_type"],
            description=overrides.get("description", f"{character_name} is your friendly {template['business_type']} guide!"),
            visual_description=overrides.get("visual_description", ""),
            voice=voice,
            personality=personality,
            speaking=speaking,
            business_name=business_name,
            business_location=overrides.get("business_location"),
            default_tone=overrides.get("default_tone", ToneType.PLAYFUL),
        )
        
        return profile
    
    def create_custom(
        self,
        character_id: str,
        name: str,
        character_type: CharacterType,
        business_type: str,
        description: str,
        voice_config: Dict,
        personality_config: Dict,
        speaking_config: Dict,
        **kwargs
    ) -> CharacterProfile:
        """Create fully custom character"""
        
        voice = VoiceConfig(**voice_config)
        personality = PersonalityTraits(**personality_config)
        speaking = SpeakingPatterns(**speaking_config)
        
        profile = CharacterProfile(
            character_id=character_id,
            name=name,
            character_type=character_type,
            business_type=business_type,
            description=description,
            voice=voice,
            personality=personality,
            speaking=speaking,
            **kwargs
        )
        
        return profile
    
    def _create_voice_config(
        self,
        character_name: str,
        preset: str,
        overrides: Dict
    ) -> VoiceConfig:
        """Create voice configuration from preset"""
        presets = {
            "warm_female": {
                "voice_name": f"{character_name} Voice",
                "gender": "female",
                "age": "adult",
                "accent": "american",
                "pitch": "medium",
                "energy": "high",
                "stability": 0.5,
                "similarity_boost": 0.75,
            },
            "friendly_neutral": {
                "voice_name": f"{character_name} Voice",
                "gender": "neutral",
                "age": "young_adult",
                "accent": "american",
                "pitch": "medium",
                "energy": "medium",
                "stability": 0.6,
                "similarity_boost": 0.7,
            },
            "upbeat_female": {
                "voice_name": f"{character_name} Voice",
                "gender": "female",
                "age": "young_adult",
                "accent": "american",
                "pitch": "high",
                "energy": "high",
                "stability": 0.4,
                "similarity_boost": 0.8,
            },
            "professional_male": {
                "voice_name": f"{character_name} Voice",
                "gender": "male",
                "age": "adult",
                "accent": "american",
                "pitch": "medium",
                "energy": "medium",
                "stability": 0.7,
                "similarity_boost": 0.75,
            },
        }
        
        config = presets.get(preset, presets["friendly_neutral"])
        config.update(overrides)
        
        return VoiceConfig(**config)
    
    def _create_speaking_patterns(
        self,
        character_name: str,
        character_type: CharacterType,
        overrides: Dict
    ) -> SpeakingPatterns:
        """Create speaking patterns based on character type"""
        patterns = {
            CharacterType.MASCOT: {
                "catchphrases": [
                    f"It's {character_name} here!",
                    "Let me show you something cool!",
                    "You're gonna love this!",
                ],
                "greeting_style": f"Hey friends! It's your pal {character_name}!",
                "sign_off": "Until next time, stay awesome!",
                "uses_emojis_in_script": True,
                "emphasis_style": "enthusiastic",
            },
            CharacterType.PRODUCT_REVIEWER: {
                "catchphrases": [
                    "Let's take a closer look!",
                    "Here's what I think...",
                    "You won't believe this!",
                ],
                "greeting_style": "Hey everyone!",
                "sign_off": "Thanks for watching!",
                "uses_emojis_in_script": True,
                "emphasis_style": "analytical",
            },
            CharacterType.TOUR_GUIDE: {
                "catchphrases": [
                    "Follow me!",
                    "Check this out!",
                    "Let me show you around!",
                ],
                "greeting_style": "Welcome! Let's explore together!",
                "sign_off": "See you on the next tour!",
                "uses_emojis_in_script": True,
                "emphasis_style": "friendly",
            },
        }
        
        base = patterns.get(character_type, patterns[CharacterType.MASCOT])
        base.update(overrides)
        
        return SpeakingPatterns(**base)
    
    def save_profile(self, profile: CharacterProfile, output_dir: Path):
        """Save character profile to JSON"""
        output_dir.mkdir(parents=True, exist_ok=True)
        output_file = output_dir / f"{profile.character_id}.json"
        
        with open(output_file, 'w') as f:
            json.dump(profile.model_dump(), f, indent=2, default=str)
        
        return output_file
    
    def load_profile(self, profile_path: Path) -> CharacterProfile:
        """Load character profile from JSON"""
        with open(profile_path, 'r') as f:
            data = json.load(f)
        
        return CharacterProfile(**data)
