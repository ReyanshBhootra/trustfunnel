import { useEffect, useRef, useState } from 'react';

export default function StageIdentity({ candidate, phase, revealed, onStart }) {
  const videoRef = useRef(null);
  const [cam, setCam] = useState('off');

  useEffect(() => {
    let stream;
    let cancelled = false;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setCam('on');
      } catch {
        setCam('denied');
      }
    })();
    return () => {
      cancelled = true;
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const scanning = phase === 'scanning';
  const showPrompt = scanning || phase === 'revealing';

  return (
    <div className="flow-panel">
      <h3>Stage 1 — Identity</h3>
      <p className="lede">Prove this is a real, specific, live human — not a deepfake or a proxy.</p>

      <div className="camera-frame">
        <video ref={videoRef} autoPlay playsInline muted />
        {cam !== 'on' && (
          <div className="cam-fallback" aria-hidden="true">
            <div className="head" />
            <div className="shoulders" />
          </div>
        )}
        <div className="hud-corner tl" />
        <div className="hud-corner tr" />
        <div className="hud-corner bl" />
        <div className="hud-corner br" />
        {scanning && <div className="scan-line" />}
        <div className={`prompt-overlay ${showPrompt ? 'show' : ''}`}>
          <div>
            <div className="tag">REACTION CHALLENGE</div>
            <div className="text">Say the word “purple” out loud.</div>
          </div>
        </div>
      </div>

      <div className="checks-live">
        {scanning && <div className="scan-status">AI is analyzing live feed…</div>}
        {phase === 'done' && <div className="scan-status done">Identity cleared · {candidate.identity.score}/100</div>}
        {candidate.identity.checks.map((chk, i) => {
          if (i >= revealed) return null;
          return (
            <div key={chk.label} className={`check ${chk.pass ? 'pass' : 'fail'}`}>
              <span className="mark">{chk.pass ? '✓' : '×'}</span>
              <div>
                {chk.label}
                <div className="note">{chk.note}</div>
              </div>
            </div>
          );
        })}
      </div>

      {phase === 'idle' && (
        <div className="actions">
          <button type="button" className="btn primary" onClick={onStart}>
            Run identity check
          </button>
        </div>
      )}
    </div>
  );
}
