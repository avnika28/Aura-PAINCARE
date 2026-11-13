export interface WardBed {
  id: string;
  bedNumber: string;
  bedHindi: string;
  patientName: string;
  initials: string;
  age: number;
  gender: 'M' | 'F';
  diagnosis: string;
  diagnosisHi: string;
  ventilated: boolean;
  sedationRASS: string;
  painScore: number;
  biomarkers: {
    brow: number;
    squint: number;
    midface: number;
    mouth: number;
  };
  hr: number;
  spo2: number;
  rr: number;
  dyspneaRisk: 'Low' | 'Moderate' | 'High';
  history: number[];
  lastChecked: string;
  threshold: number;
  acknowledged?: boolean;
}

export interface PatientCaseFile {
  id: string;
  bedNumber: string;
  name: string;
  initials: string;
  age: number;
  sex: string;
  admissionDiagnosis: string;
  admissionDiagnosisHi: string;
  nonVerbalReason: string;
  ventilationMode: string;
  rassScore: string;
  cpotBaseline: number;
  recommendedThreshold: number;
  analgesicRegimen: string;
  allergies: string;
  keyBiomarkerSignature: string;
  clinicalNotes: string;
  baseVitals: {
    hr: number;
    spo2: number;
    rr: number;
  };
}

export interface VoiceBoardCard {
  id: string;
  titleEn: string;
  titleHi: string;
  subtitleEn: string;
  speechEn: string;
  speechHi: string;
  urgency: 'high' | 'medium' | 'comfort';
  iconName: string;
}

export interface BodyZone {
  id: string;
  nameEn: string;
  nameHi: string;
  cx: number;
  cy: number;
  r: number;
  defaultIntensity: number;
  clinicalNote: string;
}

export interface PresentationSlide {
  slideNumber: number;
  kicker: string;
  title: string;
  titleHighlight: string;
  subtitle: string;
  metrics: { value: string; label: string; sub: string }[];
  bullets: { heading: string; body: string }[];
  clinicalTakeaway: string;
}

export const INITIAL_WARD_BEDS: WardBed[] = [
  {
    id: 'bed-104',
    bedNumber: 'ICU-Bed 104',
    bedHindi: 'आईसीयू बेड १०४',
    patientName: 'R. Sharma',
    initials: 'RS',
    age: 62,
    gender: 'M',
    diagnosis: 'Post-Craniotomy · Intubated (MV)',
    diagnosisHi: 'पोस्ट-क्रेनीओटॉमी · वेंटिलेटर पर',
    ventilated: true,
    sedationRASS: '-2 (Light Sedation)',
    painScore: 7.4,
    biomarkers: { brow: 82, squint: 76, midface: 68, mouth: 71 },
    hr: 114,
    spo2: 95,
    rr: 24,
    dyspneaRisk: 'High',
    history: [4.2, 4.8, 5.5, 6.1, 6.8, 7.1, 7.4, 7.3, 7.5, 7.4],
    lastChecked: 'Live Active Feed',
    threshold: 6.0,
  },
  {
    id: 'bed-101',
    bedNumber: 'ICU-Bed 101',
    bedHindi: 'आईसीयू बेड १०१',
    patientName: 'A. Verma',
    initials: 'AV',
    age: 54,
    gender: 'F',
    diagnosis: 'Acute Ischemic Stroke · Aphasia',
    diagnosisHi: 'एक्यूट स्ट्रोक · बोलने में असमर्थ',
    ventilated: false,
    sedationRASS: '0 (Alert & Calm)',
    painScore: 8.2,
    biomarkers: { brow: 89, squint: 84, midface: 77, mouth: 69 },
    hr: 118,
    spo2: 94,
    rr: 26,
    dyspneaRisk: 'High',
    history: [5.9, 6.4, 7.0, 7.5, 7.9, 8.1, 8.3, 8.2, 8.1, 8.2],
    lastChecked: '12s ago',
    threshold: 6.0,
  },
  {
    id: 'bed-102',
    bedNumber: 'ICU-Bed 102',
    bedHindi: 'आईसीयू बेड १०२',
    patientName: 'M. Nair',
    initials: 'MN',
    age: 47,
    gender: 'M',
    diagnosis: 'Cervical C4 Spinal Cord Trauma',
    diagnosisHi: 'सर्वाइकल स्पाइनल ट्रॉमा',
    ventilated: true,
    sedationRASS: '-1 (Drowsy)',
    painScore: 6.3,
    biomarkers: { brow: 68, squint: 64, midface: 59, mouth: 62 },
    hr: 102,
    spo2: 96,
    rr: 21,
    dyspneaRisk: 'Moderate',
    history: [4.5, 5.0, 5.4, 5.8, 6.1, 6.2, 6.4, 6.3, 6.2, 6.3],
    lastChecked: '18s ago',
    threshold: 6.0,
  },
  {
    id: 'bed-103',
    bedNumber: 'ICU-Bed 103',
    bedHindi: 'आईसीयू बेड १०३',
    patientName: 'S. Kulkarni',
    initials: 'SK',
    age: 71,
    gender: 'F',
    diagnosis: 'Post-CABG Sternotomy · Tracheostomy',
    diagnosisHi: 'हार्ट बाईपास सर्जरी · ट्रेकियोस्टोमी',
    ventilated: true,
    sedationRASS: '-2 (Light Sedation)',
    painScore: 4.6,
    biomarkers: { brow: 52, squint: 48, midface: 41, mouth: 38 },
    hr: 88,
    spo2: 98,
    rr: 18,
    dyspneaRisk: 'Low',
    history: [3.8, 4.0, 4.3, 4.5, 4.7, 4.6, 4.5, 4.4, 4.6, 4.6],
    lastChecked: '24s ago',
    threshold: 6.0,
  },
  {
    id: 'bed-105',
    bedNumber: 'ICU-Bed 105',
    bedHindi: 'आईसीयू बेड १०५',
    patientName: 'K. Deshmukh',
    initials: 'KD',
    age: 39,
    gender: 'M',
    diagnosis: 'Guillain-Barré Syndrome · Cranial Palsy',
    diagnosisHi: 'गुलैन-बैरे सिंड्रोम · लकवा',
    ventilated: true,
    sedationRASS: '0 (Alert)',
    painScore: 5.1,
    biomarkers: { brow: 58, squint: 55, midface: 44, mouth: 46 },
    hr: 94,
    spo2: 97,
    rr: 20,
    dyspneaRisk: 'Moderate',
    history: [4.1, 4.4, 4.8, 5.0, 5.2, 5.1, 4.9, 5.0, 5.1, 5.1],
    lastChecked: '8s ago',
    threshold: 5.5,
  },
  {
    id: 'bed-106',
    bedNumber: 'ICU-Bed 106',
    bedHindi: 'आईसीयू बेड १०६',
    patientName: 'P. Chatterjee',
    initials: 'PC',
    age: 66,
    gender: 'F',
    diagnosis: 'Severe ARDS · Prone Ventilation',
    diagnosisHi: 'गंभीर एआरडीएस · वेंटिलेटर',
    ventilated: true,
    sedationRASS: '-3 (Moderate Sedation)',
    painScore: 3.4,
    biomarkers: { brow: 38, squint: 34, midface: 30, mouth: 32 },
    hr: 84,
    spo2: 96,
    rr: 19,
    dyspneaRisk: 'Moderate',
    history: [3.0, 3.2, 3.5, 3.4, 3.3, 3.6, 3.5, 3.4, 3.3, 3.4],
    lastChecked: '15s ago',
    threshold: 6.0,
  },
  {
    id: 'bed-107',
    bedNumber: 'ICU-Bed 107',
    bedHindi: 'आईसीयू बेड १०७',
    patientName: 'D. Rathore',
    initials: 'DR',
    age: 58,
    gender: 'M',
    diagnosis: 'Post-Whipple Laparotomy · Epidural',
    diagnosisHi: 'उदर सर्जरी · एपिड्यूरल',
    ventilated: false,
    sedationRASS: '-1 (Drowsy)',
    painScore: 1.8,
    biomarkers: { brow: 21, squint: 18, midface: 15, mouth: 14 },
    hr: 74,
    spo2: 99,
    rr: 14,
    dyspneaRisk: 'Low',
    history: [2.1, 2.0, 1.9, 1.8, 1.7, 1.9, 1.8, 1.8, 1.7, 1.8],
    lastChecked: '19s ago',
    threshold: 6.0,
  },
  {
    id: 'bed-108',
    bedNumber: 'ICU-Bed 108',
    bedHindi: 'आईसीयू बेड १०८',
    patientName: 'N. Bansal',
    initials: 'NB',
    age: 44,
    gender: 'F',
    diagnosis: 'Polytrauma · Bilateral Rib Fractures',
    diagnosisHi: 'पॉलीट्रॉमा · पसली में फ्रैक्चर',
    ventilated: true,
    sedationRASS: '-2 (Light Sedation)',
    painScore: 6.8,
    biomarkers: { brow: 74, squint: 71, midface: 63, mouth: 66 },
    hr: 108,
    spo2: 95,
    rr: 23,
    dyspneaRisk: 'High',
    history: [5.4, 5.8, 6.1, 6.4, 6.7, 6.9, 6.8, 6.7, 6.8, 6.8],
    lastChecked: '6s ago',
    threshold: 6.0,
  },
  {
    id: 'bed-109',
    bedNumber: 'ICU-Bed 109',
    bedHindi: 'आईसीयू बेड १०९',
    patientName: 'V. Iyer',
    initials: 'VI',
    age: 75,
    gender: 'M',
    diagnosis: 'Septic Encephalopathy · Non-Verbal',
    diagnosisHi: 'सेप्टिक एन्सेफैलोपैथी',
    ventilated: false,
    sedationRASS: '-2 (Light Sedation)',
    painScore: 1.4,
    biomarkers: { brow: 16, squint: 14, midface: 12, mouth: 15 },
    hr: 71,
    spo2: 98,
    rr: 15,
    dyspneaRisk: 'Low',
    history: [1.6, 1.5, 1.5, 1.4, 1.3, 1.5, 1.4, 1.4, 1.3, 1.4],
    lastChecked: '30s ago',
    threshold: 6.0,
  },
  {
    id: 'bed-110',
    bedNumber: 'ICU-Bed 110',
    bedHindi: 'आईसीयू बेड ११०',
    patientName: 'L. Fernandes',
    initials: 'LF',
    age: 51,
    gender: 'F',
    diagnosis: 'Myasthenic Crisis · Endotracheal Tube',
    diagnosisHi: 'मायस्थेनिक क्राइसिस · ईटी ट्यूब',
    ventilated: true,
    sedationRASS: '0 (Alert & Calm)',
    painScore: 2.2,
    biomarkers: { brow: 24, squint: 22, midface: 19, mouth: 21 },
    hr: 78,
    spo2: 99,
    rr: 16,
    dyspneaRisk: 'Low',
    history: [2.4, 2.3, 2.1, 2.2, 2.0, 2.3, 2.2, 2.1, 2.2, 2.2],
    lastChecked: '11s ago',
    threshold: 5.5,
  },
];

export const PATIENT_CASE_FILES: PatientCaseFile[] = [
  {
    id: 'case-104',
    bedNumber: 'ICU-Bed 104',
    name: 'Rajeshwar Sharma',
    initials: 'RS',
    age: 62,
    sex: 'Male',
    admissionDiagnosis: 'Right Temporal Craniotomy for Subdural Hematoma',
    admissionDiagnosisHi: 'सबड्यूरल हेमाटोमा के लिए क्रेनीओटॉमी सर्जरी',
    nonVerbalReason: 'Endotracheal intubation + expressive dysphasia post-neurosurgery',
    ventilationMode: 'SIMV + Pressure Support (FiO2 40%)',
    rassScore: '-2 (Briefly awakens to voice with eye contact)',
    cpotBaseline: 5,
    recommendedThreshold: 6.0,
    analgesicRegimen: 'Fentanyl 50 mcg/hr IV infusion + Paracetamol 1g Q6H IV',
    allergies: 'Morphine (Histamine release), Penicillin',
    keyBiomarkerSignature: 'High AU4 glabellar brow lowering & AU6 orbital tightening during ICP spikes or ETT suctioning.',
    clinicalNotes: 'Patient exhibits silent breakthrough headache and ETT cuff discomfort every 3–4 hours. Cannot press call bell due to left hemiparesis.',
    baseVitals: { hr: 112, spo2: 95, rr: 24 },
  },
  {
    id: 'case-101',
    bedNumber: 'ICU-Bed 101',
    name: 'Anjali Verma',
    initials: 'AV',
    age: 54,
    sex: 'Female',
    admissionDiagnosis: 'Left MCA Territory Acute Ischemic Stroke (Post-Thrombectomy)',
    admissionDiagnosisHi: 'एक्यूट इस्केमिक स्ट्रोक (थ्रोम्बेक्टोमी के बाद)',
    nonVerbalReason: 'Global aphasia + right-sided dominant arm plegia',
    ventilationMode: 'High-Flow Nasal Cannula (40 L/min)',
    rassScore: '0 (Alert and calm, tracks clinician)',
    cpotBaseline: 6,
    recommendedThreshold: 6.0,
    analgesicRegimen: 'Tramadol 50 mg IV Q8H + Low-dose Dexmedetomidine',
    allergies: 'NSAIDs (Renal caution)',
    keyBiomarkerSignature: 'Asymmetric left-dominant brow furrow (AU4) and pronounced nasolabial fold deepening (AU9/10).',
    clinicalNotes: 'Experiences acute shoulder subluxation pain and urinary catheter spasm. Relies on facial tracking and gaze AAC board.',
    baseVitals: { hr: 116, spo2: 94, rr: 25 },
  },
  {
    id: 'case-102',
    bedNumber: 'ICU-Bed 102',
    name: 'Madhavan Nair',
    initials: 'MN',
    age: 47,
    sex: 'Male',
    admissionDiagnosis: 'Acute C4–C5 Cervical Spinal Cord Contusion (Quadriplegia)',
    admissionDiagnosisHi: 'सर्वाइकल स्पाइनल कॉर्ड चोट (क्वाड्रिप्लेजिया)',
    nonVerbalReason: 'Cuffed tracheostomy + complete four-limb motor paralysis',
    ventilationMode: 'BiPAP / Assisted Spontaneous Breathing',
    rassScore: '-1 (Drowsy, sustained awakening)',
    cpotBaseline: 4,
    recommendedThreshold: 5.5,
    analgesicRegimen: 'Pregabalin 150 mg NG tube BD + Fentanyl 25 mcg PRN bolus',
    allergies: 'None known (NKDA)',
    keyBiomarkerSignature: 'Cranial nerves intact: pure facial grimace (AU20/25) and eye squint (AU7) are his ONLY physiological pain outlet.',
    clinicalNotes: 'Because somatic motor movement below C4 is absent, standard movement-based ICU pain scales fail. Facial biomarker monitoring is critical.',
    baseVitals: { hr: 102, spo2: 96, rr: 21 },
  },
  {
    id: 'case-103',
    bedNumber: 'ICU-Bed 103',
    name: 'Suhasini Kulkarni',
    initials: 'SK',
    age: 71,
    sex: 'Female',
    admissionDiagnosis: 'Triple-Vessel CABG + Median Sternotomy & Chest Tubes',
    admissionDiagnosisHi: 'ट्रिपल-वेसल हार्ट बाईपास सर्जरी',
    nonVerbalReason: 'Prolonged mechanical ventilation + post-operative hypoactive delirium',
    ventilationMode: 'Pressure Support Ventilation (PSV 10 cmH2O)',
    rassScore: '-2 (Light sedation)',
    cpotBaseline: 3,
    recommendedThreshold: 6.0,
    analgesicRegimen: 'Bupivacaine parasternal block + IV Acetaminophen',
    allergies: 'Codeine',
    keyBiomarkerSignature: 'Sharp mouth stretch (AU20) and rapid shallow breathing (dyspnea index >65%) during chest physiotherapy and turning.',
    clinicalNotes: 'Monitor prior to lateral turning maneuvers; pre-emptive bolus recommended when facial score exceeds 5.5.',
    baseVitals: { hr: 88, spo2: 98, rr: 18 },
  },
  {
    id: 'case-105',
    bedNumber: 'ICU-Bed 105',
    name: 'Kartik Deshmukh',
    initials: 'KD',
    age: 39,
    sex: 'Male',
    admissionDiagnosis: 'Fulminant Guillain-Barré Syndrome (AIDP Variant)',
    admissionDiagnosisHi: 'गुलैन-बैरे सिंड्रोम (तंत्रिका पक्षाघात)',
    nonVerbalReason: 'Intubated for bulbar weakness + flaccid limb paralysis',
    ventilationMode: 'Volume Control CMV (TV 450 mL)',
    rassScore: '0 (Fully conscious & cognitively intact)',
    cpotBaseline: 4,
    recommendedThreshold: 5.0,
    analgesicRegimen: 'Gabapentin 600 mg TID + Ketamine low-dose infusion 0.1 mg/kg/hr',
    allergies: 'Sulfa drugs',
    keyBiomarkerSignature: 'Subtle peri-orbital squint (AU6/7) and brow furrow; calibrated to lower threshold (5.0) due to mild facial nerve paresis.',
    clinicalNotes: 'Patient is 100% cognitively awake inside a paralyzed body. Experiences severe radicular neuropathic back and leg pain.',
    baseVitals: { hr: 94, spo2: 97, rr: 20 },
  },
  {
    id: 'case-106',
    bedNumber: 'ICU-Bed 106',
    name: 'Poulomi Chatterjee',
    initials: 'PC',
    age: 66,
    sex: 'Female',
    admissionDiagnosis: 'Severe Pneumonia with Acute Respiratory Distress Syndrome (ARDS)',
    admissionDiagnosisHi: 'गंभीर निमोनिया एवं एआरडीएस (ARDS)',
    nonVerbalReason: 'Endotracheal intubation + deep sedation weaning phase',
    ventilationMode: 'Lung-Protective ARDSNet Protocol (PEEP 12)',
    rassScore: '-3 (Moderate sedation)',
    cpotBaseline: 2,
    recommendedThreshold: 6.0,
    analgesicRegimen: 'Remifentanil TCI + Propofol weaning',
    allergies: 'Iodine contrast',
    keyBiomarkerSignature: 'Nasal flaring (AU38) + jaw drop (AU26) tightly coupled with ventilator dyssynchrony.',
    clinicalNotes: 'Tracks ventilator double-triggering and air hunger during daily spontaneous awakening trials (SAT).',
    baseVitals: { hr: 84, spo2: 96, rr: 19 },
  },
  {
    id: 'case-107',
    bedNumber: 'ICU-Bed 107',
    name: 'Devendra Rathore',
    initials: 'DR',
    age: 58,
    sex: 'Male',
    admissionDiagnosis: 'Pancreaticoduodenectomy (Whipple Procedure) — ICU Day 2',
    admissionDiagnosisHi: 'व्हिपल उदर सर्जरी — आईसीयू दिन २',
    nonVerbalReason: 'Severe vocal cord edema post-prolonged intubation + language barrier',
    ventilationMode: 'Venturi Mask 35% O2',
    rassScore: '-1 (Drowsy)',
    cpotBaseline: 1,
    recommendedThreshold: 6.0,
    analgesicRegimen: 'Thoracic Epidural (Ropivacaine 0.2% + Fentanyl 2 mcg/mL at 6 mL/hr)',
    allergies: 'None',
    keyBiomarkerSignature: 'Baseline relaxed facial tone (score <2.0); sudden mid-face tension indicates epidural catheter migration or block regression.',
    clinicalNotes: 'Currently comfortable on thoracic epidural. Keep AURA armed to catch nocturnal epidural wear-off early.',
    baseVitals: { hr: 74, spo2: 99, rr: 14 },
  },
  {
    id: 'case-108',
    bedNumber: 'ICU-Bed 108',
    name: 'Neha Bansal',
    initials: 'NB',
    age: 44,
    sex: 'Female',
    admissionDiagnosis: 'Flail Chest (Ribs 3–8 Bilateral) + Pulmonary Contusion',
    admissionDiagnosisHi: 'पसली में गंभीर फ्रैक्चर एवं फेफड़ों में चोट',
    nonVerbalReason: 'Intubated on invasive mechanical ventilation',
    ventilationMode: 'APRV (Airway Pressure Release Ventilation)',
    rassScore: '-2 (Light sedation)',
    cpotBaseline: 5,
    recommendedThreshold: 6.0,
    analgesicRegimen: 'Bilateral Serratus Anterior Plane Catheters + Hydromorphone IV',
    allergies: 'Latex',
    keyBiomarkerSignature: 'Intense orbital squeeze (AU6/7 >70%) and tachycardia bursts on every deep inspiration.',
    clinicalNotes: 'High risk of splinting and atelectasis if analgesia drops. Immediate alert configured at 6.0.',
    baseVitals: { hr: 108, spo2: 95, rr: 23 },
  },
  {
    id: 'case-109',
    bedNumber: 'ICU-Bed 109',
    name: 'Venkatesh Iyer',
    initials: 'VI',
    age: 75,
    sex: 'Male',
    admissionDiagnosis: 'Urosepsis with Metabolic Encephalopathy & Acute Kidney Injury',
    admissionDiagnosisHi: 'यूरोसेप्सिस एवं मेटाबोलिक एन्सेफैलोपैथी',
    nonVerbalReason: 'Advanced dementia + acute septic encephalopathy (non-communicative)',
    ventilationMode: 'Room Air / Nasal Prongs 2 L/min',
    rassScore: '-2 (Light stupor)',
    cpotBaseline: 1,
    recommendedThreshold: 5.5,
    analgesicRegimen: 'Buprenorphine transdermal patch 10 mcg/hr (renal-safe)',
    allergies: 'Meperidine, NSAIDs',
    keyBiomarkerSignature: 'Brow lowering (AU4) and vocalized low-frequency groans during dialysis line manipulation.',
    clinicalNotes: 'Non-verbal baseline due to dementia; optical FACS tracking prevents both undertreatment and opioid over-sedation.',
    baseVitals: { hr: 71, spo2: 98, rr: 15 },
  },
  {
    id: 'case-110',
    bedNumber: 'ICU-Bed 110',
    name: 'Lorraine Fernandes',
    initials: 'LF',
    age: 51,
    sex: 'Female',
    admissionDiagnosis: 'Myasthenia Gravis Crisis (Post-Plasmapheresis Session 3)',
    admissionDiagnosisHi: 'मायस्थेनिया ग्रेविस क्राइसिस (प्लाज्माफेरेसिस)',
    nonVerbalReason: 'Nasotracheal intubation + severe bulbar/oropharyngeal weakness',
    ventilationMode: 'CPAP + ASB Weaning Trial',
    rassScore: '0 (Alert, cooperative)',
    cpotBaseline: 2,
    recommendedThreshold: 5.5,
    analgesicRegimen: 'ketorolac 15 mg IV Q8H + Topical lidocaine for nasotracheal tube',
    allergies: 'Aminoglycosides, Fluoroquinolones (MG contraindicated)',
    keyBiomarkerSignature: 'Nasal bridge tension and eye squint despite ptosis; uses AAC Voice Board actively.',
    clinicalNotes: 'Avoid respiratory-depressant opioids. Patient uses Pain Map & Voice tab on bedside tablet.',
    baseVitals: { hr: 78, spo2: 99, rr: 16 },
  },
];

export const VOICE_BOARD_CARDS: VoiceBoardCard[] = [
  {
    id: 'vb-pain',
    titleEn: 'Severe Pain',
    titleHi: 'तेज़ दर्द हो रहा है',
    subtitleEn: 'Request immediate analgesia review',
    speechEn: 'Nurse, I am experiencing severe pain right now. Please check my medication.',
    speechHi: 'नर्स, मुझे अभी बहुत तेज़ दर्द हो रहा है। कृपया मेरी दवा की जांच करें।',
    urgency: 'high',
    iconName: 'Flame',
  },
  {
    id: 'vb-breath',
    titleEn: 'Breathing Trouble',
    titleHi: 'सांस लेने में तकलीफ',
    subtitleEn: 'Air hunger / ventilator check',
    speechEn: 'I am having trouble breathing. Please check my oxygen tube and ventilator.',
    speechHi: 'मुझे सांस लेने में तकलीफ हो रही है। कृपया मेरी ऑक्सीजन और वेंटिलेटर देखें।',
    urgency: 'high',
    iconName: 'Wind',
  },
  {
    id: 'vb-suction',
    titleEn: 'Need Suction',
    titleHi: 'गले में सक्शन चाहिए',
    subtitleEn: 'Clear airway / throat secretions',
    speechEn: 'I need airway suctioning. There is fluid in my throat tube.',
    speechHi: 'मुझे गले की नली में सक्शन की ज़रूरत है। सांस की नली साफ करें।',
    urgency: 'high',
    iconName: 'Droplets',
  },
  {
    id: 'vb-position',
    titleEn: 'Turn / Position',
    titleHi: 'करवट बदलें / सीधा करें',
    subtitleEn: 'Relieve back or neck pressure',
    speechEn: 'My back and neck are hurting. Please help adjust my pillow and bed position.',
    speechHi: 'मेरी पीठ और गर्दन में दर्द है। कृपया मेरी करवट और तकिया बदलने में मदद करें।',
    urgency: 'medium',
    iconName: 'RefreshCw',
  },
  {
    id: 'vb-thirst',
    titleEn: 'Dry Mouth / Thirst',
    titleHi: 'मुंह सूखा है / प्यास',
    subtitleEn: 'Request wet oral swab or lip care',
    speechEn: 'My mouth and lips are very dry. Please give me a wet oral swab.',
    speechHi: 'मेरा मुंह और होंठ बहुत सूख रहे हैं। कृपया गीले स्पंज से मुंह साफ करें।',
    urgency: 'comfort',
    iconName: 'GlassWater',
  },
  {
    id: 'vb-cold',
    titleEn: 'Feeling Cold',
    titleHi: 'ठंड लग रही है',
    subtitleEn: 'Request warming blanket',
    speechEn: 'I am feeling very cold and shivering. Please bring a warm blanket.',
    speechHi: 'मुझे बहुत ठंड लग रही है। कृपया मुझे एक गर्म कंबल ओढ़ा दें।',
    urgency: 'comfort',
    iconName: 'ThermometerSnowflake',
  },
  {
    id: 'vb-nausea',
    titleEn: 'Dizzy / Nausea',
    titleHi: 'जी मिचलाना / चक्कर',
    subtitleEn: 'Gastric tube or antiemetic check',
    speechEn: 'I feel nauseous and dizzy. Please check on me.',
    speechHi: 'मेरा जी मिचला रहा है और चक्कर आ रहे हैं। कृपया मेरी जांच करें।',
    urgency: 'medium',
    iconName: 'AlertCircle',
  },
  {
    id: 'vb-family',
    titleEn: 'Reassurance / Family',
    titleHi: 'परिवार / डॉक्टर से बात',
    subtitleEn: 'Orientation & emotional support',
    speechEn: 'I feel anxious. Please tell me what time it is and when my family can visit.',
    speechHi: 'मुझे घबराहट हो रही है। कृपया बताएं अभी क्या समय हुआ है और मेरा परिवार कब मिलेगा।',
    urgency: 'comfort',
    iconName: 'HeartHandshake',
  },
];

export const BODY_PAIN_ZONES: BodyZone[] = [
  {
    id: 'zone-head',
    nameEn: 'Cranial / Forehead',
    nameHi: 'सिर / माथा (क्रेनीओटॉमी)',
    cx: 150,
    cy: 52,
    r: 22,
    defaultIntensity: 8,
    clinicalNote: 'Craniotomy incision site & intracranial pressure headache zone',
  },
  {
    id: 'zone-throat',
    nameEn: 'Airway / ETT Cuff',
    nameHi: 'गला / एंडोट्रेकियल ट्यूब',
    cx: 150,
    cy: 98,
    r: 16,
    defaultIntensity: 7,
    clinicalNote: 'Endotracheal / tracheostomy tube cuff irritation & pharyngeal spasm',
  },
  {
    id: 'zone-chest',
    nameEn: 'Sternum / Anterior Chest',
    nameHi: 'छाती / स्टर्नम',
    cx: 150,
    cy: 152,
    r: 26,
    defaultIntensity: 6,
    clinicalNote: 'Sternotomy, rib fracture, or pleural chest drain insertion site',
  },
  {
    id: 'zone-r-shoulder',
    nameEn: 'Right Shoulder / Central Line',
    nameHi: 'दायां कंधा / सेंट्रल लाइन',
    cx: 102,
    cy: 135,
    r: 18,
    defaultIntensity: 4,
    clinicalNote: 'Right subclavian/IJ central venous catheter & hemiplegic subluxation',
  },
  {
    id: 'zone-l-shoulder',
    nameEn: 'Left Shoulder / Arterial Line',
    nameHi: 'बायां कंधा / बांह',
    cx: 198,
    cy: 135,
    r: 18,
    defaultIntensity: 5,
    clinicalNote: 'Left deltoid / brachial plexus traction sensitivity',
  },
  {
    id: 'zone-abdomen',
    nameEn: 'Epigastric / Abdomen',
    nameHi: 'पेट / सर्जिकल घाव',
    cx: 150,
    cy: 215,
    r: 25,
    defaultIntensity: 3,
    clinicalNote: 'Laparotomy incision, PEG tube, or gastric distension',
  },
  {
    id: 'zone-pelvis',
    nameEn: 'Pelvic / Foley Catheter',
    nameHi: 'पेल्विस / यूरिन कैथेटर',
    cx: 150,
    cy: 268,
    r: 20,
    defaultIntensity: 4,
    clinicalNote: 'Bladder spasm, femoral arterial sheath, or sacral pressure point',
  },
  {
    id: 'zone-legs',
    nameEn: 'Lower Limbs / Radicular',
    nameHi: 'पैर / नसों में खिंचाव',
    cx: 150,
    cy: 348,
    r: 26,
    defaultIntensity: 5,
    clinicalNote: 'DVT compression cuff, neuropathic radiculopathy, or heel pressure',
  },
];

export const PRESENTATION_SLIDES: PresentationSlide[] = [
  {
    slideNumber: 1,
    kicker: '01 · THE CLINICAL BLIND SPOT',
    title: '68% of Intubated ICU Patients Suffer',
    titleHighlight: 'Unreported Silent Pain.',
    subtitle:
      'Patients on mechanical ventilation, post-craniotomy, stroke aphasia, or neuromuscular paralysis cannot speak or press a nurse call button—leading to severe physiological trauma, delirium, and prolonged ICU stay.',
    metrics: [
      { value: '68%', label: 'Unrecognized Pain Episodes', sub: 'During routine turning, suctioning & catheter care' },
      { value: '45–90m', label: 'Manual Check Interval', sub: 'Intermittent nurse CPOT charting leaves long gaps' },
      { value: '2.8×', label: 'Delirium & PTSD Risk', sub: 'Associated with untreated ICU breakthrough pain' },
    ],
    bullets: [
      {
        heading: 'The Non-Verbal Dilemma',
        body: 'Endotracheal tubes, tracheostomies, aphasia, and quadriplegia strip patients of their voice at the exact moment they experience acute surgical or procedural pain.',
      },
      {
        heading: 'Vitals Alone Are Late Indicators',
        body: 'Tachycardia and hypertension are non-specific and blunted by beta-blockers or vasopressors, whereas facial micro-expressions fire within milliseconds of nociception.',
      },
    ],
    clinicalTakeaway: 'Continuous, automated bedside pain surveillance bridges the gap between manual nursing rounds.',
  },
  {
    slideNumber: 2,
    kicker: '02 · OPTICAL BIOMARKER ENGINE',
    title: '468-Landmark Facial Action Coding',
    titleHighlight: 'With Hybrid Optical Fallback.',
    subtitle:
      'AURA-PainCare maps 468 3D facial mesh coordinates at 30 FPS in the browser, extracting four validated Facial Action Coding System (FACS) nociceptive vectors.',
    metrics: [
      { value: '468', label: '3D Facial Landmarks', sub: 'Sub-millimeter geometric vector ratios' },
      { value: '4 AUs', label: 'Core Nociceptive Channels', sub: 'AU4 Brow · AU6/7 Orbit · AU9/10 Midface · AU20/25 Mouth' },
      { value: '100%', label: 'On-Device Privacy', sub: 'Zero raw video leaves the bedside monitor' },
    ],
    bullets: [
      {
        heading: 'Scale-Invariant Geometric Ratios',
        body: 'Distances are normalized against inter-ocular width so patient head tilt or bed elevation does not skew the 0–10 pain score.',
      },
      {
        heading: 'Resilient Optical Luminance Fallback',
        body: 'When lighting drops or tubing partially occludes landmarks, the optical gradient fallback engine maintains uninterrupted pain index estimation.',
      },
    ],
    clinicalTakeaway: 'Works with any standard webcam or existing ICU IP camera—₹0 proprietary sensor hardware required.',
  },
  {
    slideNumber: 3,
    kicker: '03 · CLINICAL SCALE ALIGNMENT',
    title: 'Calibrated Directly to Validated',
    titleHighlight: 'CPOT & BPS ICU Protocols.',
    subtitle:
      'Rather than opaque black-box scores, every AURA pain index point is decomposing into transparent anatomical biomarkers aligned with the Critical-Care Pain Observation Tool (CPOT).',
    metrics: [
      { value: '0.0–10.0', label: 'Continuous Pain Index', sub: 'Mapped across Stable, Moderate, Severe & Critical tiers' },
      { value: '1.5s', label: 'Sustained Trigger Window', sub: 'Filters out transient blinks, coughs, or yawning artifacts' },
      { value: '6.0s', label: 'Post-Ack Cooldown', sub: 'Prevents alarm fatigue while bedside care is delivered' },
    ],
    bullets: [
      {
        heading: 'Coupled Dyspnea & Respiratory Distress Detection',
        body: 'Combines nasolabial flaring and jaw opening (AU26) with respiration rate to flag ventilator dyssynchrony and air hunger early.',
      },
      {
        heading: 'Patient-Specific Threshold Calibration',
        body: 'Clinicians can tune the trigger threshold (e.g., 5.0 for Guillain-Barré facial paresis vs 6.0 standard post-op) in one drag.',
      },
    ],
    clinicalTakeaway: 'Eliminates false positives from transient reflexes while guaranteeing rapid detection of sustained nociception.',
  },
  {
    slideNumber: 4,
    kicker: '04 · BILINGUAL CLINICAL ALERTING',
    title: 'Zero-Click Audio Chime &',
    titleHighlight: 'English + Hindi Voice Triage.',
    subtitle:
      'Designed for high-acuity Indian and global ICU wards where immediate situational clarity across nursing shifts saves seconds and prevents alarm blindness.',
    metrics: [
      { value: '<10s', label: 'Mean Nurse SLA Response', sub: 'Live SLA stopwatch tracks time-to-acknowledgement' },
      { value: 'EN + हिं', label: 'Spoken Voice Synthesis', sub: 'Announces exact Bed ID, Pain Score & Dominant Biomarker' },
      { value: 'IEC', label: 'Multi-Harmonic Chime', sub: 'WebAudio synthesized clinical triad + pre-recorded fallback' },
    ],
    bullets: [
      {
        heading: 'Gesture-Armed Audio Reliability',
        body: 'Automatic AudioContext + SpeechSynthesis unlocking ensures browser autoplay policies never silence a critical bedside alarm.',
      },
      {
        heading: 'Automated Incident & SLA Audit Log',
        body: 'Every threshold breach automatically records timestamp, peak score, biomarker breakdown, vitals snapshot, and nurse response SLA.',
      },
    ],
    clinicalTakeaway: 'Nurses hear which bed needs help and why—even when looking away from the central console.',
  },
  {
    slideNumber: 5,
    kicker: '05 · MULTI-BED WARD COMMAND',
    title: '10-Bed Central ICU Telemetry',
    titleHighlight: '& Instant Bedside Handoff.',
    subtitle:
      'Charge nurses monitor an entire 10-bed ICU pod from a single glassmorphic command grid sorted dynamically by clinical acuity.',
    metrics: [
      { value: '10 Beds', label: 'Concurrent Ward Pod', sub: 'Filterable by Critical, Moderate, Stable & Ventilated' },
      { value: '60s', label: 'Rolling Trend Sparklines', sub: 'Immediate trajectory visibility per patient pod' },
      { value: 'QR Sync', label: 'Mobile Nurse Cart Pairing', sub: 'Instant bedside handoff & shift report generation' },
    ],
    bullets: [
      {
        heading: 'One-Click Bed Inspection',
        body: 'Click any ward bed card to load that patient’s baseline threshold, vitals, and live camera telemetry into the main monitor.',
      },
      {
        heading: 'Structured Shift Handover Reports',
        body: 'Export complete clinical summaries with peak pain episodes, analgesia recommendations, and SLA compliance for EHR documentation.',
      },
    ],
    clinicalTakeaway: 'Transforms reactive bedside checks into proactive, acuity-prioritized ward nursing.',
  },
  {
    slideNumber: 6,
    kicker: '06 · ANATOMICAL MAP & AAC VOICE BOARD',
    title: 'Giving Semi-Verbal Patients',
    titleHighlight: 'A Direct Bilingual Voice.',
    subtitle:
      'For awake intubated, tracheostomy, or stroke patients, the Pain Map & Voice tab provides a high-contrast touch and speech-recognition communication bridge.',
    metrics: [
      { value: '8 Zones', label: 'Anatomical Pain Map', sub: 'Pinpoints cranial, airway, sternal, abdominal & limb pain' },
      { value: '8 Cards', label: 'Bilingual AAC Board', sub: 'Speaks urgent requests aloud in English & Hindi' },
      { value: 'Live Mic', label: 'Speech & Groan Listener', sub: 'Captures whispered keywords and vocalized distress' },
    ],
    bullets: [
      {
        heading: 'Large 48px+ Forgiving Touch Targets',
        body: 'Engineered for weak or tremulous hands on bedside tablets, speaking requests like "Need Suction / गले में सक्शन चाहिए" aloud.',
      },
      {
        heading: 'Localized Pain Intensity Logging',
        body: 'Clinicians and patients tap anatomical regions to log focal pain intensity directly into the patient’s shift chart.',
      },
    ],
    clinicalTakeaway: 'Restores human dignity and reduces ICU anxiety by letting non-verbal patients communicate specific needs.',
  },
  {
    slideNumber: 7,
    kicker: '07 · DEPLOYMENT & IMPACT',
    title: 'Ready for Immediate',
    titleHighlight: 'Bedside & Ward Deployment.',
    subtitle:
      'Zero proprietary hardware lock-in, sub-second browser execution, and low-glare Midnight Violet ergonomics built for 24/7 ICU operations.',
    metrics: [
      { value: '₹0', label: 'CapEx Hardware Cost', sub: 'Runs on existing COW tablets, PCs & standard webcams' },
      { value: '60/30/10', label: 'Low-Glare ICU Ergonomics', sub: 'Midnight Violet canvas prevents nocturnal nurse eye strain' },
      { value: '24/7', label: 'Continuous Vigilance', sub: 'Never fatigues, blinks, or misses a silent grimace' },
    ],
    bullets: [
      {
        heading: 'Seamless Hospital Workflow Integration',
        body: 'Combines real-time computer vision, physiological vital coupling, bilingual voice synthesis, and shift reporting in one unified web console.',
      },
      {
        heading: 'Compassionate Precision Care',
        body: 'Ensures that no patient suffers in silence simply because they cannot speak.',
      },
    ],
    clinicalTakeaway: 'Pain that can’t speak, now gets heard.',
  },
];
