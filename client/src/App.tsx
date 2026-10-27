import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PrivacyBanner } from './components/PrivacyBanner';
import { AudioRecorder } from './components/AudioRecorder';
import { RegisterUpload } from './components/RegisterUpload';
import { ReconciliationDashboard } from './components/ReconciliationDashboard';
import { EvidenceModal } from './components/EvidenceModal';
import { ExportView } from './components/ExportView';
import { EvaluationModal } from './components/EvaluationModal';
import { GuardrailModal } from './components/GuardrailModal';
import { Language, translations } from './i18n/translations';
import {
  SHGMember,
  Utterance,
  SpokenTransaction,
  RegisterPageData,
  ReconciliationReport,
  Discrepancy,
  ResolutionStatus,
} from '../../shared/types';
import { Mic, FileText, CheckCircle2, Download } from 'lucide-react';

export const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeStep, setActiveStep] = useState<number>(1);

  // Core Data State
  const [members, setMembers] = useState<SHGMember[]>([]);
  const [utterances, setUtterances] = useState<Utterance[]>([]);
  const [speakerMap, setSpeakerMap] = useState<Record<string, string>>({});
  const [spokenTransactions, setSpokenTransactions] = useState<SpokenTransaction[]>([]);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);

  const [registerData, setRegisterData] = useState<RegisterPageData | null>(null);
  const [registerImageUrl, setRegisterImageUrl] = useState<string | null>(null);

  const [report, setReport] = useState<ReconciliationReport | null>(null);

  // Modals
  const [evidenceDiscrepancy, setEvidenceDiscrepancy] = useState<Discrepancy | null>(null);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [showGuardrail, setShowGuardrail] = useState(false);

  const t = translations[lang];

  // Initialize theme and fetch initial fictional roster
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const fetchSeed = async () => {
      try {
        const res = await fetch('/api/seed');
        const data = await res.json();
        if (data.members) {
          setMembers(data.members);
        }
      } catch (err) {
        console.error('Error fetching seed members:', err);
      }
    };
    fetchSeed();
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Run reconciliation API call
  const triggerReconciliation = async (
    customSpoken?: SpokenTransaction[],
    customRegister?: RegisterPageData
  ) => {
    const txsToUse = customSpoken || spokenTransactions;
    const regToUse = customRegister || registerData;

    if (!regToUse) return;

    try {
      const res = await fetch('/api/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spokenTransactions: txsToUse,
          registerData: regToUse,
          members,
        }),
      });

      if (!res.ok) throw new Error('Reconciliation failed');
      const data: ReconciliationReport = await res.json();
      setReport(data);
      setActiveStep(3);
    } catch (err) {
      console.error('Error reconciling:', err);
    }
  };

  const handleResolveDiscrepancy = (
    discrepancyId: string,
    status: ResolutionStatus,
    resolvedValue?: number
  ) => {
    if (!report) return;

    const updatedDiscrepancies = report.discrepancies.map((d) => {
      if (d.id === discrepancyId) {
        return {
          ...d,
          status,
          resolvedValue,
        };
      }
      return d;
    });

    setReport({
      ...report,
      discrepancies: updatedDiscrepancies,
    });
  };

  return (
    <div className="app-container">
      {/* Header */}
      <Header
        lang={lang}
        setLang={setLang}
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenEvaluation={() => setShowEvaluation(true)}
        onOpenGuardrail={() => setShowGuardrail(true)}
      />

      {/* Privacy Notice Banner */}
      <PrivacyBanner lang={lang} />

      {/* Step Navigation Tabs */}
      <nav className="step-nav no-print">
        <button
          onClick={() => setActiveStep(1)}
          className={`step-tab ${activeStep === 1 ? 'active' : ''}`}
        >
          <Mic size={16} />
          <span>{t.step1}</span>
          {spokenTransactions.length > 0 && (
            <span className="badge badge-success" style={{ marginLeft: '6px' }}>
              {spokenTransactions.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveStep(2)}
          className={`step-tab ${activeStep === 2 ? 'active' : ''}`}
        >
          <FileText size={16} />
          <span>{t.step2}</span>
          {registerData && (
            <span className="badge badge-success" style={{ marginLeft: '6px' }}>
              ✓
            </span>
          )}
        </button>

        <button
          onClick={() => {
            if (!report && registerData) {
              triggerReconciliation();
            } else {
              setActiveStep(3);
            }
          }}
          className={`step-tab ${activeStep === 3 ? 'active' : ''}`}
        >
          <CheckCircle2 size={16} />
          <span>{t.step3}</span>
          {report && (
            <span
              className={`badge ${
                report.discrepancies.length === 0 ? 'badge-success' : 'badge-high'
              }`}
              style={{ marginLeft: '6px' }}
            >
              {report.discrepancies.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveStep(4)}
          className={`step-tab ${activeStep === 4 ? 'active' : ''}`}
        >
          <Download size={16} />
          <span>{t.step4}</span>
        </button>
      </nav>

      {/* Tab 1: Meeting Audio Recording & Speaker Diarization */}
      {activeStep === 1 && (
        <AudioRecorder
          lang={lang}
          members={members}
          utterances={utterances}
          setUtterances={setUtterances}
          speakerMap={speakerMap}
          setSpeakerMap={setSpeakerMap}
          spokenTransactions={spokenTransactions}
          setSpokenTransactions={setSpokenTransactions}
          setAudioBlobUrl={setAudioBlobUrl}
          audioBlobUrl={audioBlobUrl}
          onProceedToRegister={() => setActiveStep(2)}
        />
      )}

      {/* Tab 2: Register Photo Upload & Vision OCR Grid */}
      {activeStep === 2 && (
        <RegisterUpload
          lang={lang}
          registerData={registerData}
          setRegisterData={setRegisterData}
          registerImageUrl={registerImageUrl}
          setRegisterImageUrl={setRegisterImageUrl}
          onProceedToReconcile={() => triggerReconciliation()}
        />
      )}

      {/* Tab 3: Deterministic Reconciliation Dashboard */}
      {activeStep === 3 && (
        <ReconciliationDashboard
          lang={lang}
          report={report}
          onOpenEvidence={(d) => setEvidenceDiscrepancy(d)}
          onResolveDiscrepancy={handleResolveDiscrepancy}
          onProceedToExport={() => setActiveStep(4)}
        />
      )}

      {/* Tab 4: Final Clean Export & Government Voucher */}
      {activeStep === 4 && (
        <ExportView
          lang={lang}
          report={report}
          registerData={registerData}
        />
      )}

      {/* Evidence Viewer Modal */}
      {evidenceDiscrepancy && (
        <EvidenceModal
          lang={lang}
          discrepancy={evidenceDiscrepancy}
          onClose={() => setEvidenceDiscrepancy(null)}
          audioBlobUrl={audioBlobUrl}
          registerImageUrl={registerImageUrl}
          onResolve={handleResolveDiscrepancy}
        />
      )}

      {/* 30-Page Evaluation Benchmark Modal */}
      {showEvaluation && (
        <EvaluationModal
          lang={lang}
          onClose={() => setShowEvaluation(false)}
        />
      )}

      {/* Financial Advice Guardrail Modal */}
      {showGuardrail && (
        <GuardrailModal
          lang={lang}
          onClose={() => setShowGuardrail(false)}
        />
      )}
    </div>
  );
};
