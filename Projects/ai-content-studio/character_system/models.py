"""Character System - Pydantic Models"""

from datetime import datetime
from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, validator


class CharacterType(str, Enum):
    """Types of AI characters"""
    MASCOT = "mascot"
    SPOKESPERSON = "spokesperson"
    PRODUCT_REVIEWER = "product_reviewer"
    TOUR_GUIDE = "tour_guide"
    EDUCATOR = "educator"
    STORYTELLER = "storyteller"


class ToneType(str, Enum):
    """Tone options for content"""
    PLAYFUL = "playful"
    PROFESSIONAL = "professional"
    INSPIRATIONAL = "inspirational"
    EDUCATIONAL = "educational"
    FRIENDLY = "friendly"
    EXCITED = "excited"
    CALM = "calm"
    HUMOROUS = "humorous"


class VoiceConfig(BaseModel):
    """Voice synthesis configuration"""
    voice_id: Optional[str] = Field(None, description="ElevenLabs voice ID")
    voice_name: str = Field(..., description="Human-readable voice name")
    gender: str = Field("neutral", description="Voice gender: male, female, neutral")
    age: str = Field("adult", description="Voice age: child, young_adult, adult, senior")
    accent: str = Field("american", description="Accent type")
    language: str = Field("en", description="Primary language code")
    secondary_languages: List[str] = Field(default_factory=list)
    
    # ElevenLabs settings
    stability: float = Field(0.5, ge=0.0, le=1.0)
    similarity_boost: float = Field(0.75, ge=0.0, le=1.0)
    style: float = Field(0.0, ge=0.0, le=1.0)
    use_speaker_boost: bool = True
    
    # Voice characteristics
    pitch: str = Field("medium", description="low, medium, high")
    speed: str = Field("medium", description="slow, medium, fast")
    energy: str = Field("medium", description="low, medium, high")
    
    sample_text: str = Field(
        "Hi there! I'm excited to share this amazing story with you today!",
        description="Sample text for voice testing"
    )


class PersonalityTraits(BaseModel):
    """Character personality configuration"""
    archetype: str = Field(..., description="Core personality archetype")
    traits: List[str] = Field(..., description="Key personality traits")
    values: List[str] = Field(default_factory=list, description="What the character values")
    quirks: List[str] = Field(default_factory=list, description="Unique quirks or habits")
    humor_style: Optional[str] = Field(None, description="Type of humor if applicable")
    emotional_range: List[str] = Field(
        default_factory=lambda: ["happy", "excited", "curious"],
        description="Emotions the character expresses"
    )
    expertise: List[str] = Field(default_factory=list, description="Areas of knowledge")


class SpeakingPatterns(BaseModel):
    """How the character speaks"""
    vocabulary_level: str = Field("conversational", description="simple, conversational, sophisticated")
    sentence_structure: str = Field("mixed", description="short, medium, long, mixed")
    
    # Verbal patterns
    catchphrases: List[str] = Field(default_factory=list)
    common_expressions: List[str] = Field(default_factory=list)
    greeting_style: str = Field("Hey there!", description="How character greets audience")
    sign_off: str = Field("See you next time!", description="How character ends content")
    
    # Speech habits
    uses_contractions: bool = True
    uses_slang: bool = False
    uses_technical_terms: bool = False
    uses_emojis_in_script: bool = True
    
    # Pacing
    pause_frequency: str = Field("medium", description="low, medium, high")
    emphasis_style: str = Field("enthusiastic", description="How character emphasizes points")
    
    # Examples
    example_phrases: List[str] = Field(
        default_factory=list,
        description="Example phrases in character's voice"
    )


class CharacterProfile(BaseModel):
    """Complete character profile"""
    # Identity
    character_id: str = Field(..., description="Unique identifier")
    name: str = Field(..., description="Character name")
    character_type: CharacterType
    business_type: str = Field(..., description="Type of business this character represents")
    
    # Description
    description: str = Field(..., description="Character description")
    backstory: Optional[str] = Field(None, description="Character's origin story")
    visual_description: str = Field(..., description="How the character looks")
    
    # Configuration
    voice: VoiceConfig
    personality: PersonalityTraits
    speaking: SpeakingPatterns
    default_tone: ToneType = ToneType.PLAYFUL
    
    # Content preferences
    preferred_content_types: List[str] = Field(
        default_factory=list,
        description="Types of content this character excels at"
    )
    target_audience: str = Field("general", description="Primary audience")
    age_appropriateness: str = Field("all_ages", description="Content rating")
    
    # Business context
    business_name: Optional[str] = None
    business_location: Optional[str] = None
    brand_guidelines: Dict[str, Any] = Field(default_factory=dict)
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    version: str = "1.0"
    active: bool = True
    
    @validator('character_id')
    def validate_character_id(cls, v):
        """Ensure character_id is URL-safe"""
        from slugify import slugify
        return slugify(v)
    
    class Config:
        use_enum_values = True


class Character(BaseModel):
    """Runtime character instance with state"""
    profile: CharacterProfile
    current_mood: str = "neutral"
    context_memory: List[str] = Field(default_factory=list, max_items=10)
    interaction_count: int = 0
    last_used: Optional[datetime] = None
    
    def get_prompt_context(self) -> str:
        """Generate context for AI prompt"""
        ctx = f"""You are {self.profile.name}, a {self.profile.character_type} character.

DESCRIPTION: {self.profile.description}
PERSONALITY: {', '.join(self.profile.personality.traits)}
TONE: {self.profile.default_tone}

SPEAKING STYLE:
- Vocabulary: {self.profile.speaking.vocabulary_level}
- Catchphrases: {', '.join(self.profile.speaking.catchphrases[:3])}
- Greeting: {self.profile.speaking.greeting_style}
- Sign-off: {self.profile.speaking.sign_off}

TARGET AUDIENCE: {self.profile.target_audience}
BUSINESS: {self.profile.business_name or 'Not specified'}

Stay in character. Be {self.profile.default_tone}. Make it engaging and shareable."""
        return ctx
    
    def update_context(self, new_context: str):
        """Add context to character's memory"""
        self.context_memory.append(new_context)
        if len(self.context_memory) > 10:
            self.context_memory = self.context_memory[-10:]
        self.interaction_count += 1
        self.last_used = datetime.utcnow()


class CharacterTemplate(BaseModel):
    """Template for quick character creation"""
    name: str
    character_type: CharacterType
    business_type: str
    description: str
    personality_archetype: str
    default_traits: List[str]
    voice_preset: str
    sample_scripts: List[str] = Field(default_factory=list)
