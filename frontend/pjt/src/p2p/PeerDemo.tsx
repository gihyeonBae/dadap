import React, { useEffect, useRef, useState } from 'react';
import { initPeerWithShortId } from './peerId';

const PeerDemo: React.FC = () => {
  const myVideoRef = useRef<HTMLVideoElement | null>(null);
  const friendVideoRef = useRef<HTMLVideoElement | null>(null);
  const [peer, setPeer] = useState<any>(null);
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [myId, setMyId] = useState<string>('');
  const [friendId, setFriendId] = useState<string>('');
  const [micOn, setMicOn] = useState<boolean>(true);
  const [showPeerId, setShowPeerId] = useState<boolean>(true);
  const currentCallRef = React.useRef<any>(null);
  const myStreamRef = React.useRef<MediaStream | null>(null);
  const fallbackAttemptRef = React.useRef<boolean>(false);

  // Inline SVG icons (small, no external deps)
  const Icon = ({ children, size = 18 }: { children: React.ReactNode; size?: number }) => (
    <span style={{ display: 'inline-flex', width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>{children}</span>
  );
  const MicIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
    <Icon size={size}><svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor"><path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3z"/><path d="M19 11a1 1 0 0 0-2 0 5 5 0 0 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 6 6.92V21a1 1 0 1 0 2 0v-3.08A7 7 0 0 0 19 11z"/></svg></Icon>
  );
  const MicOffIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
    <Icon size={size}><svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor"><path d="M15 11a3 3 0 0 1-5.83 1L15 11z" opacity=".01"/><path d="M19 11a1 1 0 0 0-2 0 5 5 0 0 1-8.9 2.2L4.3 6.4A1 1 0 1 0 2.9 7.8l3.5 6.1A7 7 0 0 0 17 11a1 1 0 0 0 2 0z"/><path d="M1 1l22 22-1.4 1.4L.6 2.4 1 1z"/></svg></Icon>
  );
  const CameraIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
    <Icon size={size}><svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor"><path d="M4 7h3l2-2h6l2 2h3v11H4V7zm8 9a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/></svg></Icon>
  );
  const CameraOffIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
    <Icon size={size}><svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor"><path d="M21 6.5l-2.1 2.1A7.9 7.9 0 0 0 20 12c0 4.4-3.6 8-8 8a7.9 7.9 0 0 0-3.4-.7L1 21l1-1 18-18L21 6.5zM8.5 9.2L6.7 7.4 5 8.9C5.7 9 6.4 9.2 7 9.5c.3.1.5.2.7.3z"/></svg></Icon>
  );
  const ScreenIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
    <Icon size={size}><svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor"><path d="M21 3H3v14h18V3zm-2 12H5V5h14v10zM8 19h8v2H8z"/></svg></Icon>
  );
  const CallIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
    <Icon size={size}><svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor"><path d="M6.6 10.8a15.05 15.05 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.2c1.2.5 2.5.8 3.9.8a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.7 21 3 13.3 3 4a1 1 0 0 1 1-1h2.5a1 1 0 0 1 1 1c0 1.4.3 2.7.8 3.9a1 1 0 0 1-.2 1l-2.5 2.9z"/></svg></Icon>
  );
  const HangupIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
    <Icon size={size}><svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor"><path d="M21 8c0 5.5-4.5 10-10 10S1 13.5 1 8" stroke="currentColor" strokeWidth="2" fill="none"/></svg></Icon>
  );
  const EyeIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
    <Icon size={size}><svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor"><path d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/></svg></Icon>
  );

  const [videoMaxHeight, setVideoMaxHeight] = useState<number>(Math.max(220, Math.floor(window.innerHeight * 0.6)));
  const [videoOn, setVideoOn] = useState<boolean>(false);

  useEffect(() => {
    const onResize = () => setVideoMaxHeight(Math.max(220, Math.floor(window.innerHeight * 0.6)));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    myStreamRef.current = myStream;
  }, [myStream]);

  useEffect(() => {
    function setupPeer(p: any) {
      p.on('open', (id: string) => {
        setMyId(id);
        console.log('Peer open id=', id);
      });

      // 에러/상태 로그 추가
      p.on('error', (err: any) => {
        console.error('Peer error:', err);
        const msg = err && (err.type || err.message || '').toString();
        // try a one-time fallback to public PeerJS server for debugging
        if (!fallbackAttemptRef.current && /Could not connect to peer|WebSocket is closed|ECONNREFUSED|connection failed/i.test(msg)) {
          fallbackAttemptRef.current = true;
          console.warn('Primary PeerJS wss failed, attempting fallback to 0.peerjs.com');
          try { p.destroy(); } catch (e) {}
          const fb = initPeerWithShortId({
            host: '0.peerjs.com',
            port: 443,
            path: '/',
            secure: true,
            config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
          }, 'peerId', 6, 3);
          setupPeer(fb);
          setPeer(fb);
          return;
        }
        if (msg.includes('unavailable-id') || /ID/.test(msg)) {
          try { localStorage.removeItem('peerId'); } catch (e) {}
          setTimeout(() => window.location.reload(), 500);
        }
      });

      p.on('disconnected', () => {
        console.warn('Peer disconnected');
      });

      p.on('close', () => {
        console.warn('Peer closed');
      });

      p.on('call', (call: any) => {
        const streamToAnswer = myStreamRef.current;
        try {
          if (streamToAnswer) call.answer(streamToAnswer);
          else call.answer();
        } catch (e) {
          console.warn('call.answer failed', e);
        }
        currentCallRef.current = call;
        call.on('close', () => { currentCallRef.current = null; });
        call.on('stream', (remoteStream: MediaStream) => {
          if (friendVideoRef.current) friendVideoRef.current.srcObject = remoteStream;
        });
      });
    }

    const p = initPeerWithShortId({
      host: 'www.dadap.site', // 사용자가 제공한 로컬 IP
      port: 443,
      path: '/dadab-peer',
      secure: true,
      config: {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      }
    }, 'peerId', 6, 3);

    setupPeer(p);
    setPeer(p);

    return () => {
      try { p.destroy(); } catch (e) {}
    };
    // initialize peer once on mount
  }, []);

  // sync mic state when stream changes
  useEffect(() => {
    if (!myStream) {
      setMicOn(false);
      setVideoOn(false);
      return;
    }
    const audioTracks = myStream.getAudioTracks();
    setMicOn(audioTracks.length > 0 ? audioTracks[0].enabled : false);
    const videoTracks = myStream.getVideoTracks();
    setVideoOn(videoTracks.length > 0 ? videoTracks[0].enabled : false);
  }, [myStream]);

  async function getMedia() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setMyStream(stream);
      if (myVideoRef.current) {
        myVideoRef.current.srcObject = stream;
        myVideoRef.current.muted = true;
      }
      // 기본적으로 마이크는 켜두기
      stream.getAudioTracks().forEach((t) => (t.enabled = true));
      stream.getVideoTracks().forEach((t) => (t.enabled = true));
      setMicOn(true);
      setVideoOn(true);
      // 현재 통화가 있으면 송신 트랙을 카메라 트랙으로 교체
      const call = currentCallRef.current;
      if (call && call.peerConnection) {
        try {
          const pc = call.peerConnection;
          const videoSender = pc.getSenders().find((s: any) => s.track && s.track.kind === 'video');
          const audioSender = pc.getSenders().find((s: any) => s.track && s.track.kind === 'audio');
          const camTrack = stream.getVideoTracks()[0];
          const micTrack = stream.getAudioTracks()[0];
          if (videoSender && camTrack) {
            await videoSender.replaceTrack(camTrack);
            console.log('Replaced sender video track with camera');
          }
          if (audioSender && micTrack) {
            await audioSender.replaceTrack(micTrack);
            console.log('Replaced sender audio track with mic');
          }
        } catch (e) {
          console.error('replaceTrack (getMedia) failed', e);
        }
      }
    } catch (err) {
      console.error('getUserMedia failed', err);
      alert('카메라/마이크 권한을 허용하세요.');
    }
  }

  function toggleMic() {
    if (!myStream) return alert('먼저 카메라/마이크를 켜세요.');
    const audioTracks = myStream.getAudioTracks();
    if (!audioTracks || audioTracks.length === 0) return alert('오디오 트랙이 없습니다.');
    const newState = !micOn;
    audioTracks.forEach((t) => (t.enabled = newState));
    setMicOn(newState);
    // also update peer sender if in a call
    const call = currentCallRef.current;
    if (call && call.peerConnection) {
      try {
        const pc = call.peerConnection;
        const audioSender = pc.getSenders().find((s: any) => s.track && s.track.kind === 'audio');
        const micTrack = myStream.getAudioTracks()[0];
        if (audioSender) {
          // Prefer replaceTrack so remote side truly stops receiving when muted
          if (newState) {
            try { audioSender.replaceTrack(micTrack); } catch (e) { console.warn('replaceTrack(mic) failed', e); }
          } else {
            try { audioSender.replaceTrack(null); } catch (e) { console.warn('replaceTrack(null) failed', e); }
          }
        }
      } catch (e) {
        console.error('toggleMic: failed to update sender', e);
      }
    }
  }

  function toggleCamera() {
    if (!myStream) return getMedia();
    const videoTracks = myStream.getVideoTracks();
    if (!videoTracks || videoTracks.length === 0) return alert('비디오 트랙이 없습니다.');
    const newState = !videoOn;
    videoTracks.forEach((t) => (t.enabled = newState));
    setVideoOn(newState);
    // also update peer sender if in a call
    const call = currentCallRef.current;
    if (call && call.peerConnection) {
      try {
        const pc = call.peerConnection;
        const videoSender = pc.getSenders().find((s: any) => s.track && s.track.kind === 'video');
        const camTrack = myStream.getVideoTracks()[0];
        if (videoSender) {
          if (newState) {
            try { videoSender.replaceTrack(camTrack); } catch (e) { console.warn('replaceTrack(cam) failed', e); }
          } else {
            try { videoSender.replaceTrack(null); } catch (e) { console.warn('replaceTrack(null) failed', e); }
          }
        }
      } catch (e) {
        console.error('toggleCamera: failed to update sender', e);
      }
    }
  }

  function callUser() {
    if (!peer) return alert('Peer 초기화 중입니다.');
    if (!friendId) return alert('상대 Peer ID를 입력하세요.');
    if (!myStream) return alert('먼저 카메라를 켜세요.');

    const call = peer.call(friendId, myStream);
    currentCallRef.current = call;
    call.on('close', () => { currentCallRef.current = null; });
    call.on('stream', (remoteStream: MediaStream) => {
      if (friendVideoRef.current) friendVideoRef.current.srcObject = remoteStream;
    });
  }

  function endCall() {
    try {
      if (currentCallRef.current) {
        currentCallRef.current.close();
        currentCallRef.current = null;
      }
    } catch (e) {
      console.error('endCall error', e);
    }

    if (myStream) {
      myStream.getTracks().forEach((t) => t.stop());
      setMyStream(null);
      setMicOn(false);
    }
    if (myVideoRef.current) myVideoRef.current.srcObject = null;
  }

  async function startScreenShare() {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      if (myVideoRef.current) myVideoRef.current.srcObject = screenStream;
      const call = currentCallRef.current;
      if (call && call.peerConnection && myStream) {
        try {
          const sender = call.peerConnection.getSenders().find((s: any) => s.track && s.track.kind === 'video');
          const screenTrack = screenStream.getVideoTracks()[0];
          if (sender && screenTrack) await sender.replaceTrack(screenTrack);
          screenTrack.onended = async () => {
            try {
              const camTrack = myStream.getVideoTracks()[0];
              if (sender && camTrack) await sender.replaceTrack(camTrack);
              if (myVideoRef.current && myStream) myVideoRef.current.srcObject = myStream;
            } catch (e) {
              console.error('restore camera track failed', e);
            }
          };
        } catch (e) {
          console.error('replaceTrack failed', e);
        }
      } else {
        const track = screenStream.getVideoTracks()[0];
        track.onended = () => {
          if (myVideoRef.current && myStream) myVideoRef.current.srcObject = myStream;
        };
      }
    } catch (err) {
      console.error('화면공유 실패', err);
      alert('화면 공유를 허용하세요.');
    }
  }

  return (
    <div style={{ padding: 12, paddingTop: 88, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial', maxHeight: '100vh', overflowY: 'auto', boxSizing: 'border-box' }}>
      <h2 style={{ margin: '6px 0 12px 0' }}>DADAP</h2>

      <div style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
        {/* 왼쪽: 내 화면 + 컨트롤 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ color: '#bbb' }}>내 화면</div>
          <div style={{ position: 'relative', background: '#000', borderRadius: 8, overflow: 'hidden', minHeight: 220, maxHeight: videoMaxHeight + 'px' }}>
            <video ref={myVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#000', maxHeight: videoMaxHeight + 'px' }} />
            <div style={{ position: 'absolute', left: 8, bottom: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
              <button onClick={toggleMic} title={micOn ? '마이크 끄기' : '마이크 켜기'} style={{ padding: 6, borderRadius: 6, border: 'none', background: micOn ? '#2d3748' : '#c53030', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {micOn ? <MicIcon size={16} /> : <MicOffIcon size={16} />}
              </button>
              <button onClick={toggleCamera} title={videoOn ? '카메라 끄기' : '카메라 켜기'} style={{ padding: 6, borderRadius: 6, border: 'none', background: '#3182ce', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                {videoOn ? <CameraIcon size={16} /> : <CameraOffIcon size={16} />}
              </button>
              <button onClick={startScreenShare} title="화면공유" style={{ padding: 6, borderRadius: 6, border: 'none', background: '#805ad5', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <ScreenIcon size={16} />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input value={friendId} onChange={(e) => setFriendId(e.target.value)} placeholder="상대 Peer ID 입력" style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #333', background: '#111', color: '#fff' }} />
            <button onClick={callUser} title="전화걸기" style={{ padding: 8, borderRadius: 6, border: 'none', background: '#2b6cb0', color: '#fff', display: 'flex', alignItems: 'center' }}>
              <CallIcon size={16} />
            </button>
            <button onClick={endCall} title="종료" style={{ padding: 8, borderRadius: 6, border: 'none', background: '#e53e3e', color: '#fff', display: 'flex', alignItems: 'center' }}>
              <HangupIcon size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', color: '#ddd' }}>
            <button onClick={() => setShowPeerId(s => !s)} title={showPeerId ? 'Peer ID 숨기기' : 'Peer ID 표시'} style={{ padding: 6, borderRadius: 6, border: 'none', background: '#4a5568', color: '#fff', display: 'flex', alignItems: 'center' }}>
              {showPeerId ? <EyeIcon size={16} /> : <EyeIcon size={16} />}
            </button>
            <div style={{ color: '#9aa4b2' }}>내 Peer ID: {showPeerId ? (myId || '초기화 중...') : '—'}</div>
          </div>
        </div>

        {/* 오른쪽: 상대 화면 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ color: '#bbb' }}>상대 화면</div>
          <div style={{ background: '#000', borderRadius: 8, overflow: 'hidden', minHeight: 320, maxHeight: Math.max(320, Math.floor(window.innerHeight * 0.75)) + 'px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <video ref={friendVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#000', maxHeight: Math.max(320, Math.floor(window.innerHeight * 0.75)) + 'px' }} />
            {!friendVideoRef.current?.srcObject && (
              <div style={{ position: 'absolute', color: '#666' }}>상대 비디오 대기중...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeerDemo;
