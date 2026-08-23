import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  BookOpen, 
  Award,
  Sparkles,
  Camera,
  ZoomIn
} from 'lucide-react';

export default function StudentDetailModal({ submission, onClose }) {
  const [zoomPhoto, setZoomPhoto] = useState(null);

  if (!submission) return null;

  const {
    studentName,
    formLevel,
    subject,
    assignmentTitle,
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
    overallTeacherComment,
    questionEvaluations
  } = submission;

  const formatSeconds = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop animate-fade">
      <div className="student-modal-card animate-slide">
        {/* Header */}
        <div className="student-modal-header">
          <div className="header-meta">
            <span className="modal-form-badge">{formLevel}</span>
            <span className="modal-sub-badge">{subject || "Physics"}</span>
            <h2>Kazi ya Mwanafunzi: {studentName}</h2>
            <p className="task-title-sub">{assignmentTitle}</p>
          </div>
          <div className="header-actions">
            <button className="btn-icon-action" onClick={handlePrint} title="Chapisha">
              <Printer size={18} />
            </button>
            <button className="btn-icon-action" onClick={onClose} title="Funga">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Score Summary Strip */}
        <div className="student-summary-strip">
          <div className="strip-item">
            <span className="strip-label">Alama (Score)</span>
            <span className="strip-val font-bold text-primary">{percentage}% ({totalScore}/{maxScore})</span>
          </div>
          <div className="strip-item">
            <span className="strip-label">Daraja (Grade)</span>
            <span className="strip-val" style={{ color: gradeColor || '#10b981', fontWeight: 800 }}>
              {grade} - {gradeLabel}
            </span>
          </div>
          <div className="strip-item">
            <span className="strip-label">Kurasa za Daftari</span>
            <span className="strip-val font-bold">{studentPhotos?.length || 1} kurasa</span>
          </div>
          <div className="strip-item">
            <span className="strip-label">Muda wa Kazi</span>
            <span className="strip-val text-muted">{formatSeconds(timeTakenSeconds)}</span>
          </div>
        </div>

        {/* Body Content */}
        <div className="student-questions-scroll">
          {/* Mwl. Richard's Comment */}
          {overallTeacherComment && (
            <div className="teacher-authentic-speech-card mb-4">
              <div className="speech-header">
                <strong>Maoni ya Usahihishaji (Mwl. Richard Lomayan):</strong>
              </div>
              <p className="speech-text">"{overallTeacherComment}"</p>
            </div>
          )}

          {/* Student's Uploaded Handwritten Photos */}
          {studentPhotos && studentPhotos.length > 0 && (
            <div className="student-photos-review-section">
              <h4>📷 Picha za Daftari za Mwanafunzi (Bofya Kukuza):</h4>
              <div className="student-photos-row">
                {studentPhotos.map((imgUrl, i) => (
                  <div key={i} className="teacher-inspect-photo" onClick={() => setZoomPhoto(imgUrl)}>
                    <img src={imgUrl} alt={`Ukurasa ${i + 1}`} />
                    <span className="zoom-hint">Ukurasa {i + 1} (Bofya ku-zoom)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Question Breakdown */}
          <div className="teacher-eval-breakdown">
            <h4>📋 Uchambuzi wa Kila Swali:</h4>
            {questionEvaluations?.map((qe, idx) => (
              <div key={idx} className="student-q-item">
                <div className="q-item-top">
                  <span className="q-index-pill">Swali {qe.questionNumber || idx + 1}: {qe.questionSummary}</span>
                  <span className="font-bold text-primary">{qe.marksEarned} / {qe.maxMarks} Marks</span>
                </div>

                {qe.studentWorkingObserved && (
                  <div className="observed-mini-box">
                    <strong>Kilichoonekana kwenye daftari:</strong> {qe.studentWorkingObserved}
                  </div>
                )}

                {qe.teacherFeedback && (
                  <div className="feedback-mini-box">
                    <strong>Ushauri:</strong> {qe.teacherFeedback}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="student-modal-footer">
          <button className="btn-secondary" onClick={onClose}>Funga</button>
        </div>

        {/* Zoom Modal */}
        {zoomPhoto && (
          <div className="modal-backdrop" onClick={() => setZoomPhoto(null)}>
            <div className="zoom-modal-card animate-slide">
              <img src={zoomPhoto} alt="Kazi ya Daftari" className="zoomed-photo" />
              <button className="btn-close-zoom" onClick={() => setZoomPhoto(null)}>
                Funga
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
