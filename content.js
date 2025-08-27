
let overlayVisible = false;
let overlay = null;
// Toggle the visibility of the overlay and update its content
function toggleOverlay() {
  if (overlayVisible) {
    overlay.style.display = "none";
  } else {
    if (overlay) {
      overlay.style.display = "block";
    } else {
      fetch(chrome.runtime.getURL("overlay.html"))
        .then((response) => response.text())
        .then((html) => {
          const overlayContainer = document.createElement("div");
          overlayContainer.innerHTML = html;
          document.body.appendChild(overlayContainer);
          overlay = document.getElementById("info-overlay");
          initializeOverlay();
        });
    }
  }
  overlayVisible = !overlayVisible;
}
// Initialize the overlay by setting up event listeners and fetching initial data
function initializeOverlay() {
  const closeButton = document.getElementById("close-overlay");
  closeButton.addEventListener("click", toggleOverlay);

  const cookieButton = document.getElementById("cookie-button");
  cookieButton.addEventListener("click", handleCookieButtonClick);
// Fetch and display page info
  chrome.runtime.sendMessage({ type: "getPageInfo" }, (response) => {
    document.getElementById("page-url").textContent = response.url;
    document.getElementById("page-domain").textContent = response.domain;
    document.getElementById("page-https").textContent = response.isHttps;
  });
// Check cookie permission status and update button text accordingly
  chrome.runtime.sendMessage({ type: "checkCookiePermission" }, (response) => {
    if (response.hasPermission) {
      cookieButton.textContent = "Show Cookies";
    } else {
      cookieButton.textContent = "Grant Cookie Access";
    }
  });
}
// Handle cookie button clicks to request permission or show cookies
function handleCookieButtonClick() {
  const cookieButton = document.getElementById("cookie-button");
  if (cookieButton.textContent === "Grant Cookie Access") {
    chrome.runtime.sendMessage({ type: "requestCookiePermission" }, (response) => {
      if (response.granted) {
        cookieButton.textContent = "Show Cookies";
      } else {
        cookieButton.textContent = "Access Denied";
        cookieButton.disabled = true;
      }
    });
  } else if (cookieButton.textContent === "Show Cookies") {
    chrome.runtime.sendMessage({ type: "getCookies" }, (response) => {
      displayCookies(response.cookies);
    });
  }
}
// Display the list of cookies in the overlay
function displayCookies(cookies) {
  const cookieList = document.getElementById("cookie-list");
  cookieList.innerHTML = "";
  if (cookies.length > 0) {
    const ul = document.createElement("ul");
    cookies.forEach((cookie) => {
      const li = document.createElement("li");
      li.textContent = `${cookie.name}: ${cookie.value}`;
      ul.appendChild(li);
    });
    cookieList.appendChild(ul);
  } else {
    cookieList.textContent = "No cookies found for this domain.";
  }
}
// Listen for messages from the background script to toggle the overlay or update cookies
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "toggleOverlay") {
    toggleOverlay();
  }
  if (message.type === "cookieUpdate") {
    displayCookies(message.cookies);
  }
});