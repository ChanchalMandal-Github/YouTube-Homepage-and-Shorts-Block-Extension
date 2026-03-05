let settings = {};
let sessionShortsCount = 0; // Tracks shorts currently

async function init() {
  const res = await chrome.storage.local.get(null);
  settings = res;
  
  applyStyles();
  
  if (settings.limitShorts) {
    monitorShortsUsage();
  }
}

function applyStyles() {
  const existing = document.getElementById('yt-focus-styles');
  if (existing) existing.remove();

  const style = document.createElement('style');
  style.id = 'yt-focus-styles';
  let css = '';

  const isHomePage = window.location.pathname === '/';
  const isWatchPage = window.location.pathname.includes('/watch');

  // 1. Search-Only Home
  if (settings.blockHome && isHomePage) {
    css += `
      ytd-browse[page-subtype="home"] #contents.ytd-rich-grid-renderer,
      ytd-browse[page-subtype="home"] #primary ytd-rich-grid-renderer,
      ytd-browse[page-subtype="home"] #chips-wrapper,
      ytd-browse[page-subtype="home"] ytd-rich-section-renderer { 
        display: none !important; 
      }
      
      /* Disable scrolling */
      html, body, ytd-app { 
        overflow: hidden !important; 
      }
      
      ytd-masthead { display: flex !important; }
    `;
  }

  if (isWatchPage) {
    css += `
      html, body, ytd-app { 
        overflow: auto !important; 
      }
    `;
  }

  // 2. Hide Mixes
  if (settings.hideMixes) {
    css += `
      ytd-rich-item-renderer:has(a[href*="list=RD"]),
      ytd-grid-video-renderer:has(a[href*="list=RD"]),
      ytd-compact-radio-renderer,
      ytd-playlist-panel-video-renderer:has(a[href*="list=RD"]),
      ytd-grid-playlist-renderer:has(a[href*="list=RD"]),
      ytd-rich-item-renderer:has(ytd-playlist-thumbnail) {
        display: none !important;
      }
    `;
  }

  // 3. Disable Infinite Scrolling
  if (settings.disableScroll) {
    css += `
      ytd-browse ytd-continuation-item-renderer,
      ytd-search ytd-continuation-item-renderer { 
        display: none !important; 
      }
    `;
  }

  // 4. Hide Shorts
  if (settings.hideShorts && !window.location.pathname.includes('/shorts/')) {
    css += `
      ytd-reel-shelf-renderer, 
      ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts]),
      ytd-guide-entry-renderer[formatted-string-label="Shorts"],
      a[title="Shorts"],
      #shorts-inner-container { display: none !important; }
    `;
  }

  style.innerHTML = css;
  document.head.appendChild(style);
}

function monitorShortsUsage() {
  let lastShortId = "";

  setInterval(() => {
    const url = window.location.href;
    
    if (url.includes('/shorts/')) {
      const currentShortId = url.split('/shorts/')[1]?.split('?')[0];

      if (currentShortId && currentShortId !== lastShortId) {
        if (lastShortId !== "") {
          window.location.href = 'https://www.youtube.com';
        }
        lastShortId = currentShortId;
      }
    } else {
      lastShortId = "";
    }
  }, 500);
}

init();

let lastUrl = location.href;
const observer = new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    applyStyles();
  }
});
observer.observe(document, { subtree: true, childList: true });