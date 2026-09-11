export interface PhLink {
  courseUrl: string;
  linkedAt: string;
}

const KEY = 'campus6_ph_link';

export const getPhLink = (): PhLink | null => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PhLink) : null;
  } catch {
    return null;
  }
};

export const savePhLink = (courseUrl: string): void => {
  try {
    localStorage.setItem(KEY, JSON.stringify({ courseUrl, linkedAt: new Date().toISOString() }));
    // ⭐ সব component-কে জানাও — button live update হবে
    window.dispatchEvent(new CustomEvent('campus6:phlink-changed'));
  } catch {
    // Storage may be unavailable in private browsing or during server rendering.
  }
};

export const clearPhLink = (): void => {
  try {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new CustomEvent('campus6:phlink-changed'));
  } catch {
    // Storage may be unavailable in private browsing or during server rendering.
  }
};

export const PH_LOGIN_URL = 'https://phyhunt.com/login';
export const PH_DEFAULT_URL = 'https://phyhunt.com/profile/';