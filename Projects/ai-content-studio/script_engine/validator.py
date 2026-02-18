"""Script Validator - Quality assurance for generated scripts"""

from typing import List, Dict, Tuple
from .models import Script


class ScriptValidator:
    """Validate script quality and engagement potential"""
    
    def __init__(self):
        self.min_word_count = 50
        self.max_word_count = 200
        self.min_hook_length = 10
        self.max_duration = 90
    
    def validate(self, script: Script) -> Tuple[bool, List[str]]:
        """
        Validate script and return (is_valid, list_of_issues)
        """
        issues = []
        
        # Check duration
        if script.total_duration_seconds > self.max_duration:
            issues.append(f"Script too long: {script.total_duration_seconds}s (max: {self.max_duration}s)")
        
        if script.total_duration_seconds < 15:
            issues.append(f"Script too short: {script.total_duration_seconds}s (min: 15s)")
        
        # Check word count
        if script.word_count < self.min_word_count:
            issues.append(f"Script too brief: {script.word_count} words (min: {self.min_word_count})")
        
        if script.word_count > self.max_word_count:
            issues.append(f"Script too wordy: {script.word_count} words (max: {self.max_word_count})")
        
        # Check hook
        if len(script.hook.content) < self.min_hook_length:
            issues.append("Hook too short - needs to grab attention")
        
        if not self._has_hook_element(script.hook.content):
            issues.append("Hook lacks attention-grabbing element (question, emotion, surprise)")
        
        # Check CTA
        if not self._has_clear_cta(script.call_to_action.content):
            issues.append("Call-to-action is unclear or missing")
        
        # Check for common issues
        issues.extend(self._check_content_quality(script))
        
        is_valid = len(issues) == 0
        return is_valid, issues
    
    def _has_hook_element(self, hook: str) -> bool:
        """Check if hook has attention-grabbing elements"""
        hook_lower = hook.lower()
        
        # Check for questions
        if '?' in hook:
            return True
        
        # Check for emotional words
        emotional_words = ['amazing', 'incredible', 'love', 'excited', 'wow', 'omg', 'stop']
        if any(word in hook_lower for word in emotional_words):
            return True
        
        # Check for emojis (simplified check)
        if any(c in hook for c in '🎉💙❤️😍🔥✨🐾'):
            return True
        
        # Check for action words
        action_words = ['check', 'look', 'watch', 'see', 'discover', 'follow']
        if any(word in hook_lower for word in action_words):
            return True
        
        return False
    
    def _has_clear_cta(self, cta: str) -> bool:
        """Check if CTA is clear and actionable"""
        cta_lower = cta.lower()
        
        action_verbs = [
            'visit', 'come', 'check', 'follow', 'like', 'share', 
            'subscribe', 'buy', 'shop', 'order', 'call', 'book',
            'get', 'try', 'join', 'sign up'
        ]
        
        return any(verb in cta_lower for verb in action_verbs)
    
    def _check_content_quality(self, script: Script) -> List[str]:
        """Check for content quality issues"""
        issues = []
        full_text = script.full_script.lower()
        
        # Check for repetition
        words = full_text.split()
        if len(words) != len(set(words)):
            word_counts = {}
            for word in words:
                if len(word) > 4:  # Only check longer words
                    word_counts[word] = word_counts.get(word, 0) + 1
            
            repeated = [w for w, c in word_counts.items() if c > 2]
            if repeated:
                issues.append(f"Repetitive words detected: {', '.join(repeated[:3])}")
        
        # Check for business name mention
        if script.call_to_action and not any(
            word in script.call_to_action.content.lower() 
            for word in ['visit', 'check out', 'shop', 'come to']
        ):
            issues.append("CTA should mention how to find the business")
        
        # Check tone appropriateness
        inappropriate_words = ['hate', 'stupid', 'dumb', 'sucks', 'terrible']
        if any(word in full_text for word in inappropriate_words):
            issues.append("Script contains inappropriate language")
        
        return issues
    
    def score_engagement_potential(self, script: Script) -> Dict[str, any]:
        """Score the engagement potential of a script"""
        score = 0.0
        factors = {}
        
        # Hook quality (30 points)
        hook_score = 0
        if self._has_hook_element(script.hook.content):
            hook_score += 15
        if len(script.hook.content) > 20:
            hook_score += 10
        if '?' in script.hook.content:
            hook_score += 5
        factors['hook'] = min(hook_score, 30)
        score += factors['hook']
        
        # Story quality (40 points)
        story_score = 0
        word_count = len(script.story.content.split())
        if 50 <= word_count <= 150:
            story_score += 20
        elif word_count > 0:
            story_score += 10
        
        # Check for specifics
        if any(char.isdigit() for char in script.story.content):
            story_score += 5  # Numbers add credibility
        
        # Check for emojis
        emoji_count = sum(1 for c in script.story.content if ord(c) > 127)
        if 1 <= emoji_count <= 5:
            story_score += 10
        elif emoji_count > 5:
            story_score += 5
        
        # Check for variety
        sentences = script.story.content.count('.') + script.story.content.count('!') + script.story.content.count('?')
        if sentences >= 3:
            story_score += 5
        
        factors['story'] = min(story_score, 40)
        score += factors['story']
        
        # CTA quality (20 points)
        cta_score = 0
        if self._has_clear_cta(script.call_to_action.content):
            cta_score += 15
        if '!' in script.call_to_action.content:
            cta_score += 5
        factors['cta'] = min(cta_score, 20)
        score += factors['cta']
        
        # Overall quality (10 points)
        overall_score = 0
        if script.total_duration_seconds <= 60:
            overall_score += 5  # Shorter is often better
        if script.word_count <= 150:
            overall_score += 5
        factors['overall'] = overall_score
        score += factors['overall']
        
        return {
            'total_score': min(score, 100),
            'factors': factors,
            'grade': self._get_grade(score),
            'recommendation': self._get_recommendation(score)
        }
    
    def _get_grade(self, score: float) -> str:
        """Convert score to letter grade"""
        if score >= 90:
            return 'A'
        elif score >= 80:
            return 'B'
        elif score >= 70:
            return 'C'
        elif score >= 60:
            return 'D'
        else:
            return 'F'
    
    def _get_recommendation(self, score: float) -> str:
        """Get recommendation based on score"""
        if score >= 85:
            return "Excellent! Ready to publish."
        elif score >= 70:
            return "Good! Minor tweaks recommended."
        elif score >= 60:
            return "Acceptable. Consider revisions for better engagement."
        else:
            return "Needs improvement. Regenerate or edit significantly."
