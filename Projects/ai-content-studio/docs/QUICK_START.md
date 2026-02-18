# Quick Start Guide

## Installation

### 1. Install Dependencies

```bash
cd ~/Desktop/Tars/Projects/ai-content-studio
pip install -r requirements.txt
```

### 2. Configure API Keys

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```bash
ANTHROPIC_API_KEY=your_anthropic_key_here
ELEVENLABS_API_KEY=your_elevenlabs_key_here
```

**Note:** The system works without API keys using templates, but AI generation and voice synthesis require keys.

## 5-Minute Demo

### Run the Complete Demo

```bash
python main_demo.py
```

This will:
1. Create Tulsi character (pet store mascot)
2. Generate 2 sample scripts
3. Validate quality
4. Create deliverable package

### Run Tulsi Demo

```bash
cd demos/tulsi
python create_tulsi.py
python generate_sample_scripts.py
```

Generates 5 complete scripts for different scenarios.

## Basic Usage

### 1. Create a Character

```python
from character_system import CharacterManager

manager = CharacterManager()

character = manager.create_character(
    template_name="pet_store_mascot",
    character_name="Buddy",
    business_name="Happy Paws"
)
```

### 2. Generate a Script

```python
from script_engine import ScriptGenerator
from script_engine.models import ScriptGenerationRequest, ContentFormat

generator = ScriptGenerator()

request = ScriptGenerationRequest(
    character_id=character.profile.character_id,
    business_name="Happy Paws",
    business_type="pet_store",
    content_type="product_review",
    content_format=ContentFormat.REEL,
    product_name="Super Toy",
    target_duration=30
)

script = generator.generate_script(character, request)
print(script.full_script)
```

### 3. Validate Quality

```python
from script_engine import ScriptValidator

validator = ScriptValidator()
is_valid, issues = validator.validate(script)
score = validator.score_engagement_potential(script)

print(f"Score: {score['total_score']}/100")
print(f"Grade: {score['grade']}")
```

### 4. Generate Voice (Optional)

```python
from voice_synthesis import VoiceSynthesizer

synth = VoiceSynthesizer()

audio_files = synth.synthesize_script_sections(
    script,
    character.profile.voice
)

print(f"Audio saved: {audio_files['full']}")
```

### 5. Complete Pipeline

```python
from content_pipeline import ContentPipeline

pipeline = ContentPipeline(
    character_manager=manager,
    script_generator=generator,
    voice_synthesizer=synth
)

result = pipeline.generate_content(
    character_id=character.profile.character_id,
    request=request,
    generate_audio=True,
    validate=True
)

# Create deliverable package
package = pipeline.create_content_package(result)
```

## Template Usage

### Available Templates

**Pet Store:**
- `pet_store_product_review`
- `pet_store_tour`
- `pet_store_tip`

**Restaurant:**
- `restaurant_menu_highlight`
- `restaurant_behind_scenes`

**Retail:**
- `retail_new_arrival`
- `retail_how_to_style`

**Service:**
- `service_before_after`
- `service_customer_story`

**General:**
- `seasonal_holiday`
- `faq_quick_answer`

### Using Templates

```python
from script_engine.templates import TemplateLibrary

library = TemplateLibrary()

# List templates for business type
templates = library.list_templates(business_type="pet_store")

# Get specific template
template = library.get_template("pet_store_product_review")

# Generate from template
script = generator.generate_script(character, request)
```

## Business Types

10 pre-configured business types:

1. Pet Store
2. Restaurant
3. Retail Boutique
4. Coffee Shop
5. Fitness Studio
6. Salon & Spa
7. Bakery
8. Bookstore
9. Auto Repair
10. Yoga Studio

Each has custom character archetypes, content types, and hashtags.

## Common Workflows

### Workflow 1: Single Content Piece

1. Create/load character
2. Generate script
3. Validate
4. Generate voice
5. Package for delivery

### Workflow 2: Content Calendar (Weekly)

```python
# Monday: Product review
# Wednesday: Educational tip
# Friday: Customer spotlight

requests = [request_mon, request_wed, request_fri]
results = pipeline.generate_batch(
    character_id=character.profile.character_id,
    requests=requests
)
```

### Workflow 3: Multiple Characters

```python
# Create characters for different businesses
tulsi = manager.create_character(...)  # Pet store
chef_marco = manager.create_character(...)  # Restaurant
style_sarah = manager.create_character(...)  # Boutique

# Generate content for each
for char in [tulsi, chef_marco, style_sarah]:
    result = pipeline.generate_content(char.profile.character_id, request)
```

## Troubleshooting

### No API Keys
- System uses templates (works without keys)
- Add keys for AI generation and voice synthesis

### Voice Synthesis Fails
- Check ElevenLabs API key
- Ensure `elevenlabs` package installed
- Check API quota

### Script Quality Low
- Adjust request parameters
- Try different templates
- Use custom_instructions for specifics

### ffmpeg Not Found
- Install: `brew install ffmpeg` (Mac)
- Audio processing features will be limited without it

## Next Steps

1. **Explore templates**: Check `script_engine/templates.py`
2. **Create characters**: Build characters for your businesses
3. **Customize voices**: Edit voice profiles in `voice_synthesis/voice_manager.py`
4. **Generate content**: Run batch generation for content calendar
5. **Review output**: Check `output/` directory for results

## Resources

- Full README: `README.md`
- API docs: `docs/API.md`
- Character guide: `docs/CHARACTER_GUIDE.md`
- Script best practices: `docs/SCRIPT_BEST_PRACTICES.md`
- Business templates: `business_templates/templates.json`
