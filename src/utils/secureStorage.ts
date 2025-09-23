/**
 * Secure storage utilities for sensitive data
 * Provides encryption and session-based storage for sensitive information
 */

// Simple encryption/decryption for localStorage (not for production secrets)
const ENCRYPTION_KEY = 'prepfox-local-key';

const encrypt = (text: string): string => {
  // Simple XOR encryption for demonstration - not suitable for production secrets
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
  }
  return btoa(result);
};

const decrypt = (encryptedText: string): string => {
  try {
    const text = atob(encryptedText);
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
    }
    return result;
  } catch {
    return '';
  }
};

/**
 * Stores sensitive data with encryption in sessionStorage (cleared on browser close)
 */
export const secureSessionStorage = {
  setItem: (key: string, value: string): void => {
    try {
      const encrypted = encrypt(value);
      sessionStorage.setItem(`secure_${key}`, encrypted);
    } catch (error) {
      console.error('Failed to store secure item:', error);
    }
  },

  getItem: (key: string): string | null => {
    try {
      const encrypted = sessionStorage.getItem(`secure_${key}`);
      if (!encrypted) return null;
      return decrypt(encrypted);
    } catch (error) {
      console.error('Failed to retrieve secure item:', error);
      return null;
    }
  },

  removeItem: (key: string): void => {
    sessionStorage.removeItem(`secure_${key}`);
  },

  clear: (): void => {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith('secure_')) {
        sessionStorage.removeItem(key);
      }
    });
  }
};

/**
 * Stores temporary OAuth states and tokens securely
 */
export const oauthStorage = {
  setState: (state: string, data: any): void => {
    const expiryTime = Date.now() + (10 * 60 * 1000); // 10 minutes
    const stateData = {
      data,
      expires: expiryTime
    };
    secureSessionStorage.setItem(`oauth_state_${state}`, JSON.stringify(stateData));
  },

  getState: (state: string): any | null => {
    const stateData = secureSessionStorage.getItem(`oauth_state_${state}`);
    if (!stateData) return null;

    try {
      const parsed = JSON.parse(stateData);
      if (Date.now() > parsed.expires) {
        secureSessionStorage.removeItem(`oauth_state_${state}`);
        return null;
      }
      return parsed.data;
    } catch {
      return null;
    }
  },

  clearState: (state: string): void => {
    secureSessionStorage.removeItem(`oauth_state_${state}`);
  },

  clearExpiredStates: (): void => {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith('secure_oauth_state_')) {
        const stateData = secureSessionStorage.getItem(key.replace('secure_', ''));
        if (stateData) {
          try {
            const parsed = JSON.parse(stateData);
            if (Date.now() > parsed.expires) {
              sessionStorage.removeItem(key);
            }
          } catch {
            sessionStorage.removeItem(key);
          }
        }
      }
    });
  }
};

/**
 * Clears all sensitive data from storage
 */
export const clearAllSecureData = (): void => {
  secureSessionStorage.clear();
  
  // Also clear any OAuth-related localStorage items
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.includes('oauth') || key.includes('token') || key.includes('credential')) {
      localStorage.removeItem(key);
    }
  });
};

// Auto-cleanup expired states on page load
if (typeof window !== 'undefined') {
  oauthStorage.clearExpiredStates();
}