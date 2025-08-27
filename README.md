## Webpage Info & Cookie Viewer Extension

This is a browser extension that shows basic details about the webpage you’re visiting, like the URL, domain, and if it’s using HTTPS. It can also display cookies for that domain, but only after you give permission.
<img width="959" height="482" alt="image" src="https://github.com/user-attachments/assets/0c7c6a52-7465-464e-87fd-914ea72133f0" />


## How It Works (Design Overview)

The extension is made of three main parts:

Content Script (content.js)
Runs inside every webpage. It creates the small overlay you see on the screen. It talks to the background script to get info and show it in the overlay.

Background Script (background.js)
Works in the background and handles most of the logic:

Gets page details

Manages cookie permissions

Listens for cookie changes
It also sends updates back to the content script.

UI Overlay (overlay.html, overlay.css)
A small popup on the page that shows the URL, domain, HTTPS info, and cookies.

## Why These Permissions?

The extension uses only the permissions it really needs:

activeTab → To get the URL of the tab you’re currently on. It’s temporary and only active when you click the extension.

scripting → To inject the content script into the webpage.

host_permissions (<all_urls>) → Needed so the content script can run on any site.

cookies (runtime only) → This is special. Instead of asking for cookie access at install (which shows a scary warning), the extension asks for it only when you click “Grant Cookie Access.”

This gives you control.

It avoids unnecessary warnings.

It’s more secure and user-friendly.

## How Scripts Talk to Each Other

The extension uses Chrome’s messaging system:

The content script sends a request to the background script (e.g., “Give me cookies” or “Show page info”).

The background script listens, does the work, and sends the result back.

If cookies change, the background script pushes an update to the content script so the overlay stays fresh.

## Real-Time Cookie Updates

The extension listens to chrome.cookies.onChanged.
Whenever a cookie is added, updated, or deleted, the background script:

Fetches the new cookie list

Sends it to the content script

Updates the overlay automatically

This way, the data you see is always up to date.

## Security Considerations

We’ve tried to keep the extension safe:

No XSS (Cross-Site Scripting): Data is added as plain text, not HTML, so nothing malicious can run.

Cookie Safety: Only the background script can access cookies directly. The content script only gets the data it needs, and only after permission is given.

## Possible Extra Features

Revoke Cookie Permission: Add a button so you can remove cookie access anytime (chrome.permissions.remove).

Clear Cookies: Add a button to delete all cookies for the current domain (chrome.cookies.remove).

## Deliverables

Source Code: All required files (manifest, background/service worker, content script, overlay files). Code is clean, commented, and structured.

README (this file): Includes:

## How the extension works

Why permissions are chosen (esp. runtime cookies)

How scripts communicate

How real-time cookie updates work

Security considerations and fixes

Evaluation Focus

Minimal Permissions: Only the needed permissions are used, cookies handled at runtime.

Security First: Safe handling of cookies, no unnecessary access, no XSS.

Async & Event-Driven: Uses message passing and event listeners correctly.

Clean & Documented: Code is readable and well explained.

Error Handling: Handles denied permissions and API errors gracefully.
