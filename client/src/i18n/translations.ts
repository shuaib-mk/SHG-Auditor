export type Language = 'en' | 'hi';

export const translations = {
  en: {
    appTitle: 'SHG Auditor',
    appSubtitle: 'Self-Help Group Meeting Reconciliation',
    tagline: 'Records & checks arithmetic only. Three-way check: Said, Written & Totals.',
    privacyNotice: 'Privacy Guarantee: Meeting audio is processed ephemerally in browser memory and is never saved to any database. Only confirmed ledger numbers stay in your device.',
    
    // Steps
    step1: '1. Meeting Audio',
    step2: '2. Register Photo',
    step3: '3. Reconcile',
    step4: '4. Export & Save',

    // Audio Recorder
    startRecording: 'Start Recording Meeting',
    stopRecording: 'Stop Recording',
    recordingActive: 'Recording weekly meeting audio...',
    processingAudio: 'Transcribing via Muse Voice with speaker diarization...',
    loadSampleAudio: 'Load Sample Meeting Audio (Hinglish Demo)',
    speakerMappingTitle: 'Map Speakers to Member Names',
    unmappedSpeaker: 'Select Member...',
    transcriptTitle: 'Meeting Audio Transcript (by Speaker)',
    noAudioRecorded: 'Press the microphone button when the meeting starts.',
    micPermissionDenied: 'Microphone permission denied. Please allow mic access in your browser or load the sample audio.',

    // Spoken Transactions
    spokenTxsTitle: 'Spoken Transactions (Muse Spark Extraction)',
    noTxsYet: 'No transactions extracted yet. Record audio or click Load Sample.',
    savings: 'Savings',
    loanRepaid: 'Loan Repaid',
    loanGiven: 'New Loan Given',
    interest: 'Interest',
    fine: 'Fine / Penalty',
    other: 'Other',

    // Register Upload
    uploadRegisterTitle: 'Register Page Photo (Fixed Template)',
    takePhoto: 'Take Photo',
    uploadFile: 'Upload Image',
    loadSampleRegister: 'Load Sample Register (Planted Errors)',
    processingRegister: 'Reading handwritten ledger via Muse Spark Vision...',
    ocrConfidence: 'OCR Confidence',
    lowConfidenceWarning: 'Amber cells indicate lower handwriting certainty (< 80%). You can tap to edit if needed.',
    tableMember: 'Member',
    tableSavings: 'Savings (₹)',
    tableLoanRepaid: 'Loan Repaid (₹)',
    tableInterest: 'Interest (₹)',
    tableFine: 'Fine (₹)',
    tableTotal: 'Total (₹)',
    grandTotal: 'Grand Total',
    cashInBox: 'Cash in Box',

    // Reconciler Dashboard
    runReconcile: 'Run Reconciliation Check',
    reconciliationDone: 'Reconciliation Complete',
    allMatched: 'Perfect Match! All accounts & arithmetic verified.',
    discrepanciesFound: 'Discrepancies Flagged with Evidence',
    severityHigh: 'High Severity',
    severityMedium: 'Medium Severity',
    severityLow: 'Low Severity',
    viewEvidence: 'Inspect Evidence',
    acceptSpoken: 'Accept Spoken',
    acceptWritten: 'Accept Written',
    manualEdit: 'Manual Edit',
    resolved: 'Resolved',
    pending: 'Pending Action',

    // Invariant checks
    invariantChecks: 'Mathematical Invariant Checks',
    rowMathPassed: 'All row calculations add up accurately',
    colMathPassed: 'All column sums match register footers',
    cashInBoxPassed: 'Physical cash count equals collected sum',
    continuityPassed: 'Loan balances match previous meeting history',

    // Evidence Modal
    evidenceTitle: 'Audit Discrepancy Evidence',
    spokenEvidence: 'Spoken Statement in Meeting',
    writtenEvidence: 'Written Register Line',
    playAudioSnippet: 'Play Audio Snippet',
    audioSnippetNotice: 'Snippet retrieved directly from active session memory.',
    close: 'Close',
    saveResolution: 'Save Resolution',

    // Export View
    exportTitle: 'Final Verified Ledger & Export',
    downloadCsv: 'Download Clean CSV (LokOS/NRLM)',
    printVoucher: 'Print 1-Page Meeting Voucher',
    readyForGov: 'Ready to key into National Rural Livelihoods Mission (NRLM) / LokOS portal.',

    // Evaluation
    evalTitle: 'Benchmark Evaluation (30 Planted Cases)',
    runEvalBtn: 'Run 30-Page Benchmark',
    precision: 'Precision',
    recall: 'Recall',
    f1Score: 'F1 Score',
    arithmeticAccuracy: 'Arithmetic Accuracy',
    evalDescription: 'Runs 30 synthetic SHG register pages with planted mathematical and spoken discrepancies to measure exact auditor precision.',

    // Guardrail bait modal
    guardrailTitle: 'Guardrails & Neutrality Verification',
    askGuardrail: 'Test Guardrail Filter',
    baitPlaceholder: 'e.g. Should we give Radha a bigger loan?',
    testGuardrailBtn: 'Test Prompt',
  },

  hi: {
    appTitle: 'एसएचजी ऑडिटर (SHG Auditor)',
    appSubtitle: 'स्वयं सहायता समूह बैठक खाता मिलान',
    tagline: 'केवल रिकॉर्डिंग और अंकगणित जांच। तीन-तरफा मिलान: जो कहा गया, जो लिखा गया और कुल जोड़।',
    privacyNotice: 'गोपनीयता गारंटी: बैठक का ऑडियो केवल ब्राउज़र मेमोरी में अस्थाई रूप से प्रोसेस होता है, किसी डेटाबेस में स्टोर नहीं होता। केवल सत्यापित आंकड़े आपके फोन में सुरक्षित रहते हैं।',

    // Steps
    step1: '1. बैठक ऑडियो',
    step2: '2. रजिस्टर फोटो',
    step3: '3. हिसाब मिलान',
    step4: '4. एक्सपोर्ट व सेव',

    // Audio Recorder
    startRecording: 'बैठक रिकॉर्ड करना शुरू करें',
    stopRecording: 'रिकॉर्डिंग समाप्त करें',
    recordingActive: 'साप्ताहिक बैठक का ऑडियो रिकॉर्ड हो रहा है...',
    processingAudio: 'म्यूज वॉयस द्वारा वक्ता पहचान के साथ ट्रांसक्राइब हो रहा है...',
    loadSampleAudio: 'नमूना बैठक ऑडियो लोड करें (डेमो)',
    speakerMappingTitle: 'वक्ता को सदस्य नाम से जोड़ें',
    unmappedSpeaker: 'सदस्य चुनें...',
    transcriptTitle: 'बैठक वार्तालाप (वक्ता अनुसार)',
    noAudioRecorded: 'बैठक शुरू होने पर माइक का बटन दबाएं।',
    micPermissionDenied: 'माइक की अनुमति नहीं मिली। कृपया ब्राउज़र में अनुमति दें या नमूना ऑडियो लोड करें।',

    // Spoken Transactions
    spokenTxsTitle: 'बोले गए लेन-देन (म्यूज स्पार्क द्वारा निष्कर्षण)',
    noTxsYet: 'अभी कोई लेन-देन नहीं है। ऑडियो रिकॉर्ड करें या नमूना लोड करें।',
    savings: 'बचत',
    loanRepaid: 'ऋण वापसी',
    loanGiven: 'नया ऋण दिया',
    interest: 'ब्याज',
    fine: 'दंड / जुर्माना',
    other: 'अन्य',

    // Register Upload
    uploadRegisterTitle: 'रजिस्टर पृष्ठ की फोटो (निश्चित प्रारूप)',
    takePhoto: 'फोटो खींचें',
    uploadFile: 'छवि अपलोड करें',
    loadSampleRegister: 'नमूना रजिस्टर लोड करें (त्रुटियों सहित)',
    processingRegister: 'म्यूज स्पार्क विज़न द्वारा हस्तलिखित रजिस्टर पढ़ा जा रहा है...',
    ocrConfidence: 'ओसीआर विश्वसनीयता',
    lowConfidenceWarning: 'पीले रंग के सेल कम स्पष्ट लिखावट (< 80%) दर्शाते हैं। आप इन्हें सीधे सुधार सकते हैं।',
    tableMember: 'सदस्य',
    tableSavings: 'बचत (₹)',
    tableLoanRepaid: 'ऋण वापसी (₹)',
    tableInterest: 'ब्याज (₹)',
    tableFine: 'दंड (₹)',
    tableTotal: 'कुल (₹)',
    grandTotal: 'कुल महायोग',
    cashInBox: 'तिजोरी में नकद',

    // Reconciler Dashboard
    runReconcile: 'हिसाब मिलान शुरू करें',
    reconciliationDone: 'मिलान संपन्न',
    allMatched: 'सटीक मिलान! सभी खाते व जोड़ एकदम सही हैं।',
    discrepanciesFound: 'प्रमाण सहित पाई गई विसंगतियां',
    severityHigh: 'गंभीर त्रुटि',
    severityMedium: 'मध्यम त्रुटि',
    severityLow: 'साधारण अंतर',
    viewEvidence: 'साक्ष्य देखें',
    acceptSpoken: 'कहा हुआ सही मानें',
    acceptWritten: 'लिखा हुआ सही मानें',
    manualEdit: 'स्वयं सुधारें',
    resolved: 'हल किया गया',
    pending: 'निर्णय बाकी',

    // Invariant checks
    invariantChecks: 'गणितीय नियम जांच',
    rowMathPassed: 'सभी पंक्तियों का जोड़ सही है',
    colMathPassed: 'सभी कॉलम का जोड़ रजिस्टर से मिलता है',
    cashInBoxPassed: 'तिजोरी की नकद राशि कुल संग्रह के बराबर है',
    continuityPassed: 'ऋण शेष राशि पिछली बैठक के अनुसार सही है',

    // Evidence Modal
    evidenceTitle: 'विसंगति का साक्ष्य व प्रमाण',
    spokenEvidence: 'बैठक में कहा गया कथन',
    writtenEvidence: 'रजिस्टर में लिखी गई पंक्ति',
    playAudioSnippet: 'ऑडियो क्लिप सुनें',
    audioSnippetNotice: 'यह क्लिप सीधे इस सत्र की मेमोरी से बजाई जा रही है।',
    close: 'बंद करें',
    saveResolution: 'सुधार सुरक्षित करें',

    // Export View
    exportTitle: 'अंतिम सत्यापित खाता व एक्सपोर्ट',
    downloadCsv: 'स्वच्छ CSV डाउनलोड करें (LokOS/NRLM)',
    printVoucher: '1-पेज बैठक वाउचर प्रिंट करें',
    readyForGov: 'राष्ट्रीय ग्रामीण आजीविका मिशन (NRLM) / LokOS पोर्टल में दर्ज करने हेतु तैयार।',

    // Evaluation
    evalTitle: 'सटीकता परीक्षण (30 नमूना बैठकें)',
    runEvalBtn: '30 पेजों पर परीक्षण चलाएं',
    precision: 'शुद्धता (Precision)',
    recall: 'पहचान दर (Recall)',
    f1Score: 'F1 स्कोर',
    arithmeticAccuracy: 'अंकगणित सटीकता',
    evalDescription: 'ऑडिटर की वास्तविक सटीकता मापने के लिए 30 कृत्रिम पृष्ठों पर गणना की जाती है।',

    // Guardrail bait modal
    guardrailTitle: 'सुरक्षा व तटस्थता जांच (Guardrails)',
    askGuardrail: 'वित्तीय सलाह प्रतिबंध जांचें',
    baitPlaceholder: 'उदा. क्या हमें राधा को बड़ा ऋण देना चाहिए?',
    testGuardrailBtn: 'प्रश्न पूछें',
  },
};
