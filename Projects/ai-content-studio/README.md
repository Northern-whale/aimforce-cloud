# AI Content Studio

**Complete AI Character Content Generation Platform for Local Businesses**

Generate engaging social media content using AI characters that represent and promote local businesses. Perfect for content creators working with pet stores, restaurants, retail shops, and service businesses.

## 🎯 Overview

AI Content Studio provides:
- **Character Framework**: Create and manage AI character personas
- **Script Generation**: AI-powered script creation with 20+ templates
- **Voice Synthesis**: ElevenLabs integration for character voices
- **Content Pipeline**: End-to-end automated content generation
- **Business Templates**: Pre-built templates for 10+ business types

## 🚀 Quick Start

### Installation

```bash
# Clone/navigate to project
cd ~/Desktop/Tars/Projects/ai-content-studio

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Add your API keys to .env
# ANTHROPIC_API_KEY=your_key_here
# ELEVENLABS_API_KEY=your_key_here
```

### Basic Usage

```python
from character_system import CharacterManager
from script_engine import ScriptGenerator
from script_engine.models import ScriptGenerationRequest, ContentFormat
from voice_synthesis import VoiceSynthesizer

# Initialize systems
char_manager = CharacterManager()
script_gen = ScriptGenerator()
voice_synth = VoiceSynthesizer()

# Create a character
character = char_manager.create_character(
    template_name="pet_store_mascot",
    character_name="Buddy",
    business_name="Happy Paws Pet Store"
)

# Generate script
request = ScriptGenerationRequest(
    character_id=character.profile.character_id,
    business_name="Happy Paws Pet Store",
    business_type="pet_store",
    content_type="product_review",
    content_format=ContentFormat.REEL,
    product_name="Ultra Fetch Ball",
    target_duration=30
)

script = script_gen.generate_script(character, request)

# Generate voice
audio_files = voice_synth.synthesize_script_sections(
    script,
    character.profile.voice
)

print(f"Script: {script.full_script}")
print(f"Audio: {audio_files['full']}")
```

## 📁 Project Structure

```
ai-content-studio/
├── character_system/       # Character profiles and management
│   ├── models.py          # Pydantic models for characters
│   ├── builder.py         # Character creation factory
│   └── manager.py         # Character runtime management
│
├── script_engine/         # Script generation engine
│   ├── models.py          # Script data models
│   ├── templates.py       # 20+ pre-built templates
│   ├── generator.py       # AI-powered script generation
│   └── validator.py       # Quality validation
│
├── voice_synthesis/       # Voice generation
│   ├── synthesizer.py     # ElevenLabs integration
│   ├── voice_manager.py   # Voice profile management
│   └── audio_processor.py # Audio manipulation
│
├── content_pipeline/      # End-to-end pipeline
│   ├── pipeline.py        # Main orchestration
│   └── uploader.py        # Cloud storage
│
├── business_templates/    # Pre-built business templates
│   └── templates.json     # 10 business types
│
├── demos/                 # Example implementations
│   └── tulsi/            # Pet store demo character
│
├── tests/                # Test suite
└── docs/                 # Documentation
```

## 🎭 Character System

### Character Types
- **Mascot**: Friendly brand representative (pets, objects)
- **Spokesperson**: Professional business voice
- **Product Reviewer**: Enthusiastic tester
- **Tour Guide**: Behind-the-scenes explorer
- **Educator**: Tips and teaching

### Creating Characters

```python
# From template
character = char_manager.create_character(
    template_name="pet_store_mascot",
    character_name="Tulsi",
    business_name="Pawsitive Pets",
    description="Friendly golden retriever mascot",
    traits=["enthusiastic", "knowledgeable"],
    expertise=["pet nutrition", "toy reviews"]
)

# Custom character
from character_system.builder import CharacterBuilder
builder = CharacterBuilder()

profile = builder.create_custom(
    character_id="my-character",
    name="Rocky",
    character_type=CharacterType.MASCOT,
    business_type="pet_store",
    description="Energetic terrier",
    voice_config={...},
    personality_config={...},
    speaking_config={...}
)
```

## 📝 Script Generation

### Built-in Templates

20+ templates across categories:
- **Pet Store**: Product reviews, store tours, care tips
- **Restaurant**: Menu highlights, chef specials, behind-scenes
- **Retail**: New arrivals, styling tips, showcases
- **Service**: Before/after, testimonials, FAQ
- **Seasonal**: Holiday specials, events

### Template Usage

```python
from script_engine import ScriptGenerator
from script_engine.models import ScriptGenerationRequest

generator = ScriptGenerator()

# Use template
script = generator.generate_script(character, request)

# AI-powered generation (requires Claude API key)
script = generator.generate_script(
    character,
    request,
    custom_instructions="Make it extra funny"
)
```

### Script Validation

```python
from script_engine import ScriptValidator

validator = ScriptValidator()

# Validate quality
is_valid, issues = validator.validate(script)

# Score engagement potential
score = validator.score_engagement_potential(script)
print(f"Score: {score['total_score']}/100 ({score['grade']})")
print(f"Recommendation: {score['recommendation']}")
```

## 🎤 Voice Synthesis

### ElevenLabs Integration

```python
from voice_synthesis import VoiceSynthesizer

synth = VoiceSynthesizer(api_key="your_elevenlabs_key")

# Synthesize text
audio_file = synth.synthesize(
    text="Hello! This is Tulsi!",
    voice_config=character.profile.voice
)

# Synthesize full script
audio_files = synth.synthesize_script_sections(
    script,
    character.profile.voice
)
# Returns: {'hook': path, 'story': path, 'cta': path, 'full': path}
```

### Voice Profiles

Pre-configured voices:
- **tulsi**: Warm, playful, female (pet store)
- **professional**: Neutral, authoritative
- **friendly_guide**: Upbeat, welcoming
- **excited_reviewer**: Enthusiastic, fast
- **calm_educator**: Soothing, clear
- **bilingual_spanish**: English + Spanish

## 🔄 Content Pipeline

### End-to-End Generation

```python
from content_pipeline import ContentPipeline

pipeline = ContentPipeline(
    character_manager=char_manager,
    script_generator=script_gen,
    voice_synthesizer=voice_synth
)

# Generate complete content package
result = pipeline.generate_content(
    character_id="tulsi",
    request=script_request,
    generate_audio=True,
    validate=True
)

# Result includes:
# - script: Full script object
# - audio_files: All generated audio
# - validation: Quality scores
# - metadata: Generation info

# Create deliverable package
package_dir = pipeline.create_content_package(result)
```

### Batch Generation

```python
# Generate multiple pieces
requests = [request1, request2, request3]
results = pipeline.generate_batch(
    character_id="tulsi",
    requests=requests,
    generate_audio=True
)
```

## 🏢 Business Templates

10 pre-configured business types:

1. **Pet Store**
2. **Restaurant**
3. **Retail Boutique**
4. **Coffee Shop**
5. **Fitness Studio**
6. **Salon & Spa**
7. **Bakery**
8. **Bookstore**
9. **Auto Repair**
10. **Yoga Studio**

Each includes:
- Character archetypes
- Content types
- Sample content calendar
- Recommended hashtags

## 🎬 Demo: Tulsi Character

Complete pet store mascot demo included:

```bash
# Create Tulsi character
cd demos/tulsi
python create_tulsi.py

# Generate sample scripts
python generate_sample_scripts.py
```

Generates 5 complete scripts:
1. Product review (toy)
2. Store tour
3. Pet care tip (seasonal)
4. Customer spotlight
5. Holiday special

## 📊 Performance Targets

- **Script generation**: < 10 seconds
- **Voice synthesis**: < 30 seconds per script
- **Complete pipeline**: < 2 minutes per post
- **Character creation**: < 5 minutes

## 🔧 Configuration

### Environment Variables

```bash
# AI APIs
ANTHROPIC_API_KEY=your_key
ELEVENLABS_API_KEY=your_key

# Storage
USE_LOCAL_STORAGE=true
S3_BUCKET_NAME=your_bucket  # Optional

# Settings
DEFAULT_VOICE_MODEL=eleven_multilingual_v2
DEFAULT_LLM_MODEL=claude-sonnet-4
MAX_SCRIPT_LENGTH=500
```

### Voice Settings

Adjust in `.env` or per-character:
```bash
VOICE_STABILITY=0.5          # 0-1, higher = more consistent
VOICE_SIMILARITY_BOOST=0.75  # 0-1, higher = closer to original
VOICE_STYLE=0.0              # 0-1, higher = more expressive
```

## 🧪 Testing

```bash
# Run test suite
pytest tests/

# Test specific module
pytest tests/test_character_system.py

# With coverage
pytest --cov=. tests/
```

## 📚 Documentation

- **Setup Guide**: `docs/SETUP.md`
- **API Documentation**: `docs/API.md`
- **Character Creation Guide**: `docs/CHARACTER_GUIDE.md`
- **Script Writing Best Practices**: `docs/SCRIPT_BEST_PRACTICES.md`

## 🎯 Use Cases

### Pet Store Content
```python
# Product reviews from pet mascot
# Store tours
# Pet care tips
# Customer pet features
```

### Restaurant Content
```python
# Menu highlights
# Chef specials
# Behind-the-scenes
# Customer testimonials
```

### Retail Content
```python
# New arrivals
# Styling tips
# Product showcases
# Sale announcements
```

## 🚧 Roadmap

### Phase 1: Core System ✅
- Character framework
- Script generation
- Voice synthesis
- Content pipeline

### Phase 2: Enhancement (Future)
- Video editing integration (Runway, Pictory)
- Auto-posting to social platforms
- Analytics dashboard
- A/B testing for scripts

### Phase 3: Scale (Future)
- Multi-language support
- Voice cloning
- Custom video avatars (HeyGen, D-ID)
- Client portal

## 🤝 Contributing

This is a production tool for content creation. Extend as needed:
- Add new business templates
- Create custom character types
- Build new script templates
- Enhance voice profiles

## 📄 License

Proprietary - For Tars Projects use

## 🆘 Support

For issues or questions:
1. Check documentation in `docs/`
2. Review examples in `demos/`
3. Test with demo character Tulsi

---

**Built for efficient, engaging local business content creation using AI characters.**
