"""Script Engine - Data Models"""

from datetime import datetime
from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, validator


class ContentFormat(str, Enum):
    """Social media content formats"""
    REEL = "reel"  # Instagram/Facebook Reels
    STORY = "story"  # Instagram/Facebook Stories
    POST = "post"  # Static post with caption
    VIDEO = "video"  # YouTube/TikTok video
    SHORT = "short"  # YouTube Shorts/TikTok


class ScriptSection(BaseModel):
    """A section of the script"""
    name: str = Field(..., description="Section name (hook, story, cta)")
    duration_seconds: int = Field(..., description="Target duration")
    content: str = Field(..., description="Script content")
    visual_cues: List[str] = Field(default_factory=list, description="Visual instructions")
    emphasis_words: List[str] = Field(default_factory=list, description="Words to emphasize")
    
    @validator('duration_seconds')
    def validate_duration(cls, v):
        if v < 1:
            raise ValueError("Duration must be at least 1 second")
        return v


class Script(BaseModel):
    """Complete script for content piece"""
    script_id: str
    title: str
    character_id: str
    business_type: str
    content_format: ContentFormat
    
    # Script structure
    hook: ScriptSection
    story: ScriptSection
    call_to_action: ScriptSection
    
    # Metadata
    total_duration_seconds: int
    word_count: int
    tone: str
    target_audience: str
    
    # Content context
    product_name: Optional[str] = None
    location: Optional[str] = None
    season_theme: Optional[str] = None
    keywords: List[str] = Field(default_factory=list)
    hashtags: List[str] = Field(default_factory=list)
    
    # Full script
    full_script: str = ""
    
    # Social media assets
    caption: Optional[str] = None
    description: Optional[str] = None
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    template_used: Optional[str] = None
    
    def model_post_init(self, __context):
        """Calculate derived fields"""
        if not self.full_script:
            self.full_script = f"{self.hook.content}\n\n{self.story.content}\n\n{self.call_to_action.content}"
        
        if self.word_count == 0:
            self.word_count = len(self.full_script.split())
        
        if self.total_duration_seconds == 0:
            self.total_duration_seconds = (
                self.hook.duration_seconds +
                self.story.duration_seconds +
                self.call_to_action.duration_seconds
            )
    
    def get_visual_plan(self) -> List[Dict[str, Any]]:
        """Get visual shooting plan"""
        plan = []
        
        for section in [self.hook, self.story, self.call_to_action]:
            plan.append({
                "section": section.name,
                "duration": section.duration_seconds,
                "script": section.content,
                "visuals": section.visual_cues,
            })
        
        return plan


class ScriptTemplate(BaseModel):
    """Template for script generation"""
    template_id: str
    name: str
    business_type: str
    content_type: str  # "product_review", "tour", "tip", etc.
    
    # Template structure
    hook_template: str
    story_template: str
    cta_template: str
    
    # Configuration
    target_duration: int = Field(30, description="Target duration in seconds")
    tone: str = "playful"
    required_inputs: List[str] = Field(default_factory=list)
    
    # Examples
    example_inputs: Dict[str, str] = Field(default_factory=dict)
    example_output: Optional[str] = None
    
    # Metadata
    category: str
    tags: List[str] = Field(default_factory=list)
    popularity_score: float = Field(0.0, ge=0.0, le=1.0)
    
    def render(self, inputs: Dict[str, str]) -> str:
        """Render template with inputs"""
        hook = self.hook_template.format(**inputs)
        story = self.story_template.format(**inputs)
        cta = self.cta_template.format(**inputs)
        
        return f"{hook}\n\n{story}\n\n{cta}"


class ScriptGenerationRequest(BaseModel):
    """Request to generate a script"""
    character_id: str
    business_name: str
    business_type: str
    
    # Content details
    content_type: str  # "product_review", "day_in_life", etc.
    content_format: ContentFormat = ContentFormat.REEL
    
    # Context
    product_name: Optional[str] = None
    product_description: Optional[str] = None
    location: Optional[str] = None
    season_theme: Optional[str] = None
    special_occasion: Optional[str] = None
    
    # Visual inputs
    image_descriptions: List[str] = Field(default_factory=list)
    video_descriptions: List[str] = Field(default_factory=list)
    
    # Configuration
    target_duration: int = 30
    tone: Optional[str] = None
    target_audience: str = "general"
    include_humor: bool = True
    include_cta: bool = True
    
    # Instructions
    custom_instructions: Optional[str] = None
