const STORAGE_KEYS = {
  TANK_PROFILE: 'biwt_tank_profile_v1',
  CURRENT_TEST: 'biwt_current_test_v1',
  TEST_HISTORY: 'biwt_test_history_v1',
  IS_PRO: 'biwt_is_pro_v1',
  USER_EMAIL: 'biwt_user_email_v1'
};

export function loadSavedProfile(defaultProfile) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TANK_PROFILE);
    if (!raw) return defaultProfile;
    return { ...defaultProfile, ...JSON.parse(raw) };
  } catch (err) {
    console.warn('Could not read tank profile from localStorage:', err);
    return defaultProfile;
  }
}

export function saveProfile(profile) {
  try {
    localStorage.setItem(STORAGE_KEYS.TANK_PROFILE, JSON.stringify(profile));
  } catch (err) {
    console.warn('Could not save tank profile to localStorage:', err);
  }
}

export function loadSavedCurrentTest(defaultTest) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_TEST);
    if (!raw) return defaultTest;
    return { ...defaultTest, ...JSON.parse(raw) };
  } catch (err) {
    console.warn('Could not read current test from localStorage:', err);
    return defaultTest;
  }
}

export function saveCurrentTest(test) {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_TEST, JSON.stringify(test));
  } catch (err) {
    console.warn('Could not save current test to localStorage:', err);
  }
}

export function loadSavedHistory(defaultHistory = []) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEST_HISTORY);
    if (!raw) return defaultHistory;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : defaultHistory;
  } catch (err) {
    console.warn('Could not read test history from localStorage:', err);
    return defaultHistory;
  }
}

export function saveHistory(history) {
  try {
    localStorage.setItem(STORAGE_KEYS.TEST_HISTORY, JSON.stringify(history));
  } catch (err) {
    console.warn('Could not save test history to localStorage:', err);
  }
}

export function loadSavedProStatus(defaultStatus = false) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.IS_PRO);
    return raw !== null ? JSON.parse(raw) : defaultStatus;
  } catch (err) {
    return defaultStatus;
  }
}

export function saveProStatus(isPro) {
  try {
    localStorage.setItem(STORAGE_KEYS.IS_PRO, JSON.stringify(isPro));
  } catch (err) {
    console.warn('Could not save pro status to localStorage:', err);
  }
}

export function clearAllSavedData() {
  try {
    localStorage.removeItem(STORAGE_KEYS.TANK_PROFILE);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_TEST);
    localStorage.removeItem(STORAGE_KEYS.TEST_HISTORY);
  } catch (err) {
    console.warn('Could not clear localStorage:', err);
  }
}
