# Character Creation Guide

## Overview

Characters are the heart of the AI Content Studio. A well-designed character creates consistency, personality, and engagement across all content.

## Character Components

### 1. Identity
- **Name**: Memorable, fits business type
- **Type**: Mascot, spokesperson, reviewer, guide, educator
- **Business**: What business they represent

### 2. Personality
- **Archetype**: Core personality (friendly helper, expert guide, etc.)
- **Traits**: 3-5 key personality traits
- **Values**: What the character cares about
- **Quirks**: Unique habits or characteristics

### 3. Voice
- **Vocal characteristics**: Pitch, speed, energy
- **Language**: Primary + secondary languages
- **Settings**: Stability, similarity, style

### 4. Speaking Patterns
- **Vocabulary level**: Simple, conversational, sophisticated
- **Catchphrases**: Signature phrases (3-5)
- **Greeting/sign-off**: How they start and end
- **Style**: Uses emojis, contractions, slang, etc.

## Character Types

### Mascot
**Best for**: Pet stores, retail, family businesses
**Characteristics**: Friendly, approachable, fun
**Example**: Tulsi the dog (pet store)

```python
character = manager.create_character(
    template_name="pet_store_mascot",
    character_name="Tulsi",
    business_name="Pawsitive Pets",
    traits=["enthusiastic", "knowledgeable", "playful"],
    catchphrases=["Hey pet parents!", "Paws up!"]
)
```

### Spokesperson
**Best for**: Professional services, B2B, corporate
**Characteristics**: Authoritative, trustworthy, clear
**Example**: Professional business representative

```python
voice_config = {
    "voice_name": "Professional Voice",
    "gender": "neutral",
    "pitch": "medium",
    "energy": "medium",
    "stability": 0.7
}
```

### Product Reviewer
**Best for**: Retail, restaurants, product-focused businesses
**Characteristics**: Enthusiastic, detailed, honest
**Example**: Food critic character

```python
personality = {
    "archetype": "passionate_expert",
    "traits": ["enthusiastic", "descriptive", "honest"],
    "expertise": ["food", "flavors", "presentation"]
}
```

### Tour Guide
**Best for**: Physical locations, services, experiences
**Characteristics**: Welcoming, informative, exploratory
**Example**: Store tour guide

```python
speaking_patterns = {
    "catchphrases": ["Follow me!", "Check this out!"],
    "greeting_style": "Welcome! Let's explore together!",
    "emphasis_style": "friendly"
}
```

### Educator
**Best for**: Tips, how-tos, educational content
**Characteristics**: Patient, clear, helpful
**Example**: Expert teacher

```python
voice_config = {
    "pitch": "medium",
    "speed": "slow",
    "energy": "low",
    "stability": 0.7
}
```

## Character Template Selection

### Pet Store → Mascot
```python
manager.create_character(
    template_name="pet_store_mascot",
    character_name="Max",
    business_name="Pet Paradise"
)
```

### Restaurant → Product Reviewer
```python
manager.create_character(
    template_name="restaurant_critic",
    character_name="Chef Tony",
    business_name="Tony's Bistro"
)
```

### Retail → Tour Guide
```python
manager.create_character(
    template_name="retail_guide",
    character_name="Emma",
    business_name="Style Boutique"
)
```

## Voice Configuration

### Warm & Playful (Pet Store, Kids' Stores)
```python
voice = VoiceConfig(
    voice_name="Friendly Voice",
    gender="female",
    pitch="medium",
    speed="medium",
    energy="high",
    stability=0.5,
    similarity_boost=0.75
)
```

### Professional & Clear (Services, B2B)
```python
voice = VoiceConfig(
    voice_name="Professional",
    gender="neutral",
    pitch="medium",
    speed="medium",
    energy="medium",
    stability=0.7,
    similarity_boost=0.7
)
```

### Excited & Enthusiastic (Reviews, Announcements)
```python
voice = VoiceConfig(
    voice_name="Excited",
    gender="neutral",
    pitch="high",
    speed="fast",
    energy="high",
    stability=0.4,
    similarity_boost=0.75
)
```

### Calm & Educational (Tips, How-tos)
```python
voice = VoiceConfig(
    voice_name="Educator",
    gender="neutral",
    pitch="medium",
    speed="slow",
    energy="low",
    stability=0.7,
    similarity_boost=0.7
)
```

## Best Practices

### DO:
✅ Keep personality consistent
✅ Choose 3-5 key traits (don't overload)
✅ Create memorable catchphrases
✅ Match voice to personality
✅ Test voice with sample text
✅ Consider target audience age
✅ Align with brand values

### DON'T:
❌ Make character too complex
❌ Use offensive or controversial traits
❌ Create voice that doesn't match personality
❌ Overuse catchphrases
❌ Ignore business type
❌ Copy competitors directly
❌ Make personality inconsistent

## Character Examples

### Tulsi - Pet Store Dog
```python
{
    "name": "Tulsi",
    "type": "mascot",
    "personality": ["enthusiastic", "knowledgeable", "playful", "caring"],
    "catchphrases": ["Hey pet parents!", "Paws up!", "Four paws from me!"],
    "voice": "warm, female, energetic",
    "expertise": ["pet nutrition", "toys", "grooming"]
}
```

### Chef Marco - Restaurant
```python
{
    "name": "Marco",
    "type": "product_reviewer",
    "personality": ["passionate", "descriptive", "honest", "fun"],
    "catchphrases": ["Magnifico!", "Let's taste this!", "Bellissimo!"],
    "voice": "enthusiastic, male, expressive",
    "expertise": ["Italian cuisine", "wine", "presentation"]
}
```

### Emma - Boutique Guide
```python
{
    "name": "Emma",
    "type": "tour_guide",
    "personality": ["trendy", "helpful", "encouraging", "knowledgeable"],
    "catchphrases": ["Let me show you!", "You'll love this!", "Style tip!"],
    "voice": "upbeat, female, friendly",
    "expertise": ["fashion", "styling", "trends"]
}
```

## Testing Your Character

### 1. Generate Test Scripts
```python
# Test different content types
requests = [
    product_review_request,
    educational_tip_request,
    store_tour_request
]

for request in requests:
    script = generator.generate_script(character, request)
    print(script.full_script)
```

### 2. Test Voice
```python
synth = VoiceSynthesizer()
audio = synth.test_voice(
    character.profile.voice,
    test_text="Hey there! This is a test of my voice!"
)
```

### 3. Validate Consistency
- Do all scripts sound like the same character?
- Is the tone consistent?
- Are catchphrases used naturally?
- Does personality come through?

## Iteration

### Refining Characters

1. **Generate 5+ scripts**
2. **Review for consistency**
3. **Adjust traits/voice if needed**
4. **Test with target audience**
5. **Finalize and document**

### Common Adjustments

**Too robotic:**
- Increase `style` parameter
- Add more catchphrases
- Use more contractions

**Too casual:**
- Adjust vocabulary level
- Reduce slang
- Increase `stability`

**Not on-brand:**
- Review business values
- Adjust personality traits
- Change voice preset

## Advanced: Custom Characters

```python
from character_system.builder import CharacterBuilder
from character_system.models import *

builder = CharacterBuilder()

custom_char = builder.create_custom(
    character_id="my-custom-character",
    name="Rocky",
    character_type=CharacterType.MASCOT,
    business_type="pet_store",
    description="Energetic terrier who loves adventures",
    voice_config={
        "voice_name": "Rocky",
        "gender": "male",
        "pitch": "high",
        "energy": "high",
        "stability": 0.4
    },
    personality_config={
        "archetype": "adventurous_companion",
        "traits": ["bold", "playful", "loyal", "energetic"],
        "quirks": ["Always ready for adventure", "Loves treats"]
    },
    speaking_config={
        "catchphrases": ["Let's go!", "Adventure time!"],
        "greeting_style": "Hey adventurers!",
        "sign_off": "Stay curious!"
    }
)
```

## Bilingual Characters

### Spanish + English (Denver Market)
```python
voice = VoiceConfig(
    voice_name="Bilingual Guide",
    language="es",
    secondary_languages=["en"],
    sample_text="¡Hola! Welcome to our store!"
)

speaking = SpeakingPatterns(
    common_expressions=[
        "¡Vamos!",
        "Let's check this out!",
        "Perfecto!",
        "You'll love this!"
    ]
)
```

## Character Library

Build a library for different clients:

```
characters/
├── pet_stores/
│   ├── tulsi.json
│   ├── max.json
│   └── whiskers.json
├── restaurants/
│   ├── chef_marco.json
│   └── foodie_frank.json
└── retail/
    ├── style_emma.json
    └── fashion_felix.json
```

## Summary

Great characters are:
1. **Consistent** - Same personality across all content
2. **Authentic** - Feel real, not forced
3. **Memorable** - Distinctive voice and traits
4. **On-brand** - Align with business values
5. **Engaging** - Connect with target audience

Start with templates, test extensively, and refine based on results.
