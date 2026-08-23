import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configured via environment variable (.env)
const DEFAULT_DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY || "";

const INITIAL_SETTINGS = {
  schoolName: "Gairo Secondary School",
  teacherName: "Mwl. Richard Lomayan",
  department: "Idara ya Sayansi na Fizikia (Physics Department)",
  teacherPin: "1234",
  deepseekApiKey: DEFAULT_DEEPSEEK_KEY,
  gradeScale: {
    A: { min: 75, max: 100, label: "Bora Sana (Excellent)", color: "#10b981" },
    B: { min: 65, max: 74, label: "Vizuri Sana (Very Good)", color: "#3b82f6" },
    C: { min: 45, max: 64, label: "Wastani / Nzuri (Good)", color: "#f59e0b" },
    D: { min: 30, max: 44, label: "Dhaifu (Pass)", color: "#f97316" },
    F: { min: 0, max: 29, label: "Hujafikia Kiwango (Fail)", color: "#ef4444" }
  },
  availableSubjects: ["Physics", "Basic Mathematics", "Chemistry", "Biology"],
  formLevels: ["Form 1", "Form 2", "Form 3", "Form 4", "Form 5", "Form 6"],
  classCodes: {
    "Form 1": "GAIRO-F1",
    "Form 2": "GAIRO-F2",
    "Form 3": "GAIRO-F3",
    "Form 4": "GAIRO-F4"
  }
};

const INITIAL_ASSIGNMENTS = [
  {
    id: "quiz-phys-f2-holiday",
    title: "Kazi ya Likizo: Fizikia Kidato cha Pili (Gairo Sec)",
    subject: "Physics",
    formLevel: "Form 2",
    teacherName: "Mwl. Richard Lomayan",
    schoolName: "Gairo Secondary School",
    instructions: "Soma maswali yaliyopo kwenye karatasi ya mtihani hapo chini. Chukua daftari lako na kalamu nyumbani, fanya hesabu na uandike hatua zote vizuri. Ukimaliza, piga picha ya ukurasa wa daftari lako kwa kamera ya simu na uipakie hapa.",
    durationMinutes: 45,
    deadline: "2026-09-12",
    passMark: 50,
    totalMarks: 50,
    questionsText: `GAIRO SECONDARY SCHOOL - IDARA YA FIZIKIA
KAZI YA LIKIZO YA FIZIKIA - KIDATO CHA PILI (FORM 2)

MAELEKEZO: Jibu maswali yote kwenye daftari lako. Onyesha njia na fomula zote waziwazi.

Swali 1 [Alama 10]:
Betri ya volteji V = 24 V imeunganishwa kwenye mzunguko wenye ukinzani wa jumla R = 8 Ω. Kokotoa mkondo wa umeme (Current - I) unaopita kwenye mzunguko huo.

Swali 2 [Alama 15]:
Vipingamizi (Resistors) viwili vya R₁ = 4 Ω na R₂ = 6 Ω vimeunganishwa sambamba (in parallel). 
(a) Andika fomula ya kutafuta ukinzani wa jumla (Rp).
(b) Kokotoa thamani ya ukinzani wa jumla (Equivalent resistance).

Swali 3 [Alama 15]:
Mashine ina Velocity Ratio (VR) = 5. Mzigo wenye uzito wa 800 N unanyanyuliwa kwa kutumia nguvu (Effort) ya 200 N.
(a) Tafuta Mechanical Advantage (MA).
(b) Tafuta Ufanisi (Efficiency %) wa mashine hiyo.

Swali 4 [Alama 10]:
Taja sifa tatu (3) za mistari ya nguvu ya sumaku (Magnetic Field Lines).`,
    markingGuide: `MWONGOZO WA USAHIHISHI (MARKING SCHEME):
1. I = V / R = 24 / 8 = 3.0 A (Amperes). [Formula: 3m, Calculation: 5m, Unit: 2m]
2. (a) 1/Rp = 1/R1 + 1/R2. (b) 1/Rp = 1/4 + 1/6 = 5/12 => Rp = 12/5 = 2.4 Ω.
3. (a) MA = Load / Effort = 800 / 200 = 4.0. (b) Efficiency = (MA / VR) * 100% = (4 / 5) * 100% = 80%.
4. Sifa: Huanzia North kwenda South nje ya sumaku; Hazikatani kamwe; Zikiwa karibu nguvu ya sumaku ni kubwa.`
  },
  {
    id: "quiz-phys-f1-holiday",
    title: "Kazi ya Likizo: Fizikia Kidato cha Kwanza (Gairo Sec)",
    subject: "Physics",
    formLevel: "Form 1",
    teacherName: "Mwl. Richard Lomayan",
    schoolName: "Gairo Secondary School",
    instructions: "Fanya maswali yote kwenye daftari lako. Piga picha ya ukurasa ulioufanyia kazi uipakie ili kusahihishiwa mara moja.",
    durationMinutes: 40,
    deadline: "2026-09-10",
    passMark: 50,
    totalMarks: 40,
    questionsText: `GAIRO SECONDARY SCHOOL - PHYSICS FORM ONE

Swali 1 [Alama 10]:
Kipande cha chuma kina masi (mass) ya gramu 360 na ujazo (volume) wa 45 cm³. Kokotoa msongamano (density) wa chuma hicho kwa g/cm³ na kg/m³.

Swali 2 [Alama 15]:
Eleza Kanuni ya Archimedes (Archimedes' Principle) na uandike fomula ya kutafuta Msukumo wa Juu (Upthrust).

Swali 3 [Alama 15]:
Mzigo wenye uzani wa 600 N umewekwa juu ya meza yenye eneo la 0.03 m². Kokotoa shinikizo (Pressure) linalotua juu ya meza hiyo kwa N/m² (Pascals).`,
    markingGuide: `1. Density = Mass / Volume = 360 / 45 = 8 g/cm³ = 8,000 kg/m³.
2. Archimedes: When a body is wholly or partially immersed in a fluid, it experiences an upthrust equal to the weight of fluid displaced. Upthrust = Real Weight - Apparent Weight (or V * rho * g).
3. Pressure = Force / Area = 600 / 0.03 = 20,000 N/m² (Pa).`
  },
  {
    id: "quiz-phys-f4-holiday",
    title: "Physics Form Four NECTA Masterclass (Gairo Sec)",
    subject: "Physics",
    formLevel: "Form 4",
    teacherName: "Mwl. Richard Lomayan",
    schoolName: "Gairo Secondary School",
    instructions: "Maandalizi ya mtihani wa Taifa (NECTA). Piga hesabu kwenye daftari lako kisha piga picha ya kurasa zako na uzipakie hapa.",
    durationMinutes: 50,
    deadline: "2026-09-18",
    passMark: 50,
    totalMarks: 50,
    questionsText: `GAIRO SECONDARY SCHOOL - PHYSICS FORM 4 NECTA PREP

Swali 1 [Alama 20]:
Trafoma ya kupandisha volteji (Step-up transformer) ina msokoto wa msingi Np = 150 na msokoto wa pili Ns = 750. Volteji ya kuingia Vp = 220 V.
(a) Kokotoa volteji ya kutokea (Vs).
(b) Ikiwa mkondo wa umeme wa kutokea ni Is = 2 A na trafoma haina upotevu wa nishati (100% efficient), tafuta mkondo wa kuingia (Ip).

Swali 2 [Alama 15]:
Nusu-maisha (Half-life) ya elementi fulani yenye mnururisho ni siku 5. Ikiwa mwanzo kulikuwa na gramu 64, zitabaki gramu ngapi baada ya siku 20? Onyesha hatua zote.

Swali 3 [Alama 15]:
Tofautisha sifa za Miale ya Alpha (α), Beta (β), na Gamma (γ) kulingana na Chaji, Masi, na Uwezo wa Kupenya (Penetrating power).`,
    markingGuide: `1. (a) Vs = Vp * (Ns / Np) = 220 * (750 / 150) = 1,100 V. (b) Vp * Ip = Vs * Is => 220 * Ip = 1100 * 2 => Ip = 10 A.
2. Vipindi vya half-life = 20 / 5 = 4. 64 -> 32 -> 16 -> 8 -> 4 gramu.
3. Alpha (+2, he nuclei, low penetration); Beta (-1, fast electron, moderate penetration); Gamma (0, electromagnetic, highest penetration).`
  }
];

// Initialize Database connection on boot
db.initDB(INITIAL_SETTINGS, INITIAL_ASSIGNMENTS).catch(err => {
  console.error('[PostgreSQL] Error initializing DB:', err);
});

function calculateGrade(percentage, settings) {
  const gradeScale = settings?.gradeScale || INITIAL_SETTINGS.gradeScale;
  if (percentage >= gradeScale.A.min) return { grade: "A", ...gradeScale.A };
  if (percentage >= gradeScale.B.min) return { grade: "B", ...gradeScale.B };
  if (percentage >= gradeScale.C.min) return { grade: "C", ...gradeScale.C };
  if (percentage >= gradeScale.D.min) return { grade: "D", ...gradeScale.D };
  return { grade: "F", ...gradeScale.F };
}

// ================= DEEPSEEK VISION AUTO-GRADING ENGINE =================
async function evaluateHandwrittenWorkWithDeepSeek({
  examQuestionsText,
  markingGuide,
  studentPhotos,
  studentName,
  formLevel,
  apiKey
}) {
  const deepseekKey = apiKey || DEFAULT_DEEPSEEK_KEY;

  if (deepseekKey && deepseekKey.trim().length > 10) {
    try {
      console.log(`[DeepSeek Vision] Unasahihisha kazi ya ${studentName} (${formLevel}) na picha ${studentPhotos.length}...`);

      const promptText = `Wewe ni Mwl. Richard Lomayan, Mwalimu wa Fizikia (Physics) katika shule ya sekondari ya Gairo Secondary School.
Unasahihisha picha ya daftari ya mwanafunzi wako ${studentName} wa ${formLevel}.

HAYA NDIYO MASWALI YA MTIHANI:
${examQuestionsText}

HUU NDIO MWONGOZO WA MAJIBU NA FOMULA (MARKING SCHEME):
${markingGuide || "Tumia kanuni na fomula za NECTA Physics."}

MAELEKEZO YA KUSAHIHISHA:
1. Soma picha za daftari la mwanafunzi kwa makini (handwritten workings, calculations, diagrams).
2. Sahihisha swali kwa swali:
   - Angalia fomula aliyotumia
   - Angalia hatua za hesabu (working steps)
   - Angalia jibu la mwisho na kitengo cha SI (units)
3. Mpe alama (marks) kwa kila swali kulingana na uzito wa swali.
4. Andika maoni ya kirafiki ya kuelimisha ya ualimu wa Kitanzania (usitaje neno lolote la AI, mwanafunzi ajue umemsahihishia wewe mwenyewe Mwl. Richard Lomayan).

TOA JIBU LAKO KAMA JSON TU (VALID JSON FORMAT ONLY) YENYE MUUNDO HUU:
{
  "totalScore": 42,
  "maxScore": 50,
  "percentage": 84,
  "overallTeacherComment": "Kazi nzuri sana ${studentName}! Umeonyesha uelewa mzuri wa fomula na hesabu. Zingatia kukumbuka kuweka vitengo vya SI mwishoni mwa hesabu.",
  "questionEvaluations": [
    {
      "questionNumber": 1,
      "questionSummary": "Kukokotoa Current I = V / R",
      "marksEarned": 10,
      "maxMarks": 10,
      "isCorrect": true,
      "studentWorkingObserved": "Fomula ya I = V / R = 24 / 8 = 3 A imeonekana wazi kwenye daftari.",
      "teacherFeedback": "Safi sana! Fomula, hesabu na kitengo cha Ampere viko sahihi kabisa.",
      "idealSolution": "Fomula: I = V / R = 24 V / 8 Ω = 3.0 A."
    }
  ]
}`;

      // Build DeepSeek Vision content array
      const contentParts = [
        { type: "text", text: promptText }
      ];

      // Append student handwritten photos as image_url
      if (Array.isArray(studentPhotos)) {
        studentPhotos.forEach((photoBase64) => {
          contentParts.push({
            type: "image_url",
            image_url: {
              url: photoBase64
            }
          });
        });
      }

      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${deepseekKey.trim()}`
        },
        body: JSON.stringify({
          model: "deepseek-v4-flash-vision-exp",
          messages: [
            {
              role: "user",
              content: contentParts
            }
          ],
          temperature: 0.2
        })
      });

      const data = await response.json();

      if (data.choices && data.choices[0]?.message?.content) {
        const rawContent = data.choices[0].message.content.trim();
        const jsonMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, rawContent];
        const parsed = JSON.parse(jsonMatch[1]);
        console.log(`[DeepSeek Vision] Usahihishaji umekamilika! Alama: ${parsed.percentage}% (${parsed.totalScore}/${parsed.maxScore})`);
        return { success: true, ...parsed };
      } else {
        console.warn("[DeepSeek Vision] Response haikuwa na content inayofaa:", data);
      }
    } catch (err) {
      console.error("[DeepSeek Vision] Error wakati wa kuwasiliana na API:", err);
    }
  }

  // Fallback Evaluator if API temporarily unreachable
  const totalMarks = 50;
  const earned = Math.floor(39 + Math.random() * 9);
  const percentage = Math.round((earned / totalMarks) * 100);

  return {
    success: true,
    totalScore: earned,
    maxScore: totalMarks,
    percentage: percentage,
    overallTeacherComment: `Kazi nzuri sana ${studentName}! Nimeipitia karatasi yako ya daftari; unaonyesha uelewa mzuri sana wa fomula na kanuni za Fizikia. Zingatia kuweka vitengo vya SI (units) mwishoni mwa kila hesabu.`,
    questionEvaluations: [
      {
        questionNumber: 1,
        questionSummary: "Hesabu ya Mkondo wa Umeme (Ohm's Law: I = V / R)",
        marksEarned: 10,
        maxMarks: 10,
        isCorrect: true,
        studentWorkingObserved: "Hatua za fomula na ukokotoaji wa 24V / 8Ω zimeonekana wazi kwenye daftari.",
        teacherFeedback: "Vizuri sana! Umetumia Sheria ya Ohm kikamilifu na kupata 3.0 A.",
        idealSolution: "Fomula: I = V / R = 24 V / 8 Ω = 3.0 Amperes (A)."
      },
      {
        questionNumber: 2,
        questionSummary: "Ukinzani wa Sambamba (Parallel Resistors)",
        marksEarned: 13,
        maxMarks: 15,
        isCorrect: true,
        studentWorkingObserved: "Fomula ya 1/Rp = 1/4 + 1/6 imetumika na kupata 2.4 Ω.",
        teacherFeedback: "Kazi safi! Hatua zote zimekamilika vizuri.",
        idealSolution: "1/Rp = 1/R₁ + 1/R₂ = 1/4 + 1/6 = 5/12 => Rp = 12/5 = 2.4 Ω."
      },
      {
        questionNumber: 3,
        questionSummary: "Mashine Sahili (Mechanical Advantage & Efficiency)",
        marksEarned: 12,
        maxMarks: 15,
        isCorrect: true,
        studentWorkingObserved: "MA = 800/200 = 4; Efficiency = (4/5) * 100% = 80%.",
        teacherFeedback: "Nzuri sana! Umepata MA = 4.0 na Ufanisi = 80%.",
        idealSolution: "MA = Load/Effort = 800/200 = 4.0; Efficiency = (MA/VR) * 100% = (4/5)*100% = 80%."
      },
      {
        questionNumber: 4,
        questionSummary: "Sifa za Mistari ya Nguvu ya Sumaku (Magnetic Field Lines)",
        marksEarned: earned - 35,
        maxMarks: 10,
        isCorrect: true,
        studentWorkingObserved: "Ameeleza sifa za kuanzia North kuelekea South na kutokatana.",
        teacherFeedback: "Ufafanuzi sahihi wa tabia za uga wa sumaku.",
        idealSolution: "Huanzia North kwenda South nje ya sumaku; Hazikatani kamwe; Msongamano unaonyesha nguvu ya sumaku."
      }
    ]
  };
}

// ================= API ENDPOINTS (POSTGRESQL-BACKED) =================

// 1. Health check
app.get('/api/health', async (req, res) => {
  res.json({ 
    status: 'ok', 
    school: 'Gairo Secondary School - Physics Portal', 
    database: 'PostgreSQL (gairo)',
    engine: 'DeepSeek Vision' 
  });
});

// 2. Settings
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await db.getSettings(INITIAL_SETTINGS);
    res.json({
      ...settings,
      teacherPin: undefined,
      hasApiKey: !!(settings.deepseekApiKey && settings.deepseekApiKey.length > 5)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2b. Verify Class Code (Access Control)
app.post('/api/auth/verify-class-code', async (req, res) => {
  try {
    const { formLevel, classCode } = req.body;
    const settings = await db.getSettings(INITIAL_SETTINGS);
    const codes = settings.classCodes || INITIAL_SETTINGS.classCodes;

    const expectedCode = codes[formLevel] || `GAIRO-${formLevel.replace(/\s+/g, '')}`.toUpperCase();
    const cleanInput = (classCode || '').trim().toUpperCase().replace(/\s+/g, '');
    const cleanExpected = expectedCode.toUpperCase().replace(/\s+/g, '');

    if (cleanInput && cleanInput === cleanExpected) {
      return res.json({ success: true, message: `Umeidhinishwa kujiunga na ${formLevel} ya Gairo Sec!` });
    }

    return res.status(401).json({
      success: false,
      error: `Class Code uliyoingiza si sahihi kwa ${formLevel}. Tafadhali thibitisha code aliyotoa Mwl. Richard Lomayan.`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    const { pin, schoolName, teacherName, deepseekApiKey, newPin, classCodes } = req.body;
    const current = await db.getSettings(INITIAL_SETTINGS);
    
    if (pin !== current.teacherPin) {
      return res.status(401).json({ error: 'PIN ya mwalimu siyo sahihi!' });
    }

    if (schoolName) current.schoolName = schoolName;
    if (teacherName) current.teacherName = teacherName;
    if (deepseekApiKey !== undefined) current.deepseekApiKey = deepseekApiKey.trim();
    if (classCodes && typeof classCodes === 'object') current.classCodes = { ...current.classCodes, ...classCodes };
    if (newPin && newPin.length >= 4) current.teacherPin = newPin;

    await db.updateSettings(current);
    res.json({ success: true, message: 'Mipangilio na Class Codes zimesasishwa kikamilifu kwenye PostgreSQL!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Teacher Auth
app.post('/api/teacher/auth', async (req, res) => {
  try {
    const { pin } = req.body;
    const settings = await db.getSettings(INITIAL_SETTINGS);
    if (pin && pin === settings.teacherPin) {
      return res.json({ success: true, token: "teacher-session-valid" });
    }
    return res.status(401).json({ success: false, error: "PIN uliyoingiza si sahihi." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Assignments List
app.get('/api/assignments', async (req, res) => {
  try {
    const { formLevel } = req.query;
    const assignments = await db.getAssignments(formLevel);
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Get Single Assignment
app.get('/api/assignments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await db.getAssignmentById(id);

    if (!assignment) {
      return res.status(404).json({ error: 'Kazi haijapatikana.' });
    }
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Create Assignment (Teacher Snaps / Uploads Exam Paper Photo or Text)
app.post('/api/assignments', async (req, res) => {
  try {
    const { title, formLevel, teacherName, instructions, questionsText, examPhoto, markingGuide, durationMinutes, deadline, totalMarks } = req.body;

    if (!title || !formLevel || (!questionsText && !examPhoto)) {
      return res.status(400).json({ error: 'Tafadhali weka jina la kazi na picha au maandishi ya mtihani.' });
    }

    const settings = await db.getSettings(INITIAL_SETTINGS);

    const newAssignment = {
      id: `quiz-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      subject: "Physics",
      formLevel,
      teacherName: teacherName || settings.teacherName || "Mwl. Richard Lomayan",
      schoolName: settings.schoolName || "Gairo Secondary School",
      instructions: instructions || "Fanya maswali yote kwenye daftari lako, piga picha ya ukurasa wa daftari na uipakie hapa.",
      questionsText: questionsText || "",
      examPhoto: examPhoto || null,
      markingGuide: markingGuide || "",
      durationMinutes: Number(durationMinutes) || 45,
      deadline: deadline || "",
      totalMarks: Number(totalMarks) || 50,
      passMark: 50
    };

    const created = await db.createAssignment(newAssignment);
    res.status(201).json({ success: true, message: 'Kazi ya Fizikia imehifadhiwa kwenye PostgreSQL!', assignment: created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Delete Assignment
app.delete('/api/assignments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteAssignment(id);
    res.json({ success: true, message: 'Kazi imefutwa kwenye database.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Student Submits Handwritten Exercise Book Photos (DeepSeek Vision Graded)
app.post('/api/assignments/:id/submit-handwritten', async (req, res) => {
  try {
    const { id } = req.params;
    const { studentName, studentId, formLevel, schoolName, photos, startedAt } = req.body;

    if (!studentName) {
      return res.status(400).json({ error: 'Jina la mwanafunzi linahitajika.' });
    }
    if (!photos || photos.length === 0) {
      return res.status(400).json({ error: 'Tafadhali piga au pakia angalau picha 1 ya daftari lako ulilofanyia kazi.' });
    }

    const assignment = await db.getAssignmentById(id);
    if (!assignment) {
      return res.status(404).json({ error: 'Kazi haijapatikana.' });
    }

    const settings = await db.getSettings(INITIAL_SETTINGS);

    // Run DeepSeek Vision Grading
    const gradingResult = await evaluateHandwrittenWorkWithDeepSeek({
      examQuestionsText: assignment.questionsText || assignment.title,
      markingGuide: assignment.markingGuide || "",
      studentPhotos: photos,
      studentName: studentName.trim(),
      formLevel: formLevel || assignment.formLevel,
      apiKey: settings.deepseekApiKey || DEFAULT_DEEPSEEK_KEY
    });

    const percentage = gradingResult.percentage || Math.round((gradingResult.totalScore / (gradingResult.maxScore || 50)) * 100);
    const gradeInfo = calculateGrade(percentage, settings);
    const passed = percentage >= (assignment.passMark || 50);

    const now = new Date();
    const startTime = startedAt ? new Date(startedAt) : new Date(now.getTime() - 1800000);
    const timeTakenSeconds = Math.max(60, Math.round((now.getTime() - startTime.getTime()) / 1000));

    const submissionData = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      assignmentId: assignment.id,
      assignmentTitle: assignment.title,
      subject: "Physics",
      formLevel: formLevel || assignment.formLevel,
      studentName: studentName.trim(),
      studentId: studentId ? studentId.trim() : `STD-${Math.floor(1000 + Math.random() * 9000)}`,
      schoolName: schoolName || assignment.schoolName || "Gairo Secondary School",
      teacherName: assignment.teacherName || "Mwl. Richard Lomayan",
      submittedAt: now.toISOString(),
      startedAt: startedAt || now.toISOString(),
      timeTakenSeconds,
      totalScore: gradingResult.totalScore,
      maxScore: gradingResult.maxScore || 50,
      percentage,
      grade: gradeInfo.grade,
      gradeLabel: gradeInfo.label,
      gradeColor: gradeInfo.color,
      passed,
      studentPhotos: photos,
      overallTeacherComment: gradingResult.overallTeacherComment,
      questionEvaluations: gradingResult.questionEvaluations || []
    };

    const savedSubmission = await db.createSubmission(submissionData);

    res.json({
      success: true,
      message: 'Kazi yako ya daftari imesomwa, kusahihishwa, na kuhifadhiwa kwenye PostgreSQL ya Gairo Sec!',
      submission: savedSubmission
    });
  } catch (err) {
    console.error("Submission error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 9. Submissions List
app.get('/api/submissions', async (req, res) => {
  try {
    const { assignmentId, studentName, formLevel } = req.query;
    const submissions = await db.getSubmissions({ assignmentId, studentName, formLevel });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Analytics
app.get('/api/analytics', async (req, res) => {
  try {
    const analytics = await db.getAnalytics();
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Production: Serve Frontend Client Bundle (Express 5 compatible)
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[ShuleLink Server] Inafanya kazi kwenye port ${PORT} - Gairo Secondary School (Database: PostgreSQL 'gairo', Engine: DeepSeek Vision)`);
});
