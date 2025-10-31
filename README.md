# 🎧 JustHear AI – Chrome Built-in AI Accessibility Extension  

**JustHear AI** is a Chrome extension built to make the web more accessible — especially for **blind and visually impaired users**.  
It allows users to **listen, translate, summarize, and proofread** any webpage using **Chrome’s built-in AI (Gemini Nano)**, with a **Gemini API fallback** for broader compatibility.  

---

## 🌟 Features  

- 🗣️ **Read Aloud** – Reads webpage content clearly for visually impaired users.  
- 🌐 **Translate** – Converts text into multiple languages.  
- 🧾 **Summarize** – Quickly summarizes long content.  
- ✍️ **Proofread** – Improves clarity and grammar of text.  
- 🎙️ **Voice Commands** – Works hands-free with commands like:
  - “Read,” “Stop,” “Translate,” “Summarize,” “Proofread”
- 🎛️ **Manual Buttons** – Optional manual buttons for all actions.  
- ♿ **Accessibility Focused** – Designed to assist **blind and visually impaired** people.

---

## 🏗️ Tech Stack  

| Component | Technology |
|------------|-------------|
| **Language** | JavaScript, HTML, CSS |
| **Framework** | Chrome Extension APIs |
| **AI Models** | Chrome Built-in AI (Gemini Nano) + Gemini API |
| **Speech Engine** | Web Speech API |
| **Developer** | **Solo project by Harini M** |

---

## ⚙️ Installation  

1. Clone the repo:  
   ```bash
   git clone https://github.com/Harini3104/JustHear-AI.git
   cd justhear-ai
2. Open Chrome → chrome://extensions/
3. Enable Developer Mode → Click Load unpacked
4. Select the justhear-ai folder.
5. The extension will appear in your toolbar 🎧

## 🔑 Setup Gemini API (Fallback)

1. Visit Google AI Studio
2. Generate a new API key
3. Replace it in content.js:
4. const key = "YOUR_GEMINI_API_KEY";

## 🧩 Project Structure
JustHear-AI/
├── background.js
├── manifest.json
├── popup.html
├── popup.js
├── content.js
├── icon48.png
└── README.md

🧠 How It Works

Extracts visible text from any webpage.

Processes commands using built-in AI or Gemini API.

Outputs results through speech or edited text.

Provides voice-based accessibility for blind and visually impaired users.

👩‍💻 Developer

Harini M
Solo Developer | ECE Student