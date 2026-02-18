"""Script Templates Library - Pre-built templates for different content types"""

from typing import Dict, List
from .models import ScriptTemplate


class TemplateLibrary:
    """Library of script templates"""
    
    def __init__(self):
        self.templates: Dict[str, ScriptTemplate] = {}
        self._load_default_templates()
    
    def _load_default_templates(self):
        """Load all default templates"""
        
        # Pet Store Templates
        self.register_template(ScriptTemplate(
            template_id="pet_store_product_review",
            name="Pet Product Review",
            business_type="pet_store",
            content_type="product_review",
            hook_template="🐾 Hey pet parents! {character_name} here, and I just tried the {product_name}!",
            story_template="So here's the deal - {product_description}. As someone who knows good pet stuff, I gotta say {opinion}. The best part? {benefit}! Plus {extra_detail}.",
            cta_template="Want to spoil your furry friend? Head to {business_name} and check it out! Tell them {character_name} sent you! 🐕",
            target_duration=30,
            required_inputs=["character_name", "product_name", "product_description", "opinion", "benefit", "extra_detail", "business_name"],
            category="pet_store",
            tags=["product", "review", "pet"],
        ))
        
        self.register_template(ScriptTemplate(
            template_id="pet_store_tour",
            name="Store Tour",
            business_type="pet_store",
            content_type="day_in_life",
            hook_template="🏪 Follow me! I'm {character_name} and I'm about to show you the coolest pet store in {location}!",
            story_template="First stop - {section_1}! This is where the magic happens. Then we've got {section_2}, which is basically paradise for pets. And wait til you see {section_3} - it's my favorite spot!",
            cta_template="Come visit us at {business_name} in {location}! Your pets will thank you! 💙",
            target_duration=45,
            required_inputs=["character_name", "location", "section_1", "section_2", "section_3", "business_name"],
            category="pet_store",
            tags=["tour", "store", "showcase"],
        ))
        
        self.register_template(ScriptTemplate(
            template_id="pet_store_tip",
            name="Pet Care Tip",
            business_type="pet_store",
            content_type="educational",
            hook_template="🎓 Quick pet tip! {character_name} here with something every pet parent should know!",
            story_template="Did you know {fact}? Here's the thing - {explanation}. Try this: {tip}. Trust me, {benefit}!",
            cta_template="For more pet tips and amazing products, visit {business_name}! Follow for more! ✨",
            target_duration=20,
            required_inputs=["character_name", "fact", "explanation", "tip", "benefit", "business_name"],
            category="pet_store",
            tags=["educational", "tips", "advice"],
        ))
        
        # Restaurant Templates
        self.register_template(ScriptTemplate(
            template_id="restaurant_menu_highlight",
            name="Menu Item Spotlight",
            business_type="restaurant",
            content_type="product_review",
            hook_template="🍽️ Okay food lovers, you NEED to try this! I'm {character_name} and this is {dish_name}!",
            story_template="{dish_description} - and let me tell you, {taste_description}. The {best_element} is absolutely incredible. Chef {chef_name} really outdid themselves!",
            cta_template="Come taste it yourself at {business_name}! {special_offer} Open {hours}! 🔥",
            target_duration=25,
            required_inputs=["character_name", "dish_name", "dish_description", "taste_description", "best_element", "chef_name", "business_name", "special_offer", "hours"],
            category="restaurant",
            tags=["food", "menu", "review"],
        ))
        
        self.register_template(ScriptTemplate(
            template_id="restaurant_behind_scenes",
            name="Behind the Scenes",
            business_type="restaurant",
            content_type="day_in_life",
            hook_template="🎬 Ever wonder what happens behind the kitchen doors? {character_name} here with an exclusive look!",
            story_template="This is where the magic happens at {business_name}! {chef_action} - that's chef {chef_name} making {specialty}. Every dish is made with {quality_description}. See that attention to detail? That's what makes us special!",
            cta_template="Experience it yourself! Reserve your table at {business_name}. Link in bio! 👨‍🍳",
            target_duration=35,
            required_inputs=["character_name", "business_name", "chef_action", "chef_name", "specialty", "quality_description"],
            category="restaurant",
            tags=["behind-scenes", "kitchen", "process"],
        ))
        
        # Retail Templates
        self.register_template(ScriptTemplate(
            template_id="retail_new_arrival",
            name="New Arrival Announcement",
            business_type="retail",
            content_type="product_showcase",
            hook_template="🆕 STOP SCROLLING! {character_name} here and we just got {product_name} in stock!",
            story_template="I've been waiting for this! {product_description}. It comes in {options} and it's perfect for {use_case}. Already flying off the shelves!",
            cta_template="Get yours before they're gone! Visit {business_name} in {location} or shop online! 🛍️",
            target_duration=20,
            required_inputs=["character_name", "product_name", "product_description", "options", "use_case", "business_name", "location"],
            category="retail",
            tags=["product", "announcement", "new"],
        ))
        
        self.register_template(ScriptTemplate(
            template_id="retail_how_to_style",
            name="How to Style",
            business_type="retail",
            content_type="educational",
            hook_template="✨ Style tip alert! {character_name} showing you {styling_theme}!",
            story_template="Here's the secret: start with {item_1}, then add {item_2}. The key is {styling_tip}. This combo? *Chef's kiss* Perfect for {occasion}!",
            cta_template="Shop the look at {business_name}! Everything you see is in store now! 💕",
            target_duration=30,
            required_inputs=["character_name", "styling_theme", "item_1", "item_2", "styling_tip", "occasion", "business_name"],
            category="retail",
            tags=["styling", "how-to", "fashion"],
        ))
        
        # Service Business Templates
        self.register_template(ScriptTemplate(
            template_id="service_before_after",
            name="Before & After Transformation",
            business_type="service",
            content_type="showcase",
            hook_template="😱 Wait for the transformation! {character_name} here with another amazing before & after!",
            story_template="Started with {before_description}. After {service_description} at {business_name}, look at this result! {after_description}. The difference is incredible!",
            cta_template="Ready for your transformation? Book now at {business_name}! {special_offer} 🌟",
            target_duration=25,
            required_inputs=["character_name", "before_description", "service_description", "business_name", "after_description", "special_offer"],
            category="service",
            tags=["before-after", "transformation", "results"],
        ))
        
        self.register_template(ScriptTemplate(
            template_id="service_customer_story",
            name="Customer Success Story",
            business_type="service",
            content_type="testimonial",
            hook_template="💬 Real talk - {character_name} here with {customer_name}'s story!",
            story_template="{customer_name} came to {business_name} because {problem}. After working with our team, {solution}. Now? {result}! This is why we do what we do!",
            cta_template="Ready to write your success story? Contact {business_name} today! 📞",
            target_duration=30,
            required_inputs=["character_name", "customer_name", "business_name", "problem", "solution", "result"],
            category="service",
            tags=["testimonial", "customer", "success"],
        ))
        
        # Seasonal Templates
        self.register_template(ScriptTemplate(
            template_id="seasonal_holiday",
            name="Holiday Special",
            business_type="general",
            content_type="seasonal",
            hook_template="🎉 {holiday} is here! {character_name} with something special!",
            story_template="This {holiday} season, {business_name} is bringing you {special_offer}! Because {reason}. Plus, {extra_perk}!",
            cta_template="Celebrate with us! Visit {business_name} and mention this video for {discount}! {urgency} 🎊",
            target_duration=25,
            required_inputs=["holiday", "character_name", "business_name", "special_offer", "reason", "extra_perk", "discount", "urgency"],
            category="seasonal",
            tags=["holiday", "special", "promotion"],
        ))
        
        # FAQ/Educational Templates
        self.register_template(ScriptTemplate(
            template_id="faq_quick_answer",
            name="FAQ Quick Answer",
            business_type="general",
            content_type="educational",
            hook_template="❓ Common question! {character_name} here - people always ask: '{question}'",
            story_template="Great question! Here's the answer: {answer}. The reason is {explanation}. Pro tip: {bonus_tip}!",
            cta_template="More questions? Ask in comments or visit {business_name}! We love helping! 💡",
            target_duration=20,
            required_inputs=["character_name", "question", "answer", "explanation", "bonus_tip", "business_name"],
            category="educational",
            tags=["faq", "educational", "tips"],
        ))
    
    def register_template(self, template: ScriptTemplate):
        """Add template to library"""
        self.templates[template.template_id] = template
    
    def get_template(self, template_id: str) -> ScriptTemplate:
        """Get template by ID"""
        if template_id not in self.templates:
            raise ValueError(f"Template '{template_id}' not found")
        return self.templates[template_id]
    
    def list_templates(
        self,
        business_type: str = None,
        content_type: str = None,
        category: str = None
    ) -> List[ScriptTemplate]:
        """List templates with optional filters"""
        templates = list(self.templates.values())
        
        if business_type:
            templates = [t for t in templates if t.business_type == business_type or t.business_type == "general"]
        
        if content_type:
            templates = [t for t in templates if t.content_type == content_type]
        
        if category:
            templates = [t for t in templates if t.category == category]
        
        return templates
    
    def get_template_by_name(self, name: str) -> ScriptTemplate:
        """Get template by name"""
        for template in self.templates.values():
            if template.name.lower() == name.lower():
                return template
        raise ValueError(f"Template with name '{name}' not found")
