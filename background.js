// background.js
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { type: "toggleOverlay" }).catch(error => {
    if (error.message !== 'Could not establish connection. Receiving end does not exist.') {
      console.error(error);
    }
  });
});
// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "getPageInfo") {
    chrome.tabs.get(sender.tab.id, (tab) => {
      const url = new URL(tab.url);
      sendResponse({
        url: tab.url,
        domain: url.hostname,
        isHttps: url.protocol === "https:",
      });
    });
    return true; // Indicates that the response is sent asynchronously
  }

  if (message.type === "checkCookiePermission") {
    chrome.permissions.contains(
      {
        permissions: ["cookies"],
        origins: [sender.tab.url],
      },
      (result) => {
        sendResponse({ hasPermission: result });
      }
    );
    return true;
  }

  if (message.type === "requestCookiePermission") {
    chrome.permissions.request(
      {
        permissions: ["cookies"],
        origins: [sender.tab.url],
      },
      (granted) => {
        sendResponse({ granted: granted });
      }
    );
    return true;
  }

  if (message.type === "getCookies") {
    chrome.cookies.getAll({ url: sender.tab.url }, (cookies) => {
      sendResponse({ cookies: cookies });
    });
    return true;
  }
});
// Listen for cookie changes and notify the content script if the cookies for the active tab change
chrome.cookies.onChanged.addListener((changeInfo) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0 && tabs[0].url && tabs[0].url.startsWith("http")) {
      chrome.cookies.getAll({ url: tabs[0].url }, (cookies) => {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: "cookieUpdate",
          cookies: cookies,
        }).catch(error => {
          if (error.message !== 'Could not establish connection. Receiving end does not exist.') {
            console.error(error);
          }
        });
      });
    }
  });
});