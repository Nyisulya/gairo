import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Printer, 
  Share2, 
  RefreshCw, 
  Sparkles, 
  Award,
  ArrowRight,
  School,
  FileText,
  UserCheck,
  Eye,
  Camera
} from 'lucide-react';

export default function ResultView({ 
  result, 
  onBackToHome 
}) {
  useEffect(() => {
    if (result && (result.grade === 'A' || result.grade === 'B' || result.percentage >= 65)) {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (err) {
        console.log("Confetti trigger:", err);
      }
    }
  }, [result]);

  if (!result) return null;

  const {
    assignmentTitle,
    subject,
    formLevel,
    studentName,
    schoolName,
    teacherName,
    submittedAt,
    timeTakenSeconds,
    totalScore,
    maxScore,
    percentage,
    grade,
    gradeLabel,
    gradeColor,
    passed,
    studentPhotos,
    studentPhotosCount,
    overallTeacherComment,
    questionEvaluations
  } = result;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `🎓 *MATOKEO YA FIZIKIA - ${schoolName?.toUpperCase() || 'GAIRO SECONDARY SCHOOL'}*\n\n` +
      `👤 *Mwanafunzi:* ${studentName}\n` +
      `🏫 *Darasa:* ${formLevel}\n` +
      `👨‍🏫 *Mwalimu wa Somo:* ${teacherName || 'Mwl. Richard Lomayan'}\n` +
      `📝 *Kazi ya Likizo:* ${assignmentTitle}\n\n` +
      `📊 *Alama:* ${percentage}% (${totalScore}/${maxScore})\n` +
      `🏆 *Daraja (Grade):* ${grade} - ${gradeLabel}\n\n` +
      `💬 *Maoni ya Mwalimu:* "${overallTeacherComment || 'Kazi nzuri sana, endelea kufanya mazoezi ya Fizikia.'}"\n\n` +
      `_Imezalishwa kidijitali na Shule ya Sekondari ya Gairo._`;
    
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="result-view-container animate-fade">
      {/* Printable Official Slip Header */}
      <div className="print-header print-only">
        <div className="print-school-banner">
          <h1>{schoolName || "GAIRO SECONDARY SCHOOL"}</h1>
          <h2>IDARA YA SAYANSI NA FIZIKIA (PHYSICS DEPARTMENT)</h2>
          <h3>Ripoti Rasmi ya Kazi ya Likizo ya Mwanafunzi (Holiday Physics Assessment Slip)</h3>
        </div>
        <div className="print-meta-grid">
          <div><strong>Mwanafunzi:</strong> {studentName}</div>
          <div><strong>Kidato:</strong> {formLevel}</div>
          <div><strong>Somo:</strong> Fizikia (Physics)</div>
          <div><strong>Mwalimu:</strong> {teacherName || "Mwl. Richard Lomayan"}</div>
          <div><strong>Tarehe ya Kazi:</strong> {new Date(submittedAt).toLocaleDateString()}</div>
          <div><strong>Alama na Daraja:</strong> {percentage}% ({grade} - {gradeLabel})</div>
        </div>
      </div>

      {/* Hero Result Banner */}
      <div className="result-hero-card">
        <div className="result-hero-badge">
          <Sparkles size={18} />
          <span>Matokeo ya Daftari ya Fizikia - {schoolName || "Gairo Secondary School"}</span>
        </div>

        <div className="result-main-grid">
          {/* Grade Circle Badge */}
          <div className="grade-highlight-box">
            <div 
              className="grade-circle-badge"
              style={{ borderColor: gradeColor || '#10b981', color: gradeColor || '#10b981' }}
            >
              <span className="grade-letter">{grade}</span>
              <span className="grade-label-small">{gradeLabel}</span>
            </div>
            <div className="score-percentage-text">
              <span className="percent-val">{percentage}%</span>
              <span className="score-ratio">({totalScore} / {maxScore} Alama)</span>
            </div>
            <div className={`status-pill ${passed ? 'passed-pill' : 'failed-pill'}`}>
              <Award size={16} />
              <span>{passed ? 'UFAULU MZURI' : 'HITAJI LA MAZOEZI'}</span>
            </div>
          </div>

          {/* Student & Task Meta */}
          <div className="result-meta-box">
            <div className="meta-student-header">
              <span className="meta-sub-pill">Fizikia (Physics)</span>
              <span className="meta-form-pill">{formLevel}</span>
              <span className="school-pill-sm">{schoolName || "Gairo Sec"}</span>
              <h2 className="meta-task-title">{assignmentTitle}</h2>
              <p className="meta-student-name">
                Mwanafunzi: <strong>{studentName}</strong> | Mwalimu wa Somo: <strong>{teacherName || "Mwl. Richard Lomayan"}</strong>
              </p>
            </div>

            {/* Mwl. Richard Lomayan's Authentic Teacher Comment */}
            {overallTeacherComment && (
              <div className="teacher-authentic-speech-card">
                <div className="speech-header">
                  <UserCheck size={18} className="text-primary" />
                  <strong>Maoni ya Mwl. Richard Lomayan:</strong>
                </div>
                <p className="speech-text">"{overallTeacherComment}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="result-actions-toolbar no-print">
          <button type="button" className="btn-action-hero" onClick={onBackToHome}>
            <RefreshCw size={18} />
            <span>Fanya Kazi Nyingine</span>
          </button>
          <button type="button" className="btn-action-secondary" onClick={handlePrint}>
            <Printer size={18} />
            <span>Chapisha / Hifadhi PDF</span>
          </button>
          <button type="button" className="btn-action-whatsapp" onClick={handleShareWhatsApp}>
            <Share2 size={18} />
            <span>Tuma Matokeo WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Uploaded Handwritten Pages Thumbnail Strip */}
      {studentPhotos && studentPhotos.length > 0 && (
        <div className="handwritten-pages-strip no-print">
          <div className="strip-title-row">
            <Camera size={18} className="text-primary" />
            <h4>Kurasa za Daftari Ulizotuma kwa Mwalimu ({studentPhotos.length})</h4>
          </div>
          <div className="strip-photos-scroll">
            {studentPhotos.map((photo, pIdx) => (
              <div key={pIdx} className="strip-photo-item">
                <img src={photo} alt={`Kazi Ukurasa ${pIdx + 1}`} className="strip-photo-thumb" />
                <span>Ukurasa {pIdx + 1}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Question-by-Question Evaluation */}
      <div className="detailed-review-section">
        <div className="review-section-header">
          <div className="review-header-title">
            <FileText size={22} className="text-primary" />
            <h3>Uchambuzi wa Kila Swali (Alama & Njia za Ufumbuzi)</h3>
          </div>
          <span className="review-header-hint">
            Angalia kile Mwl. Richard Lomayan alichokiona kwenye daftari lako na njia sahihi ya fomula.
          </span>
        </div>

        <div className="questions-review-list">
          {questionEvaluations?.map((qe, idx) => (
            <div 
              key={idx} 
              className={`review-question-card ${qe.isCorrect ? 'card-correct' : 'card-wrong'}`}
            >
              <div className="review-q-top">
                <div className="review-q-number">
                  <span className="q-badge">Swali {qe.questionNumber || idx + 1}</span>
                  <span className="q-summary-label">{qe.questionSummary}</span>
                </div>
                <div className="q-score-badge">
                  <strong>{qe.marksEarned} / {qe.maxMarks} Marks</strong>
                </div>
              </div>

              {/* Student Working Observed by Teacher */}
              {qe.studentWorkingObserved && (
                <div className="observed-working-box">
                  <span className="observed-label">Alichobaini Mwalimu Kwenye Daftari:</span>
                  <p className="observed-text">{qe.studentWorkingObserved}</p>
                </div>
              )}

              {/* Teacher's Feedback */}
              {qe.teacherFeedback && (
                <div className="teacher-direct-feedback">
                  <span className="feedback-label">Ushauri wa Mwalimu:</span>
                  <p className="feedback-text">"{qe.teacherFeedback}"</p>
                </div>
              )}

              {/* Ideal Solution & Formula */}
              {qe.idealSolution && (
                <div className="teacher-explanation-box">
                  <div className="explanation-title">
                    <Sparkles size={16} />
                    <strong>💡 Njia Sahihi ya Fomula (Mwl. Richard Lomayan):</strong>
                  </div>
                  <p className="explanation-text">{qe.idealSolution}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bottom-home-btn-wrap no-print">
          <button type="button" className="btn-action-hero" onClick={onBackToHome}>
            <span>Rudi Kwenye Kazi za Likizo</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
