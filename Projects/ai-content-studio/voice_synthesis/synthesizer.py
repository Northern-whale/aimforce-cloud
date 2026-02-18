"""Voice Synthesizer - ElevenLabs TTS integration"""

import os
from pathlib import Path
from typing import Optional, Dict
from datetime import datetime

try:
    from elevenlabs import VoiceSettings, generate, save, voices, Voice
    ELEVENLABS_AVAILABLE = True
except ImportError:
    ELEVENLABS_AVAILABLE = False
    print("Warning: ElevenLabs not installed. Voice synthesis disabled.")

from character_system.models import VoiceConfig


class VoiceSynthesizer:
    """Synthesize character voices using ElevenLabs"""
    
    def __init__(self, api_key: Optional[str] = None, output_dir: Optional[Path] = None):
        self.api_key = api_key or os.getenv("ELEVENLABS_API_KEY")
        self.output_dir = output_dir or Path("output/audio")
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        if not ELEVENLABS_AVAILABLE:
            self.enabled = False
            print("Voice synthesis disabled: ElevenLabs package not available")
        elif not self.api_key:
            self.enabled = False
            print("Voice synthesis disabled: No API key provided")
        else:
            self.enabled = True
            os.environ["ELEVENLABS_API_KEY"] = self.api_key
    
    def synthesize(
        self,
        text: str,
        voice_config: VoiceConfig,
        output_filename: Optional[str] = None
    ) -> Optional[Path]:
        """
        Synthesize speech from text using character voice configuration
        
        Returns: Path to generated audio file, or None if synthesis failed
        """
        if not self.enabled:
            print(f"Voice synthesis skipped (not enabled). Text: {text[:50]}...")
            return None
        
        try:
            # Generate output filename
            if not output_filename:
                timestamp = int(datetime.utcnow().timestamp())
                output_filename = f"voice_{timestamp}.mp3"
            
            output_path = self.output_dir / output_filename
            
            # Configure voice settings
            voice_settings = VoiceSettings(
                stability=voice_config.stability,
                similarity_boost=voice_config.similarity_boost,
                style=voice_config.style,
                use_speaker_boost=voice_config.use_speaker_boost
            )
            
            # Generate audio
            if voice_config.voice_id:
                # Use specific voice ID
                audio = generate(
                    text=text,
                    voice=voice_config.voice_id,
                    model="eleven_multilingual_v2",
                    voice_settings=voice_settings
                )
            else:
                # Use first available voice (demo mode)
                audio = generate(
                    text=text,
                    voice="Rachel",  # Default ElevenLabs voice
                    model="eleven_multilingual_v2",
                    voice_settings=voice_settings
                )
            
            # Save audio file
            save(audio, str(output_path))
            
            print(f"✓ Voice synthesized: {output_path}")
            return output_path
            
        except Exception as e:
            print(f"Error synthesizing voice: {e}")
            return None
    
    def synthesize_script_sections(
        self,
        script,
        voice_config: VoiceConfig,
        output_prefix: Optional[str] = None
    ) -> Dict[str, Optional[Path]]:
        """
        Synthesize all sections of a script separately
        
        Returns: Dict mapping section names to audio file paths
        """
        if not output_prefix:
            output_prefix = f"script_{script.script_id}"
        
        results = {}
        
        # Synthesize hook
        results['hook'] = self.synthesize(
            script.hook.content,
            voice_config,
            f"{output_prefix}_hook.mp3"
        )
        
        # Synthesize story
        results['story'] = self.synthesize(
            script.story.content,
            voice_config,
            f"{output_prefix}_story.mp3"
        )
        
        # Synthesize CTA
        results['cta'] = self.synthesize(
            script.call_to_action.content,
            voice_config,
            f"{output_prefix}_cta.mp3"
        )
        
        # Synthesize full script
        results['full'] = self.synthesize(
            script.full_script,
            voice_config,
            f"{output_prefix}_full.mp3"
        )
        
        return results
    
    def list_available_voices(self) -> list:
        """List all available ElevenLabs voices"""
        if not self.enabled:
            return []
        
        try:
            available_voices = voices()
            return [
                {
                    'voice_id': v.voice_id,
                    'name': v.name,
                    'category': v.category if hasattr(v, 'category') else 'unknown',
                }
                for v in available_voices
            ]
        except Exception as e:
            print(f"Error listing voices: {e}")
            return []
    
    def test_voice(
        self,
        voice_config: VoiceConfig,
        test_text: Optional[str] = None
    ) -> Optional[Path]:
        """
        Test a voice configuration with sample text
        
        Returns: Path to test audio file
        """
        if not test_text:
            test_text = voice_config.sample_text
        
        return self.synthesize(
            test_text,
            voice_config,
            f"test_{voice_config.voice_name.replace(' ', '_').lower()}.mp3"
        )
    
    def clone_voice(
        self,
        name: str,
        description: str,
        audio_files: list[Path]
    ) -> Optional[str]:
        """
        Clone a voice from audio samples
        
        Returns: Voice ID of cloned voice
        
        Note: This requires ElevenLabs API with voice cloning enabled
        """
        if not self.enabled:
            print("Voice cloning not available (ElevenLabs not enabled)")
            return None
        
        print(f"Voice cloning requires ElevenLabs Pro subscription")
        print(f"Upload files manually to ElevenLabs dashboard:")
        for audio_file in audio_files:
            print(f"  - {audio_file}")
        
        return None
    
    def get_voice_info(self, voice_id: str) -> Optional[Dict]:
        """Get information about a specific voice"""
        if not self.enabled:
            return None
        
        try:
            available = self.list_available_voices()
            for v in available:
                if v['voice_id'] == voice_id:
                    return v
            return None
        except Exception as e:
            print(f"Error getting voice info: {e}")
            return None
