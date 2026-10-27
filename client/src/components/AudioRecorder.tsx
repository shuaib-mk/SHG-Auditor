import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Sparkles, UserCheck, Play, Volume2, AlertCircle } from 'lucide-react';
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

      // Extract spoken transactions via Muse Spark tool call
      await extractTransactions(data.utterances, speakerMap);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed processing audio with Meta Voice API. Please try sample audio.');
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

      // Pre-map speakers for convenience
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

      // Create a dummy audio blob for testing playback
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
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>{t.step1}</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Meta Muse Voice Transcribe • Speaker Diarization • Code-Switching Hinglish
          </p>
        </div>
        <button onClick={loadSampleAudio} className="btn-secondary" disabled={isLoading || isRecording}>
          <Sparkles size={16} color="var(--primary)" />
          <span>{t.loadSampleAudio}</span>
        </button>
      </div>

      {errorMsg && (
        <div style={{ padding: '12px', background: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <AlertCircle size={18} />
          <span style={{ fontSize: '13px', fontWeight: 600 }}>{errorMsg}</span>
        </div>
      )}

      {/* Recording Control Button & Timer */}
      <div style={{ textAlign: 'center', padding: '24px 0', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="btn-primary"
            style={{ padding: '16px 32px', fontSize: '17px', borderRadius: '9999px', margin: '0 auto', boxShadow: 'var(--shadow-md)' }}
            disabled={isLoading}
          >
            <Mic size={22} />
            <span>{t.startRecording}</span>
          </button>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--danger)', animation: 'pulse 1s infinite' }} />
              <span style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'monospace' }}>
                {formatTime(seconds)}
              </span>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              {t.recordingActive}
            </p>
            <button
              onClick={stopRecording}
              className="btn-secondary"
              style={{ padding: '12px 28px', borderColor: 'var(--danger)', color: 'var(--danger)', fontWeight: 700 }}
            >
              <Square size={18} fill="currentColor" />
              <span>{t.stopRecording}</span>
            </button>
          </div>
        )}

        {isLoading && (
          <div style={{ marginTop: '16px', color: 'var(--primary)', fontWeight: 600, fontSize: '14px' }}>
            ⏳ {t.processingAudio}
          </div>
        )}
      </div>

      {/* Speaker Mapping Interface */}
      {uniqueSpeakers.length > 0 && (
        <div style={{ marginBottom: '20px', padding: '16px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <UserCheck size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '15px', fontWeight: 700 }}>{t.speakerMappingTitle}</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
            {uniqueSpeakers.map((spk) => (
              <div key={spk} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, minWidth: '70px', color: 'var(--text-secondary)' }}>
                  {spk}:
                </span>
                <select
                  value={speakerMap[spk] || ''}
                  onChange={(e) => handleSpeakerChange(spk, e.target.value)}
                  style={{ flex: 1, padding: '6px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '13px' }}
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

      {/* Timestamped Transcript View */}
      {utterances.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>
            {t.transcriptTitle} ({utterances.length} turns)
          </h3>
          <div style={{ maxHeight: '240px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {utterances.map((u) => {
              const speakerLabel = speakerMap[u.speaker] || u.speakerName || u.speaker;
              const timeStr = `${Math.floor(u.startMs / 1000)}s - ${Math.floor(u.endMs / 1000)}s`;
              return (
                <div key={u.id} style={{ padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{speakerLabel}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{timeStr}</span>
                  </div>
                  <p style={{ color: 'var(--text-primary)' }}>{u.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Extracted Spoken Transactions Preview */}
      {spokenTransactions.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700 }}>
              {t.spokenTxsTitle} ({spokenTransactions.length})
            </h3>
            <button onClick={onProceedToRegister} className="btn-accent" style={{ padding: '8px 16px', fontSize: '14px' }}>
              <span>Proceed to Register Photo →</span>
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
            {spokenTransactions.map((tx) => (
              <div key={tx.id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px 14px', background: 'var(--bg-card)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: '14px' }}>{tx.memberName}</span>
                  <span className="badge badge-success">₹{tx.amount}</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Type: <strong style={{ textTransform: 'capitalize' }}>{tx.type.replace('_', ' ')}</strong> • at {tx.timestamp}
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', borderLeft: '2px solid var(--border-color)', paddingLeft: '6px' }}>
                  "{tx.transcriptSnippet}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
