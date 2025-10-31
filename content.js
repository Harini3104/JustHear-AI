// content.js — JustHear AI (Hackathon Edition)
// Chrome built-in AI + Gemini API fallback + Voice Commands + Smart Text Filter

if (!window.justhearInitialized) {
  window.justhearInitialized = true;
  let isReading = false;

//LANGUAGE DETECTION
  function detectLang(text) {
    const t = text.slice(0, 100);
    if (/[அ-ஹ]/.test(t)) return "ta"; // Tamil
    if (/[\u0900-\u097F]/.test(t)) return "hi"; // Hindi
    if (/[\u0C00-\u0C7F]/.test(t)) return "te"; // Telugu
    if (/[\u0D00-\u0D7F]/.test(t)) return "ml"; // Malayalam
    if (/[\u0C80-\u0CFF]/.test(t)) return "kn"; // Kannada
    return "en"; // Default English
  }

  //STATUS POPUP
   
  function showStatus(msg, color = "#fff") {
    let box = document.getElementById("jh-status");
    if (!box) {
      box = document.createElement("div");
      box.id = "jh-status";
      box.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #222;
        padding: 10px 14px;
        border-radius: 10px;
        color: white;
        font-size: 14px;
        z-index: 99999;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      `;
      document.body.appendChild(box);
    }
    box.style.color = color;
    box.textContent = msg;
    clearTimeout(box._timeout);
    box._timeout = setTimeout(() => box.remove(), 2500);
  }

  // CLEAN & EXTRACT TEXT
   
  function getMainText() {
    const clone = document.cloneNode(true);
    clone.querySelectorAll(
      "script,style,nav,header,footer,aside,form,svg,video,audio,iframe,button,a,img,input,textarea,select"
    ).forEach(e => e.remove());

    let text = clone.body?.innerText || "";
    text = text
      .replace(/\s+/g, " ")
      .replace(/https?:\/\/\S+/g, "") // URLs
      .replace(/\b(light|dark)\s*mode\b/gi, "")
      .replace(/\b(features?|menu|privacy|terms|cookies?|settings?|options?)\b/gi, "")
      .replace(/\b(log\s?in|sign\s?up|subscribe|share|download)\b/gi, "")
      .replace(/\b(home|about|contact|language|feedback)\b/gi, "")
      .trim();

    return text.slice(0, 8000);
  }

  // TEXT-TO-SPEECH
  function readText(text, lang = "en-IN") {
    if (!text) return showStatus("❌ No readable text", "red");
    speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.rate = 1.05;
    utter.pitch = 1.0;
    utter.onend = () => (isReading = false);
    speechSynthesis.speak(utter);
    isReading = true;
    showStatus("📖 Reading started...");
  }

  // AI ACTIONS
   
  async function summarizeText(text) {
    try {
      if (self.ai?.summarizer) {
        const s = await ai.summarizer.create();
        const res = await s.summarize(text);
        return res.summary || text;
      }
    } catch (err) {
      console.warn("Built-in summarizer unavailable:", err);
    }
    return fetchGemini("Summarize this:\n" + text);
  }

  async function translateText(text, targetLang = "hi") {
    try {
      if (self.ai?.translator) {
        const t = await ai.translator.create({ targetLanguage: targetLang });
        const res = await t.translate(text);
        if (typeof res === "string") return res;
        if (res?.text) return res.text;
        if (Array.isArray(res)) return res.map(r => r.text || "").join(" ");
      }
    } catch (err) {
      console.warn("Built-in translator unavailable:", err);
    }
    return fetchGemini(`Translate this into ${targetLang}:\n${text}`);
  }

  async function proofreadText(text) {
    try {
      if (self.ai?.proofreader) {
        const pf = await ai.proofreader.create();
        const res = await pf.proofread(text);
        return res.correction || text;
      }
    } catch (err) {
      console.warn("Built-in proofreader unavailable:", err);
    }
    return fetchGemini("Proofread this text:\n" + text);
  }

  //GEMINI FALLBACK API

  async function fetchGemini(prompt) {
    try {
      const key = "YOUR_GEMINI_API_KEY"; // Replace with real key 
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await res.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || "Translation failed.";
    } catch (err) {
      console.error("Gemini fallback failed:", err);
      return "Translation failed.";
    }
  }

  //HANDLE ACTIONS
  async function handleAction(action, lang) {
    const text = getMainText();
    if (!text) return showStatus("❌ No readable content", "red");

    switch (action) {
      case "readPage":
        readText(text, detectLang(text));
        break;
      case "stopReading":
        speechSynthesis.cancel();
        showStatus("🛑 Reading stopped.");
        break;
      case "summarize":
        readText(await summarizeText(text), "en-IN");
        break;
      case "translate":
        const translated = await translateText(text, lang);
        readText(translated, `${lang}-IN`);
        break;
      case "proofread":
        readText(await proofreadText(text), "en-IN");
        break;
      default:
        console.warn("Unknown action:", action);
    }
  }

  // Receive messages from popup.js
  chrome.runtime.onMessage.addListener((req) => handleAction(req.action, req.lang));

//VOICE COMMANDS (Always On + Auto-Restart)
 
if ("webkitSpeechRecognition" in window) {
  const rec = new webkitSpeechRecognition();
  rec.continuous = true;
  rec.interimResults = false;
  rec.lang = "en-US";

  rec.onresult = (e) => {
    const cmd = e.results[e.results.length - 1][0].transcript.toLowerCase().trim();
    console.log("[🎤 Voice Command]:", cmd);

    if (cmd.includes("read")) handleAction("readPage");
    else if (cmd.includes("stop")) handleAction("stopReading");
    else if (cmd.includes("summarize")) handleAction("summarize");
    else if (cmd.includes("translate")) handleAction("translate", "hi");
    else if (cmd.includes("proofread")) handleAction("proofread");
  };

  rec.onerror = (e) => {
    console.warn("🎙️ Voice recognition error:", e);
    // Restart automatically if no-speech or interruption
    if (["no-speech", "aborted", "network", "audio-capture"].includes(e.error)) {
      console.log("🔁 Restarting recognition after error:", e.error);
      setTimeout(() => rec.start(), 1500);
    }
  };

  rec.onend = () => {
    console.log("🎙️ Recognition ended — restarting...");
    setTimeout(() => rec.start(), 2000);
  };

  try {
    rec.start();
    console.log("🎤 Voice recognition started...");
  } catch (err) {
    console.error("❌ Could not start recognition:", err);
  }
} else {
  console.warn("❌ Speech Recognition not supported in this browser.");
}

console.log("[JustHear AI] ✅ Ready with Chrome AI + Gemini fallback + Voice Commands (Auto-Listening)");

}
