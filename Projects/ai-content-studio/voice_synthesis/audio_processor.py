"""Audio Processor - Audio file processing and manipulation"""

from pathlib import Path
from typing import Optional, List
import os


class AudioProcessor:
    """Process and manipulate audio files"""
    
    def __init__(self):
        self.ffmpeg_available = self._check_ffmpeg()
    
    def _check_ffmpeg(self) -> bool:
        """Check if ffmpeg is available"""
        try:
            import subprocess
            result = subprocess.run(
                ['ffmpeg', '-version'],
                capture_output=True,
                timeout=5
            )
            return result.returncode == 0
        except:
            print("Warning: ffmpeg not found. Audio processing features limited.")
            return False
    
    def get_duration(self, audio_file: Path) -> Optional[float]:
        """Get duration of audio file in seconds"""
        if not self.ffmpeg_available:
            return None
        
        try:
            import subprocess
            import json
            
            result = subprocess.run(
                [
                    'ffprobe',
                    '-v', 'quiet',
                    '-print_format', 'json',
                    '-show_format',
                    str(audio_file)
                ],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if result.returncode == 0:
                data = json.loads(result.stdout)
                return float(data['format']['duration'])
            
            return None
        except Exception as e:
            print(f"Error getting audio duration: {e}")
            return None
    
    def concatenate_audio(
        self,
        audio_files: List[Path],
        output_file: Path,
        crossfade_duration: float = 0.1
    ) -> Optional[Path]:
        """Concatenate multiple audio files"""
        if not self.ffmpeg_available:
            print("Audio concatenation requires ffmpeg")
            return None
        
        try:
            import subprocess
            
            # Create concat file list
            concat_file = output_file.parent / "concat_list.txt"
            with open(concat_file, 'w') as f:
                for audio_file in audio_files:
                    f.write(f"file '{audio_file.absolute()}'\n")
            
            # Run ffmpeg
            subprocess.run(
                [
                    'ffmpeg',
                    '-f', 'concat',
                    '-safe', '0',
                    '-i', str(concat_file),
                    '-c', 'copy',
                    str(output_file)
                ],
                check=True,
                capture_output=True,
                timeout=60
            )
            
            # Clean up
            concat_file.unlink()
            
            print(f"✓ Audio files concatenated: {output_file}")
            return output_file
            
        except Exception as e:
            print(f"Error concatenating audio: {e}")
            return None
    
    def adjust_speed(
        self,
        audio_file: Path,
        output_file: Path,
        speed_factor: float = 1.0
    ) -> Optional[Path]:
        """Adjust playback speed of audio (1.0 = normal, 1.5 = 50% faster)"""
        if not self.ffmpeg_available:
            return None
        
        try:
            import subprocess
            
            subprocess.run(
                [
                    'ffmpeg',
                    '-i', str(audio_file),
                    '-filter:a', f'atempo={speed_factor}',
                    str(output_file)
                ],
                check=True,
                capture_output=True,
                timeout=60
            )
            
            return output_file
            
        except Exception as e:
            print(f"Error adjusting speed: {e}")
            return None
    
    def normalize_volume(
        self,
        audio_file: Path,
        output_file: Path,
        target_level: str = "-16"
    ) -> Optional[Path]:
        """Normalize audio volume"""
        if not self.ffmpeg_available:
            return None
        
        try:
            import subprocess
            
            subprocess.run(
                [
                    'ffmpeg',
                    '-i', str(audio_file),
                    '-af', f'loudnorm=I={target_level}',
                    str(output_file)
                ],
                check=True,
                capture_output=True,
                timeout=60
            )
            
            return output_file
            
        except Exception as e:
            print(f"Error normalizing volume: {e}")
            return None
    
    def add_background_music(
        self,
        voice_file: Path,
        music_file: Path,
        output_file: Path,
        music_volume: float = 0.2
    ) -> Optional[Path]:
        """Mix voice with background music"""
        if not self.ffmpeg_available:
            return None
        
        try:
            import subprocess
            
            subprocess.run(
                [
                    'ffmpeg',
                    '-i', str(voice_file),
                    '-i', str(music_file),
                    '-filter_complex',
                    f'[1:a]volume={music_volume}[bg];[0:a][bg]amix=inputs=2:duration=first',
                    str(output_file)
                ],
                check=True,
                capture_output=True,
                timeout=60
            )
            
            return output_file
            
        except Exception as e:
            print(f"Error adding background music: {e}")
            return None
    
    def convert_format(
        self,
        audio_file: Path,
        output_format: str = "mp3",
        bitrate: str = "192k"
    ) -> Optional[Path]:
        """Convert audio to different format"""
        if not self.ffmpeg_available:
            return None
        
        try:
            import subprocess
            
            output_file = audio_file.with_suffix(f'.{output_format}')
            
            subprocess.run(
                [
                    'ffmpeg',
                    '-i', str(audio_file),
                    '-b:a', bitrate,
                    str(output_file)
                ],
                check=True,
                capture_output=True,
                timeout=60
            )
            
            return output_file
            
        except Exception as e:
            print(f"Error converting format: {e}")
            return None
