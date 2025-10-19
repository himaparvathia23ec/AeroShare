chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "shareViaAeroShare",
    title: "Share via AeroShare",
    contexts: ["link", "image", "page"]
  });
});

chrome.contextMenus.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("index.html") });
});
