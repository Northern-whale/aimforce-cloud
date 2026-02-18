"""Content Pipeline - Main pipeline orchestration"""

from pathlib import Path
from typing import Optional, Dict, Any, List
from datetime import datetime
import json

from character_system import CharacterManager, Character
from script_engine import ScriptGenerator, ScriptValidator
from script_engine.models import ScriptGenerationRequest, Script
from voice_synthesis import VoiceSynthesizer, AudioProcessor


class ContentPipeline:
    """End-to-end content generation pipeline"""
    
    def __init__(
        self,
        character_manager: CharacterManager,
        script_generator: ScriptGenerator,
        voice_synthesizer: VoiceSynthesizer,
        output_dir: Optional[Path] = None
    ):
        self.character_manager = character_manager
        self.script_generator = script_generator
        self.voice_synthesizer = voice_synthesizer
        self.validator = ScriptValidator()
        self.audio_processor = AudioProcessor()
        
        self.output_dir = output_dir or Path("output")
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def generate_content(
        self,
        character_id: str,
        request: ScriptGenerationRequest,
        generate_audio: bool = True,
        validate: bool = True
    ) -> Dict[str, Any]:
        """
        Generate complete content piece
        
        Returns dict with:
        - script: Script object
        - audio_files: Dict of audio file paths (if generated)
        - validation: Validation results (if enabled)
        - metadata: Additional info
        """
        start_time = datetime.utcnow()
        
        # Get character
        character = self.character_manager.get_character(character_id)
        if not character:
            raise ValueError(f"Character {character_id} not found")
        
        # Generate script
        print(f"Generating script for {character.profile.name}...")
        script = self.script_generator.generate_script(character, request)
        
        # Validate script
        validation_results = None
        if validate:
            print("Validating script...")
            is_valid, issues = self.validator.validate(script)
            engagement_score = self.validator.score_engagement_potential(script)
            
            validation_results = {
                'is_valid': is_valid,
                'issues': issues,
                'engagement_score': engagement_score
            }
            
            if not is_valid:
                print(f"⚠️  Validation issues found:")
                for issue in issues:
                    print(f"   - {issue}")
            
            print(f"📊 Engagement score: {engagement_score['total_score']}/100 (Grade: {engagement_score['grade']})")
        
        # Generate audio
        audio_files = None
        if generate_audio:
            print("Generating voice audio...")
            audio_files = self.voice_synthesizer.synthesize_script_sections(
                script,
                character.profile.voice,
                output_prefix=f"{character.profile.character_id}_{script.script_id}"
            )
            
            # Get audio duration if available
            if audio_files.get('full') and self.audio_processor.ffmpeg_available:
                actual_duration = self.audio_processor.get_duration(audio_files['full'])
                if actual_duration:
                    print(f"⏱️  Actual audio duration: {actual_duration:.1f}s (target: {script.total_duration_seconds}s)")
        
        # Update character context
        character.update_context(f"Generated {request.content_type} content for {request.business_name}")
        
        # Save results
        result = {
            'script': script,
            'audio_files': audio_files,
            'validation': validation_results,
            'metadata': {
                'character_id': character_id,
                'character_name': character.profile.name,
                'business_name': request.business_name,
                'content_type': request.content_type,
                'content_format': request.content_format,
                'generation_time': (datetime.utcnow() - start_time).total_seconds(),
                'timestamp': datetime.utcnow().isoformat()
            }
        }
        
        # Save to file
        self._save_result(result)
        
        end_time = datetime.utcnow()
        generation_time = (end_time - start_time).total_seconds()
        print(f"✅ Content generated in {generation_time:.1f}s")
        
        return result
    
    def generate_batch(
        self,
        character_id: str,
        requests: List[ScriptGenerationRequest],
        generate_audio: bool = True
    ) -> List[Dict[str, Any]]:
        """Generate multiple content pieces"""
        results = []
        
        for i, request in enumerate(requests):
            print(f"\n{'='*60}")
            print(f"Generating content {i+1}/{len(requests)}: {request.content_type}")
            print(f"{'='*60}")
            
            try:
                result = self.generate_content(
                    character_id,
                    request,
                    generate_audio=generate_audio
                )
                results.append(result)
            except Exception as e:
                print(f"❌ Error generating content: {e}")
                results.append({
                    'error': str(e),
                    'request': request
                })
        
        return results
    
    def _save_result(self, result: Dict[str, Any]):
        """Save generation result to file"""
        timestamp = int(datetime.utcnow().timestamp())
        character_id = result['metadata']['character_id']
        
        # Create output directory for this character
        char_output_dir = self.output_dir / character_id
        char_output_dir.mkdir(parents=True, exist_ok=True)
        
        # Save script as JSON
        script_file = char_output_dir / f"script_{timestamp}.json"
        script_data = result['script'].model_dump(mode='json')
        
        with open(script_file, 'w') as f:
            json.dump(script_data, f, indent=2, default=str)
        
        # Save full result
        result_file = char_output_dir / f"result_{timestamp}.json"
        result_data = {
            'script': script_data,
            'validation': result['validation'],
            'metadata': result['metadata'],
            'audio_files': {
                k: str(v) if v else None
                for k, v in (result['audio_files'] or {}).items()
            }
        }
        
        with open(result_file, 'w') as f:
            json.dump(result_data, f, indent=2, default=str)
        
        print(f"💾 Results saved to {result_file}")
    
    def create_content_package(
        self,
        result: Dict[str, Any],
        include_visuals: bool = False
    ) -> Path:
        """
        Create a complete content package for delivery
        
        Returns: Path to package directory
        """
        package_dir = self.output_dir / "packages" / f"package_{int(datetime.utcnow().timestamp())}"
        package_dir.mkdir(parents=True, exist_ok=True)
        
        # Copy script
        script = result['script']
        script_file = package_dir / "script.txt"
        with open(script_file, 'w') as f:
            f.write(f"{script.title}\n")
            f.write(f"{'='*60}\n\n")
            f.write(f"HOOK ({script.hook.duration_seconds}s):\n{script.hook.content}\n\n")
            f.write(f"STORY ({script.story.duration_seconds}s):\n{script.story.content}\n\n")
            f.write(f"CALL TO ACTION ({script.call_to_action.duration_seconds}s):\n{script.call_to_action.content}\n\n")
            
            if script.caption:
                f.write(f"\nSOCIAL MEDIA CAPTION:\n{script.caption}\n")
        
        # Copy audio files
        if result.get('audio_files'):
            audio_dir = package_dir / "audio"
            audio_dir.mkdir(exist_ok=True)
            
            import shutil
            for section, audio_path in result['audio_files'].items():
                if audio_path and Path(audio_path).exists():
                    dest = audio_dir / f"{section}.mp3"
                    shutil.copy(audio_path, dest)
        
        # Create README
        readme = package_dir / "README.txt"
        with open(readme, 'w') as f:
            f.write(f"Content Package\n")
            f.write(f"{'='*60}\n\n")
            f.write(f"Character: {result['metadata']['character_name']}\n")
            f.write(f"Business: {result['metadata']['business_name']}\n")
            f.write(f"Content Type: {result['metadata']['content_type']}\n")
            f.write(f"Format: {result['metadata']['content_format']}\n")
            f.write(f"Generated: {result['metadata']['timestamp']}\n\n")
            
            if result.get('validation'):
                val = result['validation']
                f.write(f"Quality Score: {val['engagement_score']['total_score']}/100 ")
                f.write(f"(Grade: {val['engagement_score']['grade']})\n")
                f.write(f"Recommendation: {val['engagement_score']['recommendation']}\n\n")
            
            f.write(f"Files included:\n")
            f.write(f"- script.txt: Full script with sections\n")
            if result.get('audio_files'):
                f.write(f"- audio/: Voice recordings (hook, story, cta, full)\n")
        
        print(f"📦 Content package created: {package_dir}")
        return package_dir
