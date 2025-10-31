function send(action, lang = "en") {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.tabs.sendMessage(tab.id, { action, lang });
  });
}

document.getElementById("read").onclick = () => send("readPage");
document.getElementById("summarize").onclick = () => send("summarize");
document.getElementById("translate").onclick = () => {
  const lang = document.getElementById("lang").value;
  send("translate", lang);
};
document.getElementById("proofread").onclick = () => send("proofread");
document.getElementById("stop").onclick = () => send("stopReading");
