// popup.js

const SSI_URL = "https://www.linkedin.com/sales/ssi";

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
  }
});
