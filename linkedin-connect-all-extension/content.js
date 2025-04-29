console.log("LinkedIn Connect All extension loaded.");

// Function to introduce a delay
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to wait for an element to appear
function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const intervalTime = 100;
    let elapsedTime = 0;

    const interval = setInterval(() => {
      const element = document.querySelector(selector);
      if (element) {
        clearInterval(interval);
        resolve(element);
      } else {
        elapsedTime += intervalTime;
        if (elapsedTime >= timeout) {
          clearInterval(interval);
          console.error(`Element ${selector} not found within ${timeout}ms.`);
          reject(new Error(`Element ${selector} not found within ${timeout}ms.`));
        }
      }
    }, intervalTime);
  });
}

// Main function to handle the connection process
async function connectAllHandler() {
  console.log("Connect All button clicked.");
  // More specific selector for the connect buttons on the search results page
  // Targets buttons that are secondary, contain a span with "Connect", and are likely within a search result item
  const connectButtons = Array.from(document.querySelectorAll('button')).filter(btn => btn.textContent.trim() === 'Connect');

  console.log(`Found ${connectButtons.length} potential 'Connect' buttons.`);

  if (connectButtons.length === 0) {
      console.warn("No 'Connect' buttons found on this page.");
      alert("No 'Connect' buttons found.");
      return;
  }

  let connectionsSent = 0;
  for (const span of connectButtons) {
    // The actual button is the parent or ancestor of the span
    const button = span.closest('button');
    if (!button || button.disabled) {
        console.log("Skipping a disabled or non-button element.");
        continue; // Skip if not a button or disabled
    }

    console.log("Attempting to click 'Connect' button:", button);
    button.click();

    try {
      // Wait for the modal to appear
      console.log("Waiting for connection modal...");
      const modal = await waitForElement('div[data-test-modal-id="send-invite-modal"]', 5000); // Wait up to 5 seconds
      console.log("Modal found:", modal);

      // Find the "Send without a note" button within the modal
      // Using a more specific selector targeting the button directly
      const sendButton = modal.querySelector('button[aria-label="Send without a note"]');

      if (sendButton) {
        console.log("Clicking 'Send without a note' button:", sendButton);
        sendButton.click();
        connectionsSent++;
        console.log(`Connection request ${connectionsSent} sent. Waiting 2 seconds...`);
        await sleep(2000); // Wait 2 seconds
      } else {
        console.warn("Could not find 'Send without a note' button in the modal. Skipping this connection.");
        // Try to find and click a close button if the send button isn't there
        const closeButton = modal.querySelector('button[aria-label="Dismiss"]');
        if (closeButton) {
            console.log("Closing modal.");
            closeButton.click();
            await sleep(500); // Short delay after closing
        }
      }
    } catch (error) {
      console.error("Error processing connection:", error);
      // Attempt to close any lingering modal if an error occurred
      try {
          const modal = document.querySelector('div[data-test-modal-id="send-invite-modal"]');
          const closeButton = modal?.querySelector('button[aria-label="Dismiss"]');
          if (closeButton) {
              console.log("Closing modal after error.");
              closeButton.click();
              await sleep(500);
          }
      } catch (closeError) {
          console.error("Error trying to close modal after main error:", closeError);
      }
    }
  }

  console.log(`Finished processing. ${connectionsSent} connection requests sent.`);
  alert(`Finished! ${connectionsSent} connection requests sent.`);
}

// Function to inject the "Connect All" button
function injectConnectAllButton() {
  // Check if button already exists
  if (document.getElementById('connect-all-button')) {
    console.log("Connect All button already injected.");
    return;
  }

  const connectAllButton = document.createElement('button');
  connectAllButton.textContent = 'Connect All';
  connectAllButton.id = 'connect-all-button';
  // Apply some basic styling to make it visible and match LinkedIn's style somewhat
  connectAllButton.style.position = 'fixed';
  connectAllButton.style.bottom = '20px'; // Position at the bottom
  connectAllButton.style.left = '50%';    // Center horizontally
  connectAllButton.style.transform = 'translateX(-50%)'; // Fine-tune centering
  connectAllButton.style.zIndex = '9999'; // Ensure it's on top
  connectAllButton.style.padding = '10px 15px';
  connectAllButton.style.backgroundColor = '#0a66c2'; // LinkedIn blue
  connectAllButton.style.color = 'white';
  connectAllButton.style.border = 'none';
  connectAllButton.style.borderRadius = '5px';
  connectAllButton.style.cursor = 'pointer';
  connectAllButton.style.fontSize = '14px';
  connectAllButton.style.fontWeight = '600';

  connectAllButton.addEventListener('click', connectAllHandler);

  document.body.appendChild(connectAllButton);
  console.log("Connect All button injected.");
}

// Inject the button when the page is loaded
// Use a small delay or observer if elements load dynamically
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectConnectAllButton);
} else {
    // DOMContentLoaded has already fired
    // Use a timeout to ensure the page structure is likely settled
    setTimeout(injectConnectAllButton, 1000);
}

// Use MutationObserver to re-inject button if SPA navigation removes it
const observer = new MutationObserver((mutationsList, observer) => {
    // Simple check: if the button is gone, try re-injecting
    if (!document.getElementById('connect-all-button')) {
        console.log("Connect All button removed, attempting to re-inject...");
        // Add a small delay before re-injecting to avoid race conditions
        setTimeout(injectConnectAllButton, 500);
    }
});

// Start observing the body for child list changes (element additions/removals)
observer.observe(document.body, { childList: true, subtree: true });