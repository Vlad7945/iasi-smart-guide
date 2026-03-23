"""
Iași Smart Guide - Flask Backend
Main application with DeepSeek API integration for intelligent tourist assistance
"""

from flask import Flask, render_template, request, jsonify
from openai import OpenAI
import json
import os
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['JSON_SORT_KEYS'] = False

# Initialize DeepSeek client (using OpenAI-compatible API)
client = OpenAI(
    api_key=os.getenv('DEEPSEEK_API_KEY'),
    base_url="https://api.deepseek.com"
)

# Global conversation history (in-memory for MVP. Use Redis/DB for production)
conversation_history = []
MAX_HISTORY = 20  # Keep last 20 messages for context

# Load palace knowledge base - reload on each request to get latest changes
def load_palace_data():
    """Load palace data from JSON - fresh load each time"""
    # Use absolute path to ensure it works on Railway and other hosting
    palace_data_path = os.path.join(os.path.dirname(__file__), 'palace_data.json')
    with open(palace_data_path, 'r', encoding='utf-8') as f:
        return json.load(f)

# ============================================================================
# SYSTEM PROMPTS & CONTEXT BUILDING
# ============================================================================

def build_system_prompt():
    """
    Build comprehensive system prompt with palace context
    This gives DeepSeek deep knowledge about the palace
    """
    
    palace_data = load_palace_data()
    palace_info = palace_data['palace_info']
    rooms_info = json.dumps(palace_data['floors'], indent=2)
    facilities = json.dumps(palace_data['facilities'], indent=2)
    accessibility = json.dumps(palace_data['accessibility'], indent=2)
    culture = json.dumps(palace_data['culture'], indent=2)
    
    system_prompt = f"""You are a warm, knowledgeable, and enthusiastic tour guide for the Palace of Culture (Palatul Culturii) in Iași, Romania.

ABOUT THE PALACE:
Name: {palace_info['name']} ({palace_info['official_name']})
Location: {palace_info['location']}
Built: {palace_info['built_years']}
Hours: {palace_info['opening_hours']}
Closed: {palace_info['closed_days']}
Phone: {palace_info['phone']}

Description: {palace_info['description']}

PALACE STRUCTURE & ROOMS:
{rooms_info}

FACILITIES AVAILABLE:
{facilities}

ACCESSIBILITY INFORMATION:
{accessibility}

MOLDAVIAN CULTURE & TRADITIONS:
{culture}

YOUR INTERACTION GUIDELINES:

1. NAVIGATION QUESTIONS:
   - Always mention specific floor numbers and room names
   - For accessibility needs, provide wheelchair routes and elevator information
   - Give clear, step-by-step directions

2. CULTURAL & FOOD QUESTIONS:
   - Share interesting cultural facts and local traditions
   - Explain food pronunciation and what makes dishes special
   - Explain etiquette and local customs warmly

3. RESPONSE STYLE:
   - Keep responses concise (2-3 sentences typically, unless asked for details)
   - Be friendly and enthusiastic about Moldavian culture
   - Use the user's language (Romanian or English)
   - Always end with a helpful question: "Would you like to know anything else?"
   - DO NOT use markdown formatting, bold text (**), or any special characters in formatting
   - Write in clear, plain text sentences that are easy to read
   - Ensure every sentence ends with a period (.)

4. SPECIAL HANDLING:
   - For "I don't know" situations: "That's a great question! Let me help connect you with our information desk staff who specialize in that."
   - For emergency: "Please ask staff at the information desk immediately or call {palace_info['phone']}"
   - For pricing/tickets: "Please check www.palatulculturii.ro or ask at the information desk"

5. RESPONSE CATEGORIES:
   - Navigation/Facilities → Quick, specific location info
   - Culture/History → Engaging stories and cultural context
   - Accessibility → Detailed alternative options
   - Food → Pronunciation tips + cultural significance
   - Timing → Current hours and recommendations

CURRENT TIME: {datetime.now().strftime('%Y-%m-%d %H:%M')}

Remember: You're talking to tourists who may be tired, confused, or overwhelmed. Be patient, helpful, and make them feel welcomed to Moldavian culture.
"""
    return system_prompt

# ============================================================================
# DEEPSEEK API INTEGRATION
# ============================================================================

def clean_response(text):
    """
    Clean up response text to remove markdown formatting and ensure proper punctuation
    """
    # Remove markdown bold formatting (**text**)
    text = text.replace('**', '')
    
    # Remove markdown italic formatting (*text*)
    text = text.replace('*', '')
    
    # Split into sentences and clean them up
    import re
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    
    cleaned_sentences = []
    for sentence in sentences:
        sentence = sentence.strip()
        if sentence:
            # Ensure sentence ends with proper punctuation
            if not sentence.endswith(('.', '!', '?')):
                sentence += '.'
            cleaned_sentences.append(sentence)
    
    # Join sentences with proper spacing
    result = ' '.join(cleaned_sentences)
    
    # Ensure the final result ends with a period if it doesn't end with punctuation
    if result and not result.endswith(('.', '!', '?')):
        result += '.'
    
    return result

def get_deepseek_response(user_message):
    """
    Send message to DeepSeek with conversation history
    Returns the assistant's response
    """
    global conversation_history
    
    # Add user message to history
    conversation_history.append({
        "role": "user",
        "content": user_message
    })
    
    # Keep only last N messages for context window efficiency
    if len(conversation_history) > MAX_HISTORY:
        conversation_history = conversation_history[-MAX_HISTORY:]
    
    try:
        # Build messages with system prompt
        messages = [
            {"role": "system", "content": build_system_prompt()}
        ] + conversation_history
        
        # Call DeepSeek API
        response = client.chat.completions.create(
            model="deepseek-chat",
            max_tokens=256,
            messages=messages
        )
        
        assistant_message = response.choices[0].message.content
        
        # Clean up response formatting
        assistant_message = clean_response(assistant_message)
        
        # Add assistant response to history
        conversation_history.append({
            "role": "assistant",
            "content": assistant_message
        })
        
        return assistant_message, True  # success=True
        
    except Exception as e:
        error_msg = f"Sorry, I encountered an error: {str(e)}"
        print(f"DeepSeek API Error: {str(e)}")
        return error_msg, False  # success=False


# ============================================================================
# FLASK ROUTES
# ============================================================================

@app.route('/')
def index():
    """Serve the main chat interface"""
    response = render_template('index.html')
    # Prevent caching of HTML
    response = app.make_response(response)
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response


@app.route('/chat', methods=['POST'])
def chat():
    """
    Main chat endpoint
    Receives user message, returns AI response
    """
    try:
        data = request.json
        user_message = data.get('message', '').strip()
        
        if not user_message:
            return jsonify({
                'error': 'Empty message',
                'response': 'Please type a question first!'
            }), 400
        
        if len(user_message) > 500:
            return jsonify({
                'error': 'Message too long',
                'response': 'Please keep your question under 500 characters.'
            }), 400
        
        # Get response from DeepSeek
        response_text, success = get_deepseek_response(user_message)
        
        return jsonify({
            'response': response_text,
            'success': success,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"Chat endpoint error: {str(e)}")
        return jsonify({
            'error': 'Server error',
            'response': 'An unexpected error occurred. Please try again.',
            'success': False
        }), 500


@app.route('/reset', methods=['POST'])
def reset_conversation():
    """Reset conversation history (for testing)"""
    global conversation_history
    conversation_history = []
    return jsonify({'status': 'Conversation reset'})


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'online',
        'service': 'Iași Smart Guide - Palace of Culture',
        'api_key_loaded': bool(os.getenv('DEEPSEEK_API_KEY'))
    })


@app.route('/suggestions', methods=['GET'])
def get_suggestions():
    """
    Return suggested questions for tourists
    Helps with UX by providing quick-start options
    """
    suggestions = [
        "Where are the restrooms?",
        "What's on the second floor?",
        "Tell me about Moldavian traditions",
        "What traditional food should I try?",
        "Is the palace accessible for wheelchairs?",
        "How long does a visit usually take?",
        "What's the best time to visit?",
        "Can I take photos here?"
    ]
    return jsonify({'suggestions': suggestions})


@app.route('/api/palace-data', methods=['GET'])
def get_palace_data_api():
    """
    Return palace data for frontend to render rooms
    """
    response = jsonify(load_palace_data())
    # Prevent caching of API response
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response


# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def server_error(error):
    return jsonify({'error': 'Internal server error'}), 500


# ============================================================================
# MAIN
# ============================================================================

if __name__ == '__main__':
    # Check for API key
    if not os.getenv('DEEPSEEK_API_KEY'):
        print("WARNING: DEEPSEEK_API_KEY not found in environment!")
        print("Please create .env file with: DEEPSEEK_API_KEY=your_key_here")
        exit(1)
    
    print("""
    ===============================================================
    Iași Smart Guide - Palace of Culture v1.0
    
    Starting Flask server...
    Visit: http://localhost:5001
    
    Press Ctrl+C to stop
    ===============================================================
    """)
    
    app.run(
        debug=True,
        host='0.0.0.0',
        port=5001,
        threaded=True
    )
