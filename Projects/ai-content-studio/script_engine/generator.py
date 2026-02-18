"""Script Generator - AI-powered script creation using Claude"""

import os
from typing import Optional, Dict, Any
import anthropic
from datetime import datetime

from character_system.models import Character
from script_engine.models import (
    Script,
    ScriptSection,
    ScriptGenerationRequest,
    ContentFormat,
)
from script_engine.templates import TemplateLibrary


class ScriptGenerator:
    """Generate scripts using AI and templates"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        if self.api_key:
            self.client = anthropic.Anthropic(api_key=self.api_key)
        else:
            self.client = None
            print("Warning: No Anthropic API key provided. AI generation disabled.")
        
        self.template_library = TemplateLibrary()
    
    def generate_script(
        self,
        character: Character,
        request: ScriptGenerationRequest
    ) -> Script:
        """Generate a complete script"""
        
        # Try to find template first
        template = self._find_best_template(request)
        
        # If no API key, always use template (ignore custom instructions)
        if not self.client:
            if template:
                print("Note: Using template (no API key available)")
                return self._generate_from_template(character, request, template)
            else:
                raise ValueError("No API key available and no suitable template found")
        
        # If API key available, use AI for custom instructions, otherwise use template
        if request.custom_instructions:
            return self._generate_with_ai(character, request)
        elif template:
            return self._generate_from_template(character, request, template)
        else:
            return self._generate_with_ai(character, request)
    
    def _find_best_template(self, request: ScriptGenerationRequest):
        """Find the best matching template"""
        templates = self.template_library.list_templates(
            business_type=request.business_type,
            content_type=request.content_type
        )
        
        if templates:
            return templates[0]
        return None
    
    def _generate_from_template(
        self,
        character: Character,
        request: ScriptGenerationRequest,
        template
    ) -> Script:
        """Generate script from template"""
        
        # Create inputs with safe defaults
        inputs = {
            "character_name": character.profile.name,
            "business_name": request.business_name,
            "location": request.location or "Denver",
            "product_name": request.product_name or "our amazing product",
            "product_description": request.product_description or "high-quality item",
            "opinion": "it's fantastic and I highly recommend it",
            "benefit": "it works great",
            "extra_detail": "the quality is excellent",
            "section_1": "the main area",
            "section_2": "the specialty section",
            "section_3": "the customer favorites",
            "fact": "taking good care of your items makes them last longer",
            "explanation": "proper maintenance is key",
            "tip": "check regularly and clean as needed",
            "benefit": "your items will stay in great condition",
        }
        
        # Try to format templates, use defaults if keys missing
        try:
            hook_content = template.hook_template.format(**inputs)
        except KeyError:
            hook_content = f"🎬 Hey there! {character.profile.name} here with something exciting!"
        
        try:
            story_content = template.story_template.format(**inputs)
        except KeyError:
            story_content = f"Let me tell you about {inputs['product_name']} at {inputs['business_name']}. {inputs['product_description']}. It's really great and I think you'll love it!"
        
        try:
            cta_content = template.cta_template.format(**inputs)
        except KeyError:
            cta_content = f"Come check it out at {inputs['business_name']}! You won't be disappointed! ✨"
        
        # Generate sections
        hook = ScriptSection(
            name="hook",
            duration_seconds=3,
            content=hook_content,
        )
        
        story = ScriptSection(
            name="story",
            duration_seconds=request.target_duration - 6,
            content=story_content,
        )
        
        cta = ScriptSection(
            name="call_to_action",
            duration_seconds=3,
            content=cta_content,
        )
        
        script = Script(
            script_id=f"script-{int(datetime.utcnow().timestamp())}",
            title=f"{template.name} - {request.business_name}",
            character_id=character.profile.character_id,
            business_type=request.business_type,
            content_format=request.content_format,
            hook=hook,
            story=story,
            call_to_action=cta,
            total_duration_seconds=request.target_duration,
            word_count=0,
            tone=request.tone or character.profile.default_tone,
            target_audience=request.target_audience,
            template_used=template.template_id,
        )
        
        return script
    
    def _generate_with_ai(
        self,
        character: Character,
        request: ScriptGenerationRequest
    ) -> Script:
        """Generate script using Claude API"""
        
        prompt = self._build_generation_prompt(character, request)
        
        response = self.client.messages.create(
            model="claude-sonnet-4",
            max_tokens=2000,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )
        
        # Parse response
        script_content = response.content[0].text
        
        # Split into sections (simplified parsing)
        sections = self._parse_script_sections(script_content, request.target_duration)
        
        script = Script(
            script_id=f"script-{int(datetime.utcnow().timestamp())}",
            title=f"{request.content_type.title()} - {request.business_name}",
            character_id=character.profile.character_id,
            business_type=request.business_type,
            content_format=request.content_format,
            hook=sections['hook'],
            story=sections['story'],
            call_to_action=sections['cta'],
            total_duration_seconds=request.target_duration,
            word_count=0,
            tone=request.tone or character.profile.default_tone,
            target_audience=request.target_audience,
            product_name=request.product_name,
            location=request.location,
            season_theme=request.season_theme,
        )
        
        return script
    
    def _build_generation_prompt(
        self,
        character: Character,
        request: ScriptGenerationRequest
    ) -> str:
        """Build prompt for Claude"""
        
        character_context = character.get_prompt_context()
        
        prompt = f"""{character_context}

TASK: Create a {request.target_duration}-second social media script ({request.content_format}) for {request.business_name}.

CONTENT TYPE: {request.content_type}
TARGET AUDIENCE: {request.target_audience}
TONE: {request.tone or character.profile.default_tone}

CONTEXT:
"""
        
        if request.product_name:
            prompt += f"\nProduct: {request.product_name}"
        if request.product_description:
            prompt += f"\nDescription: {request.product_description}"
        if request.location:
            prompt += f"\nLocation: {request.location}"
        if request.season_theme:
            prompt += f"\nSeason/Theme: {request.season_theme}"
        if request.image_descriptions:
            prompt += f"\nVisuals available: {', '.join(request.image_descriptions)}"
        if request.custom_instructions:
            prompt += f"\nSpecial instructions: {request.custom_instructions}"
        
        prompt += f"""

SCRIPT STRUCTURE:
1. HOOK (3 seconds): Grab attention immediately
2. STORY ({request.target_duration - 6} seconds): Main content, engaging narrative
3. CALL TO ACTION (3 seconds): Clear next step

REQUIREMENTS:
- Stay in character as {character.profile.name}
- Use natural, conversational language
- Include specific details about the business/product
- Make it shareable and engaging
- Keep it family-friendly
- Add emoji strategically (but don't overdo it)
- Sound authentic, not scripted

OUTPUT FORMAT:
[HOOK]
(3-second hook here)

[STORY]
(Main content here)

[CTA]
(Call to action here)

Generate the script now:"""
        
        return prompt
    
    def _parse_script_sections(
        self,
        script_content: str,
        target_duration: int
    ) -> Dict[str, ScriptSection]:
        """Parse AI-generated script into sections"""
        
        sections = {}
        
        # Split by section markers
        parts = script_content.split('[')
        
        hook_content = ""
        story_content = ""
        cta_content = ""
        
        for part in parts:
            if part.startswith('HOOK]'):
                hook_content = part.replace('HOOK]', '').strip()
            elif part.startswith('STORY]'):
                story_content = part.replace('STORY]', '').strip()
            elif part.startswith('CTA]') or part.startswith('CALL TO ACTION]'):
                cta_content = part.replace('CTA]', '').replace('CALL TO ACTION]', '').strip()
        
        # If parsing failed, split by paragraphs
        if not hook_content:
            paragraphs = [p.strip() for p in script_content.split('\n\n') if p.strip()]
            if len(paragraphs) >= 3:
                hook_content = paragraphs[0]
                story_content = '\n\n'.join(paragraphs[1:-1])
                cta_content = paragraphs[-1]
            else:
                hook_content = script_content[:100]
                story_content = script_content[100:-50]
                cta_content = script_content[-50:]
        
        sections['hook'] = ScriptSection(
            name="hook",
            duration_seconds=3,
            content=hook_content[:200]  # Limit length
        )
        
        sections['story'] = ScriptSection(
            name="story",
            duration_seconds=target_duration - 6,
            content=story_content
        )
        
        sections['cta'] = ScriptSection(
            name="call_to_action",
            duration_seconds=3,
            content=cta_content[:150]  # Limit length
        )
        
        return sections
    
    def generate_caption(self, script: Script) -> str:
        """Generate social media caption from script"""
        
        caption = f"{script.title}\n\n"
        caption += f"{script.hook.content}\n\n"
        
        if script.hashtags:
            caption += ' '.join(f"#{tag}" for tag in script.hashtags[:10])
        
        return caption
    
    def generate_variants(
        self,
        character: Character,
        request: ScriptGenerationRequest,
        num_variants: int = 3
    ) -> list[Script]:
        """Generate multiple script variants"""
        variants = []
        
        for i in range(num_variants):
            # Add variation instruction
            original_instructions = request.custom_instructions or ""
            request.custom_instructions = f"{original_instructions} Variant {i+1}: Make this version unique."
            
            script = self.generate_script(character, request)
            variants.append(script)
        
        return variants
