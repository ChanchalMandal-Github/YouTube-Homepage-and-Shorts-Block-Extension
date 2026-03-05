const defaults = {
  blockHome: true,
  hideShorts: true,
  hideMixes: true,
  disableScroll: true,
  limitShorts: true
};

// Load current settings
chrome.storage.local.get(Object.keys(defaults), (res) => {
  document.getElementById('blockHome').checked = res.blockHome ?? defaults.blockHome;
  document.getElementById('hideShorts').checked = res.hideShorts ?? defaults.hideShorts;
  document.getElementById('hideMixes').checked = res.hideMixes ?? defaults.hideMixes;
  document.getElementById('disableScroll').checked = res.disableScroll ?? defaults.disableScroll;
  document.getElementById('limitShorts').checked = res.limitShorts ?? defaults.limitShorts;
});

document.getElementById('saveBtn').addEventListener('click', () => {
  const settings = {
    blockHome: document.getElementById('blockHome').checked,
    hideShorts: document.getElementById('hideShorts').checked,
    hideMixes: document.getElementById('hideMixes').checked,
    disableScroll: document.getElementById('disableScroll').checked,
    limitShorts: document.getElementById('limitShorts').checked
  };
  
  chrome.storage.local.set(settings, () => {
    chrome.tabs.query({ url: "*://*.youtube.com/*" }, (tabs) => {
      if (tabs.length > 0) {
        tabs.forEach(tab => chrome.tabs.reload(tab.id));
      } else {
        chrome.tabs.query({ active: true, currentWindow: true }, (activeTabs) => {
          if (activeTabs[0]) chrome.tabs.reload(activeTabs[0].id);
        });
      }
    });
    window.close();
  });
});