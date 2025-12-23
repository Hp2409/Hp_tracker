// Service Worker Registration & Update Detection
console.log('[HP Tracker] Initializing Service Worker');

if ('serviceWorker' in navigator) {
  let refreshing = false;

  // Handle controller change (new SW activated)
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      console.log('[HP Tracker] New service worker activated, reloading page...');
      window.location.reload();
    }
  });

  // Register service worker
  navigator.serviceWorker.register('/sw.js')
    .then((registration) => {
      console.log('[HP Tracker] Service Worker registered successfully');
      console.log('[HP Tracker] Scope:', registration.scope);

      // Get and display current SW version
      getSWVersion(registration);

      // Force update check immediately
      registration.update();

      // Check for updates every 5 minutes
      setInterval(() => {
        console.log('[HP Tracker] Checking for updates...');
        registration.update();
      }, 5 * 60 * 1000);

      // Also check when page becomes visible
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          console.log('[HP Tracker] Page visible, checking for updates...');
          registration.update();
        }
      });

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('[HP Tracker] New service worker found!');

        newWorker.addEventListener('statechange', () => {
          console.log('[HP Tracker] New SW state:', newWorker.state);

          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version is ready
            console.log('[HP Tracker] New version ready!');
            showUpdateBanner(registration);
          }
        });
      });
    })
    .catch((error) => {
      console.error('[HP Tracker] Service Worker registration failed:', error);
    });
} else {
  console.warn('[HP Tracker] Service Worker not supported');
}

// Get current service worker version
function getSWVersion(registration) {
  if (registration.active) {
    const messageChannel = new MessageChannel();
    
    messageChannel.port1.onmessage = (event) => {
      const version = event.data.version || 'Unknown';
      const versionBadge = document.getElementById('versionBadge');
      if (versionBadge) {
        versionBadge.textContent = version;
      }
      console.log('[HP Tracker] Current version:', version);
    };

    registration.active.postMessage(
      { type: 'GET_VERSION' },
      [messageChannel.port2]
    );
  }
}

// Show update notification banner
function showUpdateBanner(registration) {
  console.log('[HP Tracker] Showing update banner');

  // Remove existing banner if present
  const existingBanner = document.getElementById('update-banner');
  if (existingBanner) {
    existingBanner.remove();
  }

  const banner = document.createElement('div');
  banner.id = 'update-banner';
  banner.className = 'update-banner';
  banner.innerHTML = `
    <div>
      <strong style="font-size: 16px;">🎉 New Update Available!</strong>
      <p style="margin: 8px 0; font-size: 14px;">
        HP Tracker has been updated with improvements.
      </p>
      <button class="update-btn" id="update-now-btn">
        Update Now
      </button>
      <button class="later-btn" id="update-later-btn">
        Later
      </button>
    </div>
  `;

  document.body.insertBefore(banner, document.body.firstChild);

  // Update Now button
  document.getElementById('update-now-btn').addEventListener('click', () => {
    console.log('[HP Tracker] User clicked Update Now');
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  });

  // Later button
  document.getElementById('update-later-btn').addEventListener('click', () => {
    console.log('[HP Tracker] User clicked Later');
    banner.style.animation = 'slideDown 0.3s ease-out reverse';
    setTimeout(() => banner.remove(), 300);
  });
}

// Expose debug functions to console
window.clearAppCache = function() {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
    console.log('[HP Tracker] Cache clear requested');
    setTimeout(() => window.location.reload(), 500);
  } else {
    console.log('[HP Tracker] No service worker to clear cache');
  }
};

window.checkSWStatus = function() {
  navigator.serviceWorker.getRegistration().then(reg => {
    if (!reg) {
      console.log('[HP Tracker] No service worker registered');
      return;
    }
    console.log('[HP Tracker] Service Worker Status:');
    console.log('  Active:', reg.active ? 'Yes' : 'No');
    console.log('  Waiting:', reg.waiting ? 'Yes' : 'No');
    console.log('  Installing:', reg.installing ? 'Yes' : 'No');
  });
};

window.forceUpdate = function() {
  navigator.serviceWorker.getRegistration().then(reg => {
    if (reg) {
      reg.unregister().then(() => {
        console.log('[HP Tracker] Service worker unregistered');
        caches.keys().then(keys => {
          Promise.all(keys.map(key => caches.delete(key)))
            .then(() => {
              console.log('[HP Tracker] All caches cleared');
              window.location.reload(true);
            });
        });
      });
    }
  });
};

console.log('[HP Tracker] Debug commands available:');
console.log('  clearAppCache() - Clear all caches and reload');
console.log('  checkSWStatus() - Check service worker status');
console.log('  forceUpdate() - Unregister SW, clear cache, and hard reload');