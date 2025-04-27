// popup.js

const SSI_URL = "https://www.linkedin.com/sales/ssi";
const BACKEND_URL = "http://localhost:4444/ssi"; // Adjust if backend runs elsewhere

// --- Helper Functions ---

// Maps LinkedIn component labels to backend snake_case keys
function mapLabelToKey(label) {
  const lowerLabel = label.toLowerCase();
  if (lowerLabel.includes("establish"))
    return "establish_your_professional_brand";
  if (lowerLabel.includes("find")) return "find_the_right_people";
  if (lowerLabel.includes("engage")) return "engage_with_insights";
  if (lowerLabel.includes("build")) return "build_relationships";
  return null; // Unknown label
}

// Sends data to the backend
async function sendDataToBackend(ssiData) {
  const resultDiv = document.getElementById("result");
  let feedbackSpan = document.getElementById("feedback");
  if (!feedbackSpan) {
    feedbackSpan = document.createElement("span");
    feedbackSpan.id = "feedback";
    feedbackSpan.style.display = "block"; // Ensure it's on a new line
    feedbackSpan.style.marginTop = "10px";
    resultDiv.parentNode.insertBefore(feedbackSpan, resultDiv.nextSibling); // Insert after result div
  }

  const payload = {
    ssi_overall_score: parseFloat(ssiData.mainSSI) || 0, // Ensure it's a number
  };

  ssiData.components.forEach((comp) => {
    const key = mapLabelToKey(comp.label);
    if (key) {
      // Extract number, handle potential '/100' format
      const scoreMatch = comp.value.match(/([\d.]+)/);
      payload[key] = scoreMatch ? parseFloat(scoreMatch[1]) : 0;
    }
  });

  // Basic validation: Check if all expected keys are present and are numbers
  const requiredKeys = [
    "ssi_overall_score",
    "establish_your_professional_brand",
    "find_the_right_people",
    "engage_with_insights",
    "build_relationships",
  ];
  const missingKeys = requiredKeys.filter(
    (key) =>
      !(key in payload) ||
      typeof payload[key] !== "number" ||
      isNaN(payload[key])
  );

  if (missingKeys.length > 0) {
    console.error(
      "Data validation failed. Missing or invalid keys:",
      missingKeys,
      "Payload:",
      payload
    );
    feedbackSpan.innerHTML =
      '<span style="color:orange;">Не удалось извлечь все компоненты SSI для сохранения.</span>';
    return; // Don't send incomplete/invalid data
  }

  try {
    feedbackSpan.innerHTML =
      '<span style="color:blue;">Сохранение данных...</span>';
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(
        `Backend error: ${response.status} - ${
          errorData.error || response.statusText
        }`
      );
    }

    const result = await response.json();
    console.log("Data saved successfully:", result);
    feedbackSpan.innerHTML =
      '<span style="color:green;">Данные SSI успешно сохранены!</span>';
  } catch (error) {
    console.error("Failed to send data to backend:", error);
    feedbackSpan.innerHTML = `<span style="color:red;">Ошибка сохранения данных: ${error.message}</span>`;
  }
}

// --- Event Listeners ---

document.getElementById("get-ssi").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) return;

  const resultDiv = document.getElementById("result");

  if (!tab.url || !tab.url.startsWith(SSI_URL)) {
    // Open the SSI page in a new tab and instruct the user
    chrome.tabs.create({ url: SSI_URL });
    resultDiv.innerHTML =
      '<span style="color:blue;">Страница SSI открыта в новой вкладке. Перейдите на нее и снова откройте popup для получения значения.</span>';
    return;
  }

  // Already on the SSI page, extract SSI
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: extractSSI,
  });
});

// This function runs in the context of the page
function extractSSI() {
  // Wait for the main SSI element to appear (up to 3 seconds)
  function getSSI() {
    // Try to find the main SSI value
    // Heuristic: the main SSI is the .ssi-score__value that is NOT inside a <progress> (component) or inside the component list
    const allSSI = Array.from(document.querySelectorAll(".ssi-score__value"));
    let mainSSI = null;
    for (const el of allSSI) {
      // Exclude those inside <progress> (component scores)
      if (!el.closest("progress")) {
        mainSSI = el.textContent.trim();
        break;
      }
    }

    // Get components
    const components = [];
    const componentLis = document.querySelectorAll(
      "ul.list-style-none > li.flex.flex-column"
    );
    componentLis.forEach((li) => {
      const valueEl = li.querySelector("strong");
      const labelEl = li.querySelector(".user-ssi-score__sub-score-label-text");
      if (valueEl && labelEl) {
        components.push({
          value: valueEl.textContent.trim(),
          label: labelEl.textContent.trim(),
        });
      }
    });

    return { mainSSI, components };
  }

  function waitForSSI(retries = 30) {
    const { mainSSI, components } = getSSI();
    if (mainSSI || retries <= 0) {
      chrome.runtime.sendMessage({
        type: "ssi_result",
        mainSSI,
        components,
      });
    } else {
      setTimeout(() => waitForSSI(retries - 1), 100);
    }
  }

  waitForSSI();
}

// Listen for the result and display it
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "ssi_result") {
    const resultDiv = document.getElementById("result");
    if (!msg.mainSSI) {
      resultDiv.innerHTML =
        '<span style="color:red;">SSI не найден. Откройте страницу https://www.linkedin.com/sales/ssi</span>';
      return;
    }
    let html = `<div class="ssi-main">Общий SSI: ${msg.mainSSI}</div>`;
    html += "<div><b>Компоненты:</b></div>";
    msg.components.forEach((comp) => {
      html += `<div class="ssi-component"><span class="label">${comp.label}:</span> ${comp.value}</div>`;
    });
    resultDiv.innerHTML = html;

    // Send data to backend after displaying
    sendDataToBackend({ mainSSI: msg.mainSSI, components: msg.components });
  }
});
