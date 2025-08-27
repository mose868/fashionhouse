import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ReferralTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const referralCode = urlParams.get('ref');
    const ambassadorName = urlParams.get('ambassador');

    if (referralCode) {
      // Store referral information in localStorage
      const referralData = {
        referralCode: referralCode,
        ambassadorName: ambassadorName?.replace('_', ' ') || '',
        timestamp: Date.now(),
        visitedAt: new Date().toISOString(),
        source: 'referral_link'
      };

      localStorage.setItem('referralData', JSON.stringify(referralData));
      
      // Track the referral visit on the backend
      fetch('/api/ambassadors/track/' + referralCode, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: 'direct_link',
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      }).catch(error => {
        console.log('Referral tracking error:', error);
      });

      // Show a notification that they came through a referral
      if (ambassadorName) {
        showReferralNotification(ambassadorName.replace('_', ' '));
      }

      // Clean up URL without refreshing the page
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [location]);

  const showReferralNotification = (ambassadorName) => {
    // Create a temporary notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-sm';
    notification.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="flex-shrink-0">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium">Welcome! 🎉</p>
          <p class="text-xs text-purple-100">You were referred by ${ambassadorName}. Any purchase you make will earn them a commission!</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="flex-shrink-0 text-purple-200 hover:text-white">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 8000);
  };

  return null; // This component doesn't render anything
};

// Utility function to get stored referral data
export const getReferralData = () => {
  try {
    const stored = localStorage.getItem('referralData');
    if (stored) {
      const data = JSON.parse(stored);
      // Check if referral data is not too old (30 days)
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      if (data.timestamp > thirtyDaysAgo) {
        return data;
      } else {
        // Remove expired referral data
        localStorage.removeItem('referralData');
      }
    }
  } catch (error) {
    console.log('Error getting referral data:', error);
  }
  return null;
};

// Utility function to clear referral data (after successful conversion)
export const clearReferralData = () => {
  localStorage.removeItem('referralData');
};

// Utility function to check if user came through referral
export const hasActiveReferral = () => {
  return getReferralData() !== null;
};

export default ReferralTracker; 