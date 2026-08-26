import 'dotenv/config';
import pg from 'pg';

const isProduction = process.env.NODE_ENV === 'production';
const useSSL = process.env.PGSSL === 'true' || 
               process.env.PGSSLMODE === 'require' || 
               (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('sslmode=require'));

const poolConfig = (process.env.DATABASE_URL || process.env.POSTGRES_URL)
  ? {
      connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
      ssl: useSSL ? { rejectUnauthorized: false } : undefined,
      max: parseInt(process.env.PGMAX || '20'),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    }
  : {
      user: process.env.PGUSER || 'gairo_user',
      host: process.env.PGHOST || 'localhost',
      password: process.env.PGPASSWORD || 'GairoSec2026!',
      port: parseInt(process.env.PGPORT || '5432'),
      database: process.env.PGDATABASE || 'gairo',
      ssl: useSSL ? { rejectUnauthorized: false } : undefined,
      max: parseInt(process.env.PGMAX || '20'),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };

const pool = new pg.Pool(poolConfig);

pool.on('error', (err) => {
  console.error('[PostgreSQL Error]', err);
});

export async function initDB(initialSettings, initialAssignments) {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
        data JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS assignments (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        form_level VARCHAR(50) NOT NULL,
        subject VARCHAR(100) DEFAULT 'Physics',
        teacher_name VARCHAR(100) DEFAULT 'Mwl. Richard Lomayan',
        school_name VARCHAR(150) DEFAULT 'Gairo Secondary School',
        instructions TEXT,
        questions_text TEXT,
        exam_photo TEXT,
        marking_guide TEXT,
        duration_minutes INTEGER DEFAULT 45,
        total_marks INTEGER DEFAULT 50,
        deadline VARCHAR(50),
        pass_mark INTEGER DEFAULT 50,
        submission_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS submissions (
        id VARCHAR(100) PRIMARY KEY,
        assignment_id VARCHAR(100),
        assignment_title VARCHAR(255),
        student_name VARCHAR(150) NOT NULL,
        student_id VARCHAR(100),
        form_level VARCHAR(50),
        subject VARCHAR(100) DEFAULT 'Physics',
        school_name VARCHAR(150) DEFAULT 'Gairo Secondary School',
        teacher_name VARCHAR(100) DEFAULT 'Mwl. Richard Lomayan',
        student_photos JSONB DEFAULT '[]',
        started_at VARCHAR(100),
        submitted_at VARCHAR(100),
        time_taken_seconds INTEGER DEFAULT 0,
        total_score NUMERIC(5,2) DEFAULT 0,
        max_score NUMERIC(5,2) DEFAULT 50,
        percentage NUMERIC(5,2) DEFAULT 0,
        grade VARCHAR(10),
        grade_label VARCHAR(50),
        grade_color VARCHAR(20),
        passed BOOLEAN DEFAULT false,
        overall_teacher_comment TEXT,
        question_evaluations JSONB DEFAULT '[]',
        marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Check settings
    const sRes = await client.query("SELECT COUNT(*) FROM settings WHERE id = 'default'");
    if (parseInt(sRes.rows[0].count) === 0 && initialSettings) {
      await client.query("INSERT INTO settings (id, data) VALUES ('default', $1)", [initialSettings]);
      console.log("[PostgreSQL] Initialized settings table.");
    }

    // Check assignments
    const aRes = await client.query("SELECT COUNT(*) FROM assignments");
    if (parseInt(aRes.rows[0].count) === 0 && initialAssignments?.length) {
      for (const a of initialAssignments) {
        await client.query(`
          INSERT INTO assignments (
            id, title, form_level, subject, teacher_name, school_name,
            instructions, questions_text, exam_photo, marking_guide,
            duration_minutes, total_marks, deadline, pass_mark, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          ON CONFLICT (id) DO NOTHING
        `, [
          a.id, a.title, a.formLevel, a.subject || 'Physics', a.teacherName || 'Mwl. Richard Lomayan',
          a.schoolName || 'Gairo Secondary School', a.instructions || '', a.questionsText || '',
          a.examPhoto || null, a.markingGuide || '', a.durationMinutes || 45, a.totalMarks || 50,
          a.deadline || '', a.passMark || 50, new Date()
        ]);
      }
      console.log(`[PostgreSQL] Initialized ${initialAssignments.length} physics assignments.`);
    }

    console.log("✅ [PostgreSQL] Connected to database 'gairo' successfully!");
  } finally {
    client.release();
  }
}

// Settings
export async function getSettings(fallbackSettings) {
  try {
    const res = await pool.query("SELECT data FROM settings WHERE id = 'default'");
    if (res.rows.length > 0) return res.rows[0].data;
    return fallbackSettings;
  } catch (err) {
    console.error("[PostgreSQL] getSettings error:", err);
    return fallbackSettings;
  }
}

export async function updateSettings(newData) {
  await pool.query(
    "INSERT INTO settings (id, data, updated_at) VALUES ('default', $1, NOW()) ON CONFLICT (id) DO UPDATE SET data = $1, updated_at = NOW()",
    [newData]
  );
  return true;
}

// Assignments
export async function getAssignments(formLevel) {
  let query = `
    SELECT 
      id, title, form_level AS "formLevel", subject, teacher_name AS "teacherName",
      school_name AS "schoolName", instructions, questions_text AS "questionsText",
      exam_photo AS "examPhoto", marking_guide AS "markingGuide",
      duration_minutes AS "durationMinutes", total_marks AS "totalMarks",
      deadline, pass_mark AS "passMark", submission_count AS "submissionCount",
      created_at AS "createdAt"
    FROM assignments
  `;
  const params = [];

  if (formLevel && formLevel !== 'all') {
    query += ` WHERE LOWER(form_level) = LOWER($1)`;
    params.push(formLevel);
  }

  query += ` ORDER BY created_at DESC`;

  const res = await pool.query(query, params);
  return res.rows;
}

export async function getAssignmentById(id) {
  const query = `
    SELECT 
      id, title, form_level AS "formLevel", subject, teacher_name AS "teacherName",
      school_name AS "schoolName", instructions, questions_text AS "questionsText",
      exam_photo AS "examPhoto", marking_guide AS "markingGuide",
      duration_minutes AS "durationMinutes", total_marks AS "totalMarks",
      deadline, pass_mark AS "passMark", submission_count AS "submissionCount",
      created_at AS "createdAt"
    FROM assignments
    WHERE id = $1
  `;
  const res = await pool.query(query, [id]);
  return res.rows[0] || null;
}

export async function createAssignment(assignment) {
  const query = `
    INSERT INTO assignments (
      id, title, form_level, subject, teacher_name, school_name,
      instructions, questions_text, exam_photo, marking_guide,
      duration_minutes, total_marks, deadline, pass_mark, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
    RETURNING 
      id, title, form_level AS "formLevel", subject, teacher_name AS "teacherName",
      school_name AS "schoolName", instructions, questions_text AS "questionsText",
      exam_photo AS "examPhoto", marking_guide AS "markingGuide",
      duration_minutes AS "durationMinutes", total_marks AS "totalMarks",
      deadline, pass_mark AS "passMark", submission_count AS "submissionCount",
      created_at AS "createdAt"
  `;
  const res = await pool.query(query, [
    assignment.id,
    assignment.title,
    assignment.formLevel,
    assignment.subject || 'Physics',
    assignment.teacherName || 'Mwl. Richard Lomayan',
    assignment.schoolName || 'Gairo Secondary School',
    assignment.instructions || '',
    assignment.questionsText || '',
    assignment.examPhoto || null,
    assignment.markingGuide || '',
    assignment.durationMinutes || 45,
    assignment.totalMarks || 50,
    assignment.deadline || '',
    assignment.passMark || 50
  ]);
  return res.rows[0];
}

export async function deleteAssignment(id) {
  await pool.query("DELETE FROM assignments WHERE id = $1", [id]);
  return true;
}

// Submissions
export async function createSubmission(sub) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const query = `
      INSERT INTO submissions (
        id, assignment_id, assignment_title, student_name, student_id,
        form_level, subject, school_name, teacher_name, student_photos,
        started_at, submitted_at, time_taken_seconds, total_score,
        max_score, percentage, grade, grade_label, grade_color,
        passed, overall_teacher_comment, question_evaluations, marked_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, NOW())
      RETURNING 
        id, assignment_id AS "assignmentId", assignment_title AS "assignmentTitle",
        student_name AS "studentName", student_id AS "studentId",
        form_level AS "formLevel", subject, school_name AS "schoolName",
        teacher_name AS "teacherName", student_photos AS "studentPhotos",
        started_at AS "startedAt", submitted_at AS "submittedAt",
        time_taken_seconds AS "timeTakenSeconds", total_score AS "totalScore",
        max_score AS "maxScore", percentage, grade, grade_label AS "gradeLabel",
        grade_color AS "gradeColor", passed,
        overall_teacher_comment AS "overallTeacherComment",
        question_evaluations AS "questionEvaluations"
    `;

    const res = await client.query(query, [
      sub.id,
      sub.assignmentId,
      sub.assignmentTitle || '',
      sub.studentName,
      sub.studentId || '',
      sub.formLevel,
      sub.subject || 'Physics',
      sub.schoolName || 'Gairo Secondary School',
      sub.teacherName || 'Mwl. Richard Lomayan',
      JSON.stringify(sub.studentPhotos || []),
      sub.startedAt || '',
      sub.submittedAt || '',
      sub.timeTakenSeconds || 0,
      sub.totalScore || 0,
      sub.maxScore || 50,
      sub.percentage || 0,
      sub.grade || 'F',
      sub.gradeLabel || '',
      sub.gradeColor || '#ef4444',
      sub.passed ?? false,
      sub.overallTeacherComment || '',
      JSON.stringify(sub.questionEvaluations || [])
    ]);

    // Increment submission count in assignment
    await client.query("UPDATE assignments SET submission_count = submission_count + 1 WHERE id = $1", [sub.assignmentId]);

    await client.query("COMMIT");
    return res.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function getSubmissions({ assignmentId, studentName, formLevel }) {
  let query = `
    SELECT 
      id, assignment_id AS "assignmentId", assignment_title AS "assignmentTitle",
      student_name AS "studentName", student_id AS "studentId",
      form_level AS "formLevel", subject, school_name AS "schoolName",
      teacher_name AS "teacherName", student_photos AS "studentPhotos",
      started_at AS "startedAt", submitted_at AS "submittedAt",
      time_taken_seconds AS "timeTakenSeconds", total_score AS "totalScore",
      max_score AS "maxScore", percentage, grade, grade_label AS "gradeLabel",
      grade_color AS "gradeColor", passed,
      overall_teacher_comment AS "overallTeacherComment",
      question_evaluations AS "questionEvaluations"
    FROM submissions
    WHERE 1=1
  `;
  const params = [];

  if (assignmentId && assignmentId !== 'all') {
    params.push(assignmentId);
    query += ` AND assignment_id = $${params.length}`;
  }

  if (formLevel && formLevel !== 'all') {
    params.push(formLevel);
    query += ` AND LOWER(form_level) = LOWER($${params.length})`;
  }

  if (studentName) {
    params.push(`%${studentName.toLowerCase()}%`);
    query += ` AND LOWER(student_name) LIKE $${params.length}`;
  }

  query += ` ORDER BY marked_at DESC`;

  const res = await pool.query(query, params);
  return res.rows;
}

export async function getAnalytics() {
  const assignCount = await pool.query("SELECT COUNT(*) FROM assignments");
  const subCount = await pool.query("SELECT COUNT(*) FROM submissions");
  const uniqueStd = await pool.query("SELECT COUNT(DISTINCT LOWER(TRIM(student_name))) FROM submissions");
  const avgScore = await pool.query("SELECT COALESCE(AVG(percentage), 0) AS avg, COUNT(CASE WHEN passed THEN 1 END) as passed_cnt FROM submissions");
  
  const gradeRes = await pool.query(`
    SELECT grade, COUNT(*) as cnt FROM submissions GROUP BY grade
  `);

  const gradeCounts = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  gradeRes.rows.forEach(r => {
    if (gradeCounts[r.grade] !== undefined) {
      gradeCounts[r.grade] = parseInt(r.cnt);
    }
  });

  const totalSubmissions = parseInt(subCount.rows[0].count);
  const passedCount = parseInt(avgScore.rows[0].passed_cnt || 0);

  const recentRes = await pool.query(`
    SELECT 
      id, assignment_id AS "assignmentId", assignment_title AS "assignmentTitle",
      student_name AS "studentName", student_id AS "studentId",
      form_level AS "formLevel", subject, percentage, grade, grade_color AS "gradeColor",
      passed, submitted_at AS "submittedAt", overall_teacher_comment AS "overallTeacherComment"
    FROM submissions
    ORDER BY marked_at DESC
    LIMIT 10
  `);

  return {
    totalAssignments: parseInt(assignCount.rows[0].count),
    totalSubmissions,
    uniqueStudents: parseInt(uniqueStd.rows[0].count),
    averageScore: Math.round(parseFloat(avgScore.rows[0].avg)),
    passRate: totalSubmissions > 0 ? Math.round((passedCount / totalSubmissions) * 100) : 0,
    gradeCounts,
    recentSubmissions: recentRes.rows
  };
}

export async function closeDB() {
  try {
    await pool.end();
    console.log('[PostgreSQL] Database pool closed gracefully.');
  } catch (err) {
    console.error('[PostgreSQL] Error closing pool:', err);
  }
}

