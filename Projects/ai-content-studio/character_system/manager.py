"""Character Manager - Runtime management of characters"""

from pathlib import Path
from typing import Dict, List, Optional
import json
from datetime import datetime

from .models import Character, CharacterProfile
from .builder import CharacterBuilder


class CharacterManager:
    """Manage character instances and profiles"""
    
    def __init__(self, storage_dir: Optional[Path] = None):
        self.storage_dir = storage_dir or Path("characters")
        self.storage_dir.mkdir(parents=True, exist_ok=True)
        
        self.builder = CharacterBuilder()
        self.active_characters: Dict[str, Character] = {}
        self.profiles: Dict[str, CharacterProfile] = {}
        
        self._load_all_profiles()
    
    def _load_all_profiles(self):
        """Load all saved character profiles"""
        for profile_file in self.storage_dir.glob("*.json"):
            try:
                profile = self.builder.load_profile(profile_file)
                self.profiles[profile.character_id] = profile
            except Exception as e:
                print(f"Error loading profile {profile_file}: {e}")
    
    def create_character(
        self,
        template_name: str,
        character_name: str,
        business_name: str,
        **kwargs
    ) -> Character:
        """Create and register a new character"""
        profile = self.builder.create_from_template(
            template_name,
            character_name,
            business_name,
            **kwargs
        )
        
        # Save profile
        self.builder.save_profile(profile, self.storage_dir)
        self.profiles[profile.character_id] = profile
        
        # Create character instance
        character = Character(profile=profile)
        self.active_characters[profile.character_id] = character
        
        return character
    
    def get_character(self, character_id: str) -> Optional[Character]:
        """Get active character or load from profile"""
        if character_id in self.active_characters:
            return self.active_characters[character_id]
        
        if character_id in self.profiles:
            character = Character(profile=self.profiles[character_id])
            self.active_characters[character_id] = character
            return character
        
        return None
    
    def list_characters(self, business_type: Optional[str] = None) -> List[CharacterProfile]:
        """List all character profiles, optionally filtered by business type"""
        profiles = list(self.profiles.values())
        
        if business_type:
            profiles = [p for p in profiles if p.business_type == business_type]
        
        return profiles
    
    def update_character(
        self,
        character_id: str,
        updates: Dict
    ) -> CharacterProfile:
        """Update character profile"""
        if character_id not in self.profiles:
            raise ValueError(f"Character {character_id} not found")
        
        profile = self.profiles[character_id]
        
        # Update fields
        for key, value in updates.items():
            if hasattr(profile, key):
                setattr(profile, key, value)
        
        profile.updated_at = datetime.utcnow()
        
        # Save updated profile
        self.builder.save_profile(profile, self.storage_dir)
        
        # Update active character if exists
        if character_id in self.active_characters:
            self.active_characters[character_id].profile = profile
        
        return profile
    
    def delete_character(self, character_id: str):
        """Delete character profile"""
        if character_id in self.profiles:
            # Remove file
            profile_file = self.storage_dir / f"{character_id}.json"
            if profile_file.exists():
                profile_file.unlink()
            
            # Remove from memory
            del self.profiles[character_id]
            
            if character_id in self.active_characters:
                del self.active_characters[character_id]
    
    def export_character(self, character_id: str, output_path: Path) -> Path:
        """Export character to file"""
        if character_id not in self.profiles:
            raise ValueError(f"Character {character_id} not found")
        
        profile = self.profiles[character_id]
        return self.builder.save_profile(profile, output_path.parent)
    
    def get_character_stats(self, character_id: str) -> Dict:
        """Get usage statistics for character"""
        character = self.get_character(character_id)
        if not character:
            return {}
        
        return {
            "character_id": character_id,
            "name": character.profile.name,
            "interaction_count": character.interaction_count,
            "last_used": character.last_used,
            "active": character.profile.active,
            "version": character.profile.version,
        }
