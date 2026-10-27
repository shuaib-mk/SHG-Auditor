import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Sparkles, UserCheck, Play, ArrowRight, AlertCircle, Volume2 } from 'lucide-react';
import { Language, translations } from '../i18n/translations';
import { Utterance, SpokenTransaction, SHGMember } from '../../../shared/types';

interface AudioRecorderProps {
  lang: Language;
  members: SHGMember[];
  utterances: Utterance[];
  setUtterances: (u: Utterance[]) => void;
  speakerMap: Record<string, string>;
  setSpeakerMap: (map: Record<string, string>) => void;
  spokenTransactions: SpokenTransaction[];
  setSpokenTransactions: (txs: SpokenTransaction[]) => void;
  setAudioBlobUrl: (url: string | null) => void;
  audioBlobUrl: string | null;
  onProceedToRegister: () => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  lang,
  members,
  utterances,
  setUtterances,
  speakerMap,
  setSpeakerMap,
  spokenTransactions,
  setSpokenTransactions,
  setAudioBlobUrl,
  audioBlobUrl,
  onProceedToRegister,
}) => {
  const t = translations[lang];
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const startRecording = async () => {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const blobUrl = URL.createObjectURL(audioBlob);
        setAudioBlobUrl(blobUrl);
        await processAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Mic access error:', err);
      setErrorMsg(t.micPermissionDenied);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const processAudio = async (blob: Blob) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'shg_meeting.webm');
      formData.append(
        'memberNames',
        JSON.stringify(members.map((m) => m.name))
      );

      const res = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Transcription failed');
      const data = await res.json();
      setUtterances(data.utterances || []);

      await extractTransactions(data.utterances, speakerMap);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Could not process audio. You can use the Demo button below.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSampleAudio = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      setUtterances(data.utterances || []);

      const initialMap: Record<string, string> = {
        'Speaker 1': 'Sunita Devi',
        'Speaker 2': 'Radha Bai',
        'Speaker 3': 'Anita Sharma',
        'Speaker 4': 'Meena Patel',
        'Speaker 5': 'Geeta Verma',
        'Speaker 6': 'Savitri Bai',
        'Speaker 7': 'Rekha Yadav',
        'Speaker 8': 'Pushpa Devi',
      };
      setSpeakerMap(initialMap);

      const dummyBlob = new Blob(['sample-audio-data'], { type: 'audio/webm' });
      setAudioBlobUrl(URL.createObjectURL(dummyBlob));

      await extractTransactions(data.utterances, initialMap);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed loading sample audio.');
    } finally {
      setIsLoading(false);
    }
  };

  const extractTransactions = async (
    utts: Utterance[],
    mapping: Record<string, string>
  ) => {
    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utterances: utts,
          speakerToMemberMap: mapping,
        }),
      });
      const data = await res.json();
      setSpokenTransactions(data.transactions || []);
    } catch (err) {
      console.error('Transaction extraction error:', err);
    }
  };

  const handleSpeakerChange = (speaker: string, memberName: string) => {
    const updated = { ...speakerMap, [speaker]: memberName };
    setSpeakerMap(updated);
    if (utterances.length > 0) {
      extractTransactions(utterances, updated);
    }
  };

  const uniqueSpeakers = Array.from(new Set(utterances.map((u) => u.speaker)));

  const formatTime = (totalSec: number) => {
    const mm = Math.floor(totalSec / 60)
      .toString()
      .padStart(2, '0');
    const ss = (totalSec % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  return (
    <div>
      {/* Step Header */}
      <div style={{ marginBottom: '14px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
          {t.step1Title}
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          {t.step1Desc}
        </p>
      </div>

      {errorMsg && (
        <div style={{ padding: '10px 14px', background: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '14px', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px', fontWeight: 600 }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Hero Recording Button Card */}
      <div className="surface-card" style={{ textAlign: 'center', padding: '24px 16px' }}>
        {!isRecording ? (
          <div>
            <button
              onClick={startRecording}
              className="mic-big-button"
              disabled={isLoading}
              title={t.startRecording}
            >
              <Mic size={36} />
            </button>
            <div style={{ marginTop: '14px', fontWeight: 800, fontSize: '16px', color: 'var(--primary)' }}>
              {t.startRecording}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {t.noAudioRecorded}
            </p>
          </div>
        ) : (
          <div>
            <button
              onClick={stopRecording}
              className="mic-big-button recording"
              title={t.stopRecording}
            >
              <Square size={32} fill="currentColor" />
            </button>
            <div style={{ marginTop: '14px', fontWeight: 800, fontSize: '22px', fontFamily: 'monospace', color: 'var(--danger)' }}>
              {formatTime(seconds)}
            </div>
            <p style={{ fontSize: '13px', color: 'var(--danger)', fontWeight: 700, marginTop: '2px' }}>
              {t.recordingActive}
            </p>
            <button
              onClick={stopRecording}
              className="btn-touch-secondary"
              style={{ marginTop: '12px', borderColor: 'var(--danger)', color: 'var(--danger)', fontWeight: 700, width: 'auto', padding: '8px 20px', minHeight: '40px' }}
            >
              {t.stopRecording}
            </button>
          </div>
        )}

        {isLoading && (
          <div style={{ marginTop: '16px', color: 'var(--primary)', fontWeight: 700, fontSize: '13px' }}>
            ⏳ {t.processingAudio}
          </div>
        )}

        {/* 1-Tap Demo Pill */}
        <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
          <button
            onClick={loadSampleAudio}
            className="btn-touch-secondary"
            disabled={isLoading || isRecording}
            style={{ width: '100%', borderRadius: 'var(--radius-full)', background: 'var(--bg-subtle)' }}
          >
            <Sparkles size={16} color="var(--primary)" />
            <span>{t.loadSampleAudio}</span>
          </button>
        </div>
      </div>

      {/* Speaker Mapping (When turns detected) */}
      {uniqueSpeakers.length > 0 && (
        <div className="surface-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <UserCheck size={16} color="var(--primary)" />
            <h3 style={{ fontSize: '14px', fontWeight: 800 }}>{t.speakerMappingTitle}</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {uniqueSpeakers.map((spk) => (
              <div key={spk} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-subtle)', padding: '8px 12px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  {spk}
                </span>
                <select
                  value={speakerMap[spk] || ''}
                  onChange={(e) => handleSpeakerChange(spk, e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600, maxWidth: '170px' }}
                >
                  <option value="">{t.unmappedSpeaker}</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extracted Transactions Card List */}
      {spokenTransactions.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800 }}>
              {t.spokenTxsTitle} ({spokenTransactions.length})
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {spokenTransactions.map((tx) => (
              <div
                key={tx.id}
                className="surface-card"
                style={{
                  margin: 0,
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                  <div className="avatar-badge">
                    {tx.memberName ? tx.memberName[0] : 'D'}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {tx.memberName}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span style={{ textTransform: 'capitalize' }}>{tx.type.replace('_', ' ')}</span> • {tx.timestamp}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className="pill-badge pill-badge-green" style={{ fontSize: '14px' }}>
                    ₹{tx.amount}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Big Prominent Forward Action Button */}
          <div style={{ marginTop: '16px' }}>
            <button onClick={onProceedToRegister} className="btn-touch-accent">
              <span>{lang === 'hi' ? 'अगला: रजिस्टर का फोटो लें →' : 'Next: Snap Register Page →'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
