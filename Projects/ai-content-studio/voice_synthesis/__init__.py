"""Voice Synthesis - ElevenLabs integration for character voices"""

from .synthesizer import VoiceSynthesizer
from .voice_manager import VoiceManager
from .audio_processor import AudioProcessor

__all__ = [
    "VoiceSynthesizer",
    "VoiceManager",
    "AudioProcessor",
]
