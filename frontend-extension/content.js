// content.js
// This script runs on https://www.linkedin.com/sales/ssi* and extracts the SSI value.

(function () {
  function findSSI() {
    // Try to find a number between 0 and 100 in the page
    // SSI is usually displayed prominently, so look for large numbers
    const bodyText = document.body.innerText;
    const match = bodyText.match(/\b([1-9][0-9]?|100)\b/);

    if (match) {
      console.log("[LinkedIn SSI Parser] SSI value found:", match[0]);
    } else {
      console.log("[LinkedIn SSI Parser] SSI value not found.");
    }
  }

  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    findSSI();
  } else {
    window.addEventListener("DOMContentLoaded", findSSI);
  }
})();
