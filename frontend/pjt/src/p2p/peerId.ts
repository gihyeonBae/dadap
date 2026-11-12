import Peer from 'peerjs';

function genId(len = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let s = '';
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export function initPeerWithShortId(opts: any, storageKey = 'peerId', len = 6, maxAttempts = 3) {
  let attempts = 0;
  let desiredId: string | undefined;

  try {
    const stored = localStorage.getItem(storageKey);
    // only reuse stored id when it matches the desired short-id format
    if (stored && typeof stored === 'string' && stored.length === len && /^[a-z0-9]+$/.test(stored)) {
      desiredId = stored;
    } else {
      desiredId = undefined;
    }
  } catch (e) {
    desiredId = undefined;
  }

  function create(idToTry?: string) {
    const id = idToTry ?? genId(len);
    const p = new Peer(id, opts);

    p.on('open', (realId: string) => {
      try { localStorage.setItem(storageKey, realId); } catch (e) {}
    });

    p.on('error', (err: any) => {
      const msg = err && (err.type || err.message || '').toString();
      if (msg.includes('unavailable-id') && attempts < maxAttempts) {
        attempts++;
        try { p.destroy(); } catch (e) {}
        const nextId = genId(len);
        setTimeout(() => create(nextId), 150 + attempts * 50);
      }
    });

    return p;
  }

  return create(desiredId);
}

export { genId };
