"""Voice Manager - Manage character voice profiles"""

import json
from pathlib import Path
from typing import Dict, Optional, List
from character_system.models import VoiceConfig


class VoiceManager:
    """Manage voice profiles for characters"""
    
    def __init__(self, voices_dir: Optional[Path] = None):
        self.voices_dir = voices_dir or Path("voices")
        self.voices_dir.mkdir(parents=True, exist_ok=True)
        
        self.voice_profiles: Dict[str, VoiceConfig] = {}
        self._load_default_voices()
        self._load_saved_voices()
    
    def _load_default_voices(self):
        """Load default voice presets"""
        
        # Tulsi - Pet store dog (warm, playful, female)
        self.voice_profiles['tulsi'] = VoiceConfig(
            voice_name="Tulsi",
            gender="female",
            age="young_adult",
            accent="american",
            language="en",
            pitch="medium",
            speed="medium",
            energy="high",
            stability=0.5,
            similarity_boost=0.75,
            style=0.2,
            use_speaker_boost=True,
            sample_text="Hey there, pet parents! It's Tulsi, and I'm so excited to show you around the store today!"
        )
        
        # Professional spokesperson (neutral, calm, authoritative)
        self.voice_profiles['professional'] = VoiceConfig(
            voice_name="Professional",
            gender="neutral",
            age="adult",
            accent="american",
            language="en",
            pitch="medium",
            speed="medium",
            energy="medium",
            stability=0.7,
            similarity_boost=0.7,
            style=0.0,
            use_speaker_boost=True,
            sample_text="Welcome to our establishment. Let me share what makes us special."
        )
        
        # Friendly guide (upbeat, welcoming)
        self.voice_profiles['friendly_guide'] = VoiceConfig(
            voice_name="Friendly Guide",
            gender="female",
            age="young_adult",
            accent="american",
            language="en",
            pitch="medium-high",
            speed="medium",
            energy="high",
            stability=0.5,
            similarity_boost=0.8,
            style=0.3,
            use_speaker_boost=True,
            sample_text="Follow me! I'm going to show you all the cool stuff we have here!"
        )
        
        # Excited reviewer (enthusiastic, fast-paced)
        self.voice_profiles['excited_reviewer'] = VoiceConfig(
            voice_name="Excited Reviewer",
            gender="neutral",
            age="young_adult",
            accent="american",
            language="en",
            pitch="high",
            speed="fast",
            energy="high",
            stability=0.4,
            similarity_boost=0.75,
            style=0.4,
            use_speaker_boost=True,
            sample_text="Oh my gosh, you have to try this! I just tested it and it's AMAZING!"
        )
        
        # Calm educator (soothing, clear, patient)
        self.voice_profiles['calm_educator'] = VoiceConfig(
            voice_name="Calm Educator",
            gender="neutral",
            age="adult",
            accent="american",
            language="en",
            pitch="medium",
            speed="slow",
            energy="low",
            stability=0.7,
            similarity_boost=0.7,
            style=0.0,
            use_speaker_boost=True,
            sample_text="Let me explain how this works. It's actually quite simple when you break it down."
        )
        
        # Spanish bilingual (for Denver market)
        self.voice_profiles['bilingual_spanish'] = VoiceConfig(
            voice_name="Bilingual Guide",
            gender="female",
            age="adult",
            accent="neutral",
            language="es",
            secondary_languages=["en"],
            pitch="medium",
            speed="medium",
            energy="medium",
            stability=0.6,
            similarity_boost=0.75,
            style=0.1,
            use_speaker_boost=True,
            sample_text="¡Hola! Welcome to our store. Déjame mostrarte todo lo que tenemos."
        )
    
    def _load_saved_voices(self):
        """Load custom voice profiles from disk"""
        for voice_file in self.voices_dir.glob("*.json"):
            try:
                with open(voice_file, 'r') as f:
                    data = json.load(f)
                    voice = VoiceConfig(**data)
                    self.voice_profiles[voice_file.stem] = voice
            except Exception as e:
                print(f"Error loading voice profile {voice_file}: {e}")
    
    def get_voice(self, voice_key: str) -> Optional[VoiceConfig]:
        """Get voice configuration by key"""
        return self.voice_profiles.get(voice_key)
    
    def create_voice(
        self,
        voice_key: str,
        voice_config: VoiceConfig,
        save: bool = True
    ) -> VoiceConfig:
        """Create a new voice profile"""
        self.voice_profiles[voice_key] = voice_config
        
        if save:
            self.save_voice(voice_key)
        
        return voice_config
    
    def save_voice(self, voice_key: str):
        """Save voice profile to disk"""
        if voice_key not in self.voice_profiles:
            raise ValueError(f"Voice '{voice_key}' not found")
        
        voice = self.voice_profiles[voice_key]
        voice_file = self.voices_dir / f"{voice_key}.json"
        
        with open(voice_file, 'w') as f:
            json.dump(voice.model_dump(), f, indent=2)
    
    def list_voices(self) -> List[str]:
        """List all available voice profiles"""
        return list(self.voice_profiles.keys())
    
    def get_voice_for_character_type(self, character_type: str) -> VoiceConfig:
        """Get recommended voice for character type"""
        recommendations = {
            'mascot': 'friendly_guide',
            'spokesperson': 'professional',
            'product_reviewer': 'excited_reviewer',
            'tour_guide': 'friendly_guide',
            'educator': 'calm_educator',
        }
        
        voice_key = recommendations.get(character_type, 'friendly_guide')
        return self.voice_profiles.get(voice_key, self.voice_profiles['professional'])
    
    def clone_voice_profile(
        self,
        source_key: str,
        new_key: str,
        **overrides
    ) -> VoiceConfig:
        """Clone an existing voice profile with modifications"""
        if source_key not in self.voice_profiles:
            raise ValueError(f"Source voice '{source_key}' not found")
        
        source = self.voice_profiles[source_key]
        voice_data = source.model_dump()
        voice_data.update(overrides)
        
        new_voice = VoiceConfig(**voice_data)
        self.voice_profiles[new_key] = new_voice
        
        return new_voice
