# LinkedIn SSI Parser Browser Extension

This browser extension extracts your Social Selling Index (SSI) score and its components from your LinkedIn Sales Navigator SSI page (`https://www.linkedin.com/sales/ssi`). It then displays these scores in the extension popup and sends them to a local backend service for storage or further processing.

## Features

- Extracts the overall SSI score from the LinkedIn Sales Navigator SSI page.
- Extracts the four components of the SSI score:
  - Establish your professional brand
  - Find the right people
  - Engage with insights
  - Build relationships
- Displays the extracted overall score and component scores in the extension's popup window.
- Sends the extracted scores (overall and components) to a local backend service expected to be running at `http://localhost:4444/ssi`.
- Provides feedback within the popup regarding the status of sending data to the backend (saving, success, error).

## How to Install and Use

1. **Prerequisite:** Ensure the corresponding backend service is running locally and is accessible at `http://localhost:4444`. The extension needs this service to save the extracted SSI data.
2. **Load the Extension:**
   - Open your Chromium-based browser (like Google Chrome, Microsoft Edge, Brave, etc.).
   - Navigate to the extensions page. Typically, you can access this by typing `chrome://extensions` or `edge://extensions` into the address bar.
   - Enable "Developer mode". This is usually a toggle switch located in the top-right corner of the extensions page.
   - Click the "Load unpacked" button.
   - In the file dialog that appears, navigate to and select the `frontend-extension` directory (the directory containing the `manifest.json` file for this extension).
   - The "LinkedIn SSI Parser" extension should now appear in your list of installed extensions.
3. **Extract SSI:**
   - Navigate to your LinkedIn Sales Navigator SSI page: [https://www.linkedin.com/sales/ssi](https://www.linkedin.com/sales/ssi). You must be logged into LinkedIn Sales Navigator.
   - Click the LinkedIn SSI Parser extension icon in your browser's toolbar (it might be hidden behind a puzzle piece icon). This will open the extension popup.
   - Click the "Get SSI" (Get SSI) button within the popup.
   - The extension will attempt to read the scores from the page.
   - The extracted scores will be displayed in the popup.
   - The extension will then attempt to POST the data to `http://localhost:4444/ssi`. Check the popup for status messages regarding the save operation.

## Key Files

- `manifest.json`: Configures the extension, including permissions, content scripts, and the popup.
- `popup.html`: Defines the structure and basic style of the extension's popup window.
- `popup.js`: Contains the core logic for the popup, including handling button clicks, injecting the extraction script, displaying results, and sending data to the backend.
- `content.js`: A content script declared in the manifest (its role in the primary workflow seems limited compared to the script injected by `popup.js`).
