# 🏛️ Iași Smart Guide - Palace of Culture

A conversational AI tourist assistant for the Palace of Culture in Iași, Romania. Modern, responsive, and built for real travelers.

**Status:** MVP v1.0 (Interactive Palace of Culture Guide - Production Ready)

---

## 🎯 What is This?

A chat interface that helps tourists navigate, understand, and explore the Palace of Culture using conversational AI. Ask anything:

- "Where are the restrooms?" → Get exact location + accessibility info
- "Tell me about Moldavian traditions" → Rich cultural context
- "What should I eat?" → Traditional food recommendations with pronunciation
- "Is it wheelchair accessible?" → Detailed accessibility information

**Technology Stack:**
- **Backend:** Python + Flask
- **AI Model:** DeepSeek Chat (OpenAI-compatible API)
- **Frontend:** Modern HTML5 + CSS3 + Vanilla JavaScript
- **Data:** JSON knowledge base (no external database)
- **Cost:** ~$0.14 per 1M tokens (highly efficient)

---

## ⚡ Quick Start (5 Minutes)

### 1. Prerequisites
- Python 3.9+
- DeepSeek API key (sign up at [platform.deepseek.com](https://platform.deepseek.com))

### 2. Setup

```bash
# Navigate to project
cd iasi-smart-guide

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure API

Edit `app.py` and set your DeepSeek API key:
```python
client = OpenAI(
    api_key="your-deepseek-api-key-here",
    base_url="https://api.deepseek.com"
)
```

### 4. Run

```bash
python app.py
```

Visit: **http://localhost:5001**

---

## 📁 Project Structure

```
iasi-smart-guide/
├── app.py                          # Flask backend + DeepSeek integration
├── palace_data.json                # Knowledge base with palace information
├── requirements.txt                # Python dependencies
├── README.md                       # This file
├── templates/
│   └── index.html                 # Professional chat UI
└── static/
    ├── css/
    │   └── style.css              # Modern responsive styling
    ├── js/
    │   ├── main.js                # Chat logic & event handling
    │   └── data.js                # Palace data loader
```

---

## 🏗️ Architecture

### Data Flow

```
User Types Message (Browser)
         ↓
JavaScript sends /chat request
         ↓
Flask loads palace_data.json (fresh on each request)
         ↓
Builds system prompt with palace context
         ↓
Sends to DeepSeek API via OpenAI SDK
         ↓
Receives response from AI model
         ↓
Returns to frontend
         ↓
Displays in chat bubble with typing indicator
```

### Key Features

- **Dynamic Data Loading:** `palace_data.json` loads fresh on every API call (no server caching)
- **No Browser Cache:** HTTP headers prevent client-side caching
- **Professional UI:** Modern chat interface with room browsing sidebar
- **Room Information:** Browse 9 palace rooms with descriptions, highlights, accessibility info
- **Floor Navigation:** Ground Floor, First Floor, Second Floor organization

### Knowledge Base Structure

`palace_data.json` contains:

```json
{
  "palace_info": {
    "name": "Palace of Culture",
    "architects": ["Ion D. Berindey", "Alexandru D. Xenopol", "Grigore Cerchez"],
    "height": "55m",
    "hours": "Wednesday-Sunday 10:00-17:00",
    "phone": "+40 232 275 979"
  },
  "floors": [
    {
      "floor_number": 0,
      "floor_name": "Ground floor",
      "rooms": [...]
    },
    {
      "floor_number": 1,
      "floor_name": "First floor",
      "rooms": [...]
    }
  ],
  "facilities": {...},
  "accessibility": {...},
  "culture": {
    "traditions": [...],
    "food": [...]
  }
}
```

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/` | GET | Serve chat interface |
| `/chat` | POST | Send user message, get AI response |
| `/api/palace-data` | GET | Get palace data JSON |
| `/reset` | POST | Clear conversation history (testing) |
| `/health` | GET | Check API health status |

### Room Categories

The palace contains these types of rooms:
- **Museums:** History Museum, Science Museum, Art Museum, Ethnographic Museum
- **Historic Halls:** Voivodes' Hall, Honor Hall
- **Attractions:** Gothic Mosaic Room, Clock Tower

---

## 🎨 Design & Features

### Why This Works

**1. Familiar Chat Interface**
- Reduces cognitive load for stressed travelers
- Professional, modern design (not AI-generated looking)

**2. Mobile-Responsive**
- Optimized for phones (768px, 480px breakpoints)
- Touch-friendly buttons and input
- Works on tablets and desktops

**3. Room Browser**
- Sidebar with palace room listing
- Search and filter by room type
- Click to see room details in chat
- Floor information and accessibility badges

**4. Professional Styling**
- Color scheme: Deep purple (#1a2332) + Gold accent (#b8860b)
- Modern typography and spacing
- Responsive flexbox layout
- Accessibility-focused

**5. Smart Data Loading**
- Fresh palace data on every request (no stale caching)
- No external database dependencies
- Fast JSON-based lookups

**6. Cost-Effective AI**
- DeepSeek API: $0.14 per 1M tokens (vs Claude's higher cost)
- Efficient model for conversational AI
- OpenAI-compatible SDK (easy model swapping)

---

## 💬 Example Conversations

### Example 1: Navigation Question

**Tourist:** "Where are the restrooms?"

**Guide:**
```
The restrooms are available on every floor, conveniently located near the central elevators. 
They are fully accessible and clearly marked on signage. If you need assistance, our 
information desk staff are happy to help!

Would you like to know anything else?
```

### Example 2: Cultural Question

**Tourist:** "What should I eat in Iași?"

**Guide:**
```
You absolutely must try these traditional Moldavian dishes:

🍲 Mămăligă (Muh-muh-lee-guh) - A creamy cornmeal porridge served with sour cream and cheese

🥬 Sarmale (Sarm-ahl-eh) - Tender cabbage rolls stuffed with rice and meat, slow-cooked in tomato sauce. 
Perfect for autumn and winter!

🍖 Mici (MEE-chee) - Grilled meat rolls similar to kebab, served with mustard. A beloved street food!

All of these reflect centuries of Moldavian culinary tradition. I recommend trying them at a local 
restaurant in the Old Town (about 1 km from here).

Would you like pronunciation tips for any of these?
```

### Example 3: Accessibility Question

**Tourist:** "Is the Palace wheelchair accessible?"

**Guide:**
```
Yes! The Palace of Culture is fully wheelchair accessible:

✓ Multiple accessible routes with ramps throughout
✓ Elevators on all main floors (central, east, and west wings)
✓ Accessible restrooms on every floor with grab bars and adequate space
✓ Free wheelchairs available at the information desk
✓ Reserved accessible parking in the adjacent underground garage

Our staff can provide mobility assistance if needed. Please ask at the information desk 
upon arrival, and they'll make sure your visit is comfortable.

Anything else you'd like to know?
```

---

## 🚀 Deployment

### Local Development
```bash
python app.py
# Runs on http://localhost:5001
```

---

## ☁️ Deploy to Cloud (Recommended)

### Option 1: Railway (⭐ Easiest - 5 minutes)

**Requirements:** GitHub account, Railway account (free)

**Steps:**

1. **Create GitHub repo**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/iasi-smart-guide.git
   git branch -M main
   git push -u origin main
   ```

2. **Connect to Railway**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub"
   - Select your repo
   - Wait for automatic detection (it will find your `requirements.txt`)

3. **Add API Key**
   - In Railway dashboard, go to Variables
   - Add: `DEEPSEEK_API_KEY` = `your-key-here`
   - Deploy will auto-restart

4. **Done!**
   - Your app is live at: `https://your-project-name.up.railway.app`
   - Redeploy anytime by pushing to GitHub

**Cost:** Free tier available (~$5/month paid)

---

### Option 2: Heroku (5-10 minutes)

**Requirements:** GitHub account, Heroku account (paid now, ~$7/month)

**Steps:**

1. **Create Procfile** (tells Heroku how to run your app)
   ```
   web: gunicorn app:app
   ```

2. **Install gunicorn**
   ```bash
   pip install gunicorn
   pip freeze > requirements.txt
   ```

3. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add Procfile for Heroku"
   git push origin main
   ```

4. **Deploy via Heroku**
   ```bash
   heroku login
   heroku create your-app-name
   heroku config:set DEEPSEEK_API_KEY="your-key-here"
   git push heroku main
   ```

5. **View logs**
   ```bash
   heroku logs --tail
   ```

**Cost:** $7/month minimum (paid only)

---

### Option 3: Fly.io (5-10 minutes)

**Requirements:** GitHub account, Fly.io account (free tier available)

**Steps:**

1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Launch app**
   ```bash
   fly auth login
   fly launch
   ```

3. **Set secrets**
   ```bash
   fly secrets set DEEPSEEK_API_KEY="your-key-here"
   ```

4. **Deploy**
   ```bash
   fly deploy
   ```

**Cost:** Free tier available (~$3/month for paid)

---

### Option 4: Replit (Easiest - 2 minutes, but slower)

1. Go to [replit.com](https://replit.com)
2. Click "Import from GitHub"
3. Paste your GitHub repo URL
4. Add secret: `DEEPSEEK_API_KEY`
5. Click "Run"

**Cost:** Free (with limitations)

---

### Docker (Advanced - Self-hosted)

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["python", "app.py"]
```

**Build & Run:**
```bash
docker build -t iasi-guide .
docker run -e DEEPSEEK_API_KEY="your-key" -p 5001:5001 iasi-guide
```

---

## 📊 Deployment Comparison

| Platform | Cost | Setup Time | Speed | Free Tier | Best For |
|----------|------|-----------|-------|-----------|----------|
| **Railway** ⭐ | $5/mo | 5 min | Fast | Yes | Easy deployment |
| **Fly.io** | $3/mo | 5 min | Very Fast | Yes | Performance |
| **Heroku** | $7/mo | 10 min | Good | No | Simplicity |
| **Replit** | Free | 2 min | Slow | Yes | Testing only |
| **Docker** | Variable | 15 min | Depends | Yes | Full control |

**Recommendation:** Use **Railway** for easiest, fastest deployment with free tier.

---

## 📊 Conversation Examples from Testing

```
User: "How long does this palace have been here?"
Guide: "The Palace of Culture was built between 1906 and 1925—over 100 years of history! 
It's a stunning example of Neo-Renaissance architecture with Byzantine elements, representing 
the pinnacle of Moldavian cultural achievement. It remains one of Romania's largest buildings 
and is absolutely worth exploring at your own pace."

---

User: "Any tip about visiting?"
Guide: "Great question! Here are my tips:

🌅 Visit early (9-11 AM) for fewer crowds
📸 Photography is allowed in public areas (check room-specific signs)
👟 Comfortable shoes recommended—lots of walking!
📝 Grab a free map at the information desk
🎧 Consider an audio guide for deeper context

The best experience? Spend 90 minutes exploring at your own pace, then grab coffee!

Would you like specific floor recommendations?
```

---

## 🔧 Configuration

### API Key Setup

In `app.py`, update your DeepSeek API key:

```python
from openai import OpenAI

client = OpenAI(
    api_key="your-deepseek-api-key",
    base_url="https://api.deepseek.com"
)
```

### Environment

The app runs on `http://localhost:5001` with:
- Flask in development mode
- CORS enabled for local testing
- Cache headers preventing browser caching
- Dynamic data loading on each request

---

## 🆘 Troubleshooting

### Issue: "Models data mismatch" or Old Data Showing

**Cause:** Browser or server caching old data  
**Solution:** 
1. Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Clear browser cache
3. Restart Flask: `Ctrl+C` and `python app.py`
4. Check `palace_data.json` is saved correctly

### Issue: API Key Error

**Cause:** Invalid or expired DeepSeek API key  
**Solution:**
1. Check API key in `app.py`
2. Verify key at [platform.deepseek.com](https://platform.deepseek.com)
3. Ensure no extra spaces: `"key-here"` not `"key-here "`

### Issue: Connection Refused (Port 5001)

**Cause:** Port already in use or Flask not running  
**Solution:**
1. Ensure venv is activated
2. Check if another process uses port 5001: `netstat -ano | findstr :5001` (Windows)
3. Kill process or use different port: `python app.py` (edit PORT in app.py)

### Issue: Chat Not Responding

**Cause:** DeepSeek API timeout or unreachable  
**Solution:**
1. Check internet connection
2. Verify API status at [platform.deepseek.com](https://platform.deepseek.com)
3. Check API key has remaining quota
4. Open browser console (F12) for error messages

---

## 🧪 Testing Recommendations

### Try These Questions

**Navigation:**
- "Where is the Art Museum?"
- "How do I get to the First Floor?"
- "Are there restrooms available?"

**Cultural:**
- "Tell me about Moldavian traditions"
- "What is the palace's history?"
- "Who designed this building?"

**Practical:**
- "What are the opening hours?"
- "Is the palace wheelchair accessible?"
- "Can I take photos here?"

**Local:**
- "What should I eat in Iași?"
- "What's nearby to visit?"
- "Best time to visit?"

### Manual API Testing

```bash
# Check if Flask is running
curl http://localhost:5001/health

# Get palace data
curl http://localhost:5001/api/palace-data

# Send a chat message
curl -X POST http://localhost:5001/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Where are restrooms?"}'
```

---

## 📊 Performance

- **API Response Time:** 1-3 seconds (depends on DeepSeek API)
- **Data Load Time:** <100ms (JSON lookup)
- **Page Load:** <2 seconds
- **Mobile Score:** Responsive on all devices
- **Cost Efficiency:** ~$0.14 per 1M tokens (DeepSeek)

---

## 🎓 Commands Reference

### Running Locally

```bash
# Activate virtual environment
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows

# Start Flask server
python app.py

# In browser: http://localhost:5001
```

### Troubleshooting in Terminal

```powershell
# Kill Flask process (Windows)
Get-Process python | Stop-Process -Force

# Check running processes
Get-Process python

# Restart Flask
python app.py
```

---

## 🎯 Project Status & Roadmap

### ✅ Completed (MVP v1.0)
- Core Flask backend with DeepSeek API integration
- Professional responsive chat interface
- Room browser with sidebar navigation
- Palace data structure with 9 rooms
- Floor organization (Ground, First, Second)
- Dynamic data loading (no server caching)
- API cache headers preventing browser caching
- Accessibility information for rooms
- Cultural content (traditions, food, customs)

### 🔄 In Progress
- Suggested questions list (34 questions in 7 categories)
- UI integration for quick suggestion buttons
- Fine-tuning AI responses for contextual accuracy

### 📋 Future Enhancements (Phase 2)
- [ ] Multi-language support (Romanian, English, French, German)
- [ ] Voice input/output (speech recognition)
- [ ] Map visualization of palace floors
- [ ] Real-time availability of rooms
- [ ] Event calendar integration
- [ ] User feedback & ratings system
- [ ] Mobile app (PWA or native)
- [ ] Analytics dashboard for popular questions
- [ ] Integration with tour booking system

---

## 👨‍💼 Development Notes

### Recent Fixes & Improvements
1. **Resolved Data Caching:** Implemented dynamic data loading on each request
2. **Browser Cache Control:** Added HTTP headers preventing stale data
3. **Professional UI:** Redesigned to modern standards (not AI-generated looking)
4. **API Migration:** Switched from Anthropic Claude to cost-effective DeepSeek
5. **Room Management:** Clean sidebar with search and filtering

### Known Limitations
- No real-time room availability status
- Limited to text-based interaction (voice planned)
- No offline mode (requires internet)
- Question suggestions not yet integrated in UI

---

## 📄 License

MIT License - Use freely for commercial projects

---

## 🙏 Acknowledgments

- **Palace of Culture:** Historic landmark in Iași, Romania
- **Built with:** Python, Flask, DeepSeek API, Vanilla JS
- **Design inspiration:** Modern chat applications (WhatsApp, Messenger)

---

## 💬 Feedback & Questions

For issues, suggestions, or questions:
1. Check the troubleshooting section above
2. Review console errors (F12 in browser)
3. Check Flask terminal for server errors

**Made with ❤️ for tourism in Iași**
