// 로컬 스토리지 키 prefix
const VIEW_KEY_PREFIX = 'study_views_';

// Initial views: deterministic 0 so each view increments by exactly 1
const getInitialViews = (_id: number) => {
  return 0;
};

export const getViewCount = (id: number): number => {
  const key = `${VIEW_KEY_PREFIX}${id}`;
  const stored = localStorage.getItem(key);
  
  if (stored) {
    return parseInt(stored, 10);
  }
  
  // 저장된 값이 없으면 초기값 생성 후 저장
  const initial = getInitialViews(id);
  localStorage.setItem(key, initial.toString());
  return initial;
};

export const incrementViewCount = (id: number): number => {
  const key = `${VIEW_KEY_PREFIX}${id}`;
  const lastKey = `${key}_lastInc`;

  // Prevent near-duplicate increments (covers React StrictMode double mount and rapid double-calls)
  try {
    const last = Number(localStorage.getItem(lastKey) || '0');
    const now = Date.now();
    // if last increment was within the last 1 second, treat as duplicate
    if (last && now - last < 1000) {
      return getViewCount(id);
    }
    // preemptively set lastKey to avoid race where two calls pass the check
    localStorage.setItem(lastKey, String(now));
  } catch (e) {
    // if localStorage unavailable, fall back to incrementing
  }

  const current = getViewCount(id);
  const updated = current + 1;
  localStorage.setItem(key, updated.toString());

  try {
    // ensure lastKey is updated to the actual increment time
    localStorage.setItem(lastKey, String(Date.now()));
  } catch (e) {
    // ignore
  }

  // debug helper (can be removed later)
  try { console.debug && console.debug('[viewUtils] incremented', { id, updated }); } catch {}

  return updated;
};