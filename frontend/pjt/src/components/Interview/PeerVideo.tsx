import React, { useEffect, useRef, useState } from 'react';
import { initPeerWithShortId } from '../../p2p/peerId';

const PeerVideo: React.FC = () => {
  const myVideoRef = useRef<HTMLVideoElement | null>(null);
  const friendVideoRef = useRef<HTMLVideoElement | null>(null);
  const [peer, setPeer] = useState<any>(null);
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [myId, setMyId] = useState<string>('');
  const [friendId, setFriendId] = useState<string>('');

  useEffect(() => {
    const p = initPeerWithShortId({
      host: 'www.dadap.site', // 사용자가 제공한 로컬 IP
      port: 443,
      path: '/dadab-peer',
      secure: true,
      config: {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      }
    }, 'peerId', 6, 3);

    p.on('open', (id: string) => {
      setMyId(id);
      console.log('Peer open id=', id);
    });

    p.on('call', (call: any) => {
      // 누군가 걸면 내 스트림이 있으면 답하고, 상대 스트림을 받아 연결
      if (myStream) {
        call.answer(myStream);
      } else {
        call.answer();
      }
      call.on('stream', (remoteStream: MediaStream) => {
        if (friendVideoRef.current) friendVideoRef.current.srcObject = remoteStream;
      });
    });

    setPeer(p);

    return () => {
      try {
        p.destroy();
      } catch (e) {
        /* ignored */
      }
    };
  }, [myStream]);

  async function getMedia() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setMyStream(stream);
      if (myVideoRef.current) {
        myVideoRef.current.srcObject = stream;
        myVideoRef.current.muted = true; // 로컬 에코 방지
      }
    } catch (err) {
      console.error('getUserMedia failed', err);
      alert('카메라/마이크 권한을 허용해주세요.');
    }
  }

  function callUser() {
    if (!peer) return alert('Peer가 초기화되지 않았습니다.');
    if (!friendId) return alert('상대 Peer ID를 입력하세요.');
    if (!myStream) return alert('먼저 카메라를 켜세요.');

    const call = peer.call(friendId, myStream);
    call.on('stream', (remoteStream: MediaStream) => {
      if (friendVideoRef.current) friendVideoRef.current.srcObject = remoteStream;
    });
  }

  async function startScreenShare() {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      // 미리보기 교체
      if (myVideoRef.current) myVideoRef.current.srcObject = screenStream;

      // 화면 공유 종료 시 카메라로 복귀
      const track = screenStream.getVideoTracks()[0];
      track.onended = () => {
        if (myVideoRef.current && myStream) myVideoRef.current.srcObject = myStream;
      };
    } catch (err) {
      console.error('화면공유 실패', err);
      alert('화면 공유를 허용하세요.');
    }
  }

  return (
    <div className="peer-video-component">
      <h3>1:1 화상 테스트 (로컬)</h3>
      <div style={{ display: 'flex', gap: 12 }}>
        <div>
          <div>내 비디오</div>
          <video ref={myVideoRef} autoPlay playsInline style={{ width: 320, height: 240, background: '#000' }} />
        </div>
        <div>
          <div>상대 비디오</div>
          <video ref={friendVideoRef} autoPlay playsInline style={{ width: 320, height: 240, background: '#000' }} />
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={getMedia} style={{ marginRight: 8 }}>카메라/마이크 켜기</button>
        <button onClick={startScreenShare} style={{ marginRight: 8 }}>화면공유 시작</button>
        <span style={{ marginLeft: 8 }}>내 Peer ID: {myId || '초기화 중...'}</span>
      </div>

      <div style={{ marginTop: 12 }}>
        <input value={friendId} onChange={(e) => setFriendId(e.target.value)} placeholder="상대 Peer ID 입력" />
        <button onClick={callUser} style={{ marginLeft: 8 }}>전화걸기</button>
      </div>
    </div>
  );
};

export default PeerVideo;
