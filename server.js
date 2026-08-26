import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is always loaded from the project root directory
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 8018;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configured via environment variable (.env)
const DEFAULT_DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY || "sk-534222749ca9439b9691c0a784344665";

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

const INITIAL_ASSIGNMENTS = [];

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

// Helper to resolve a valid active DeepSeek API key (ignoring placeholders)
function resolveDeepSeekKey(apiKeyFromDb) {
  const candidates = [
    apiKeyFromDb,
    process.env.DEEPSEEK_API_KEY,
    DEFAULT_DEEPSEEK_KEY,
    "sk-534222749ca9439b9691c0a784344665"
  ];

  for (const key of candidates) {
    if (key && typeof key === 'string') {
      const clean = key.trim();
      if (clean.startsWith('sk-') && !clean.includes('your-') && clean.length > 20) {
        return clean;
      }
    }
  }
  return "sk-534222749ca9439b9691c0a784344665";
}

// ================= DEEPSEEK VISION AUTO-GRADING ENGINE =================
async function evaluateHandwrittenWorkWithDeepSeek({
  examQuestionsText,
  markingGuide,
  totalMarks = 50,
  studentPhotos,
  studentName,
  formLevel,
  apiKey
}) {
  const deepseekKey = resolveDeepSeekKey(apiKey);

  console.log(`[DeepSeek Vision] Inasahihisha kazi ya ${studentName} (${formLevel}) na picha ${studentPhotos?.length || 0} (Key: ${deepseekKey.substring(0, 8)}...)...`);

  try {
    const promptText = `Wewe ni Mwalimu Richard Lomayan, Mwalimu wa Fizikia (Physics) katika shule ya sekondari ya Gairo Secondary School.
Unasahihisha picha ya daftari alilofanyia kazi mwanafunzi wako ${studentName} wa ${formLevel}.

HAYA NDIYO MASWALI YA MTIHANI:
${examQuestionsText}

MWONGOZO WA MAJIBU NA FOMULA (MARKING SCHEME):
${markingGuide || "Tumia kanuni, fomula na njia sahihi za Fizikia za NECTA."}

JUMLA YA ALAMA: ${totalMarks}

MAELEKEZO YA KUSAHIHISHA:
1. Soma maandishi ya mkononi (handwritten workings) kwenye picha ya daftari la mwanafunzi.
2. Sahihisha swali kwa swali:
   - Angalia fomula alizotumia
   - Angalia njia na hatua za hesabu (calculation steps)
   - Angalia jibu la mwisho na vitengo vya SI (units)
   - Mpe alama (marks) anazostahili kulingana na usahihi wake
3. Andika maoni ya kirafiki ya kuelimisha ya ualimu wa Kitanzania kwa Kiswahili (bila kutaja neno AI).
4. TOA JIBU LAKO KAMA JSON TU KATIKA MUUNDO HUU:
\`\`\`json
{
  "totalScore": 42,
  "maxScore": ${totalMarks},
  "percentage": 84,
  "overallTeacherComment": "Kazi nzuri sana ${studentName}! Umeonyesha uelewa mzuri wa fomula na hesabu...",
  "questionEvaluations": [
    {
      "questionNumber": 1,
      "questionSummary": "Muhtasari wa swali",
      "marksEarned": 10,
      "maxMarks": 10,
      "isCorrect": true,
      "studentWorkingObserved": "Hatua na fomula zilizopo kwenye daftari",
      "teacherFeedback": "Maoni ya ualimu kwa mwanafunzi kuhusu swali hili",
      "idealSolution": "Fomula na jibu sahihi"
    }
  ]
}
\`\`\``;

    const contentParts = [
      { type: "text", text: promptText }
    ];

    if (Array.isArray(studentPhotos)) {
      studentPhotos.forEach((photoBase64) => {
        if (photoBase64 && typeof photoBase64 === 'string') {
          contentParts.push({
            type: "image_url",
            image_url: {
              url: photoBase64.startsWith('data:') ? photoBase64 : `data:image/jpeg;base64,${photoBase64}`
            }
          });
        }
      });
    }

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${deepseekKey}`
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
      
      try {
        const parsed = JSON.parse(jsonMatch[1] || rawContent);
        const computedTotal = Number(parsed.totalScore) ?? 0;
        const maxPossible = Number(parsed.maxScore) || totalMarks;
        const computedPercentage = typeof parsed.percentage === 'number' 
          ? parsed.percentage 
          : Math.round((computedTotal / maxPossible) * 100);

        console.log(`[DeepSeek Vision] ✅ Usahihishaji umekamilika! Alama: ${computedPercentage}% (${computedTotal}/${maxPossible})`);
        return {
          success: true,
          totalScore: computedTotal,
          maxScore: maxPossible,
          percentage: computedPercentage,
          overallTeacherComment: parsed.overallTeacherComment || `Kazi ya ${studentName} imesahihishwa.`,
          questionEvaluations: Array.isArray(parsed.questionEvaluations) ? parsed.questionEvaluations : []
        };
      } catch (parseErr) {
        console.warn("[DeepSeek Vision] Formatting raw AI response:", parseErr.message);
        return {
          success: true,
          totalScore: 0,
          maxScore: totalMarks,
          percentage: 0,
          overallTeacherComment: rawContent.replace(/```json|```/g, '').trim(),
          questionEvaluations: [
            {
              questionNumber: 1,
              questionSummary: "Masahihisho ya Kazi",
              marksEarned: 0,
              maxMarks: totalMarks,
              isCorrect: false,
              studentWorkingObserved: "Tathmini ya picha imekamilika.",
              teacherFeedback: rawContent.substring(0, 300),
              idealSolution: "Tafadhali hakikisha unapiga picha wazi ya daftari lako."
            }
          ]
        };
      }
    } else {
      console.error("[DeepSeek Vision] API error:", data);
      throw new Error(data.error?.message || "Hitilafu wakati wa kusoma picha kutoka DeepSeek Vision");
    }
  } catch (err) {
    console.error("[DeepSeek Vision] Error:", err.message);
    throw err;
  }
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
      totalMarks: Number(assignment.totalMarks) || 50,
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
} else {
  app.get('/', (req, res) => {
    res.send(`
      <div style="font-family: sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; text-align: center;">
        <h2 style="color: #0284c7;">🎓 ShuleLink - Gairo Secondary School</h2>
        <p>API Server ipo hewani kikamilifu kwenye Port ${PORT}!</p>
        <p style="background: #f1f5f9; padding: 12px; border-radius: 6px; font-family: monospace;">
          Ili kuona UI ya mfumo kwenye browser, tafadhali endesha <code>npm run build</code> kwenye VPS.
        </p>
      </div>
    `);
  });
}

const server = app.listen(PORT, () => {
  console.log(`[ShuleLink Server] Inafanya kazi kwenye port ${PORT} - Gairo Secondary School (Database: PostgreSQL 'gairo', Engine: DeepSeek Vision)`);
});

// Graceful Shutdown for PM2 & Docker
async function handleShutdown(signal) {
  console.log(`[ShuleLink Server] Imepokea ${signal}. Inafunga seva na PostgreSQL pool...`);
  server.close(async () => {
    await db.closeDB();
    console.log('[ShuleLink Server] Seva imefungwa salama.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

