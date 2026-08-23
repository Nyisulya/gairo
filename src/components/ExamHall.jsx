import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  User, 
  BookOpen, 
  Send, 
  Sparkles,
  Maximize2,
  FileText,
  Plus,
  ShieldCheck,
  ZoomIn,
  AlertTriangle
} from 'lucide-react';

export default function ExamHall({ 
  assignment, 
  studentProfile, 
  onSubmitHandwritten, 
  onCancel 
}) {
  const sessionKey = `shule_exam_start_${assignment.id}_${studentProfile?.name?.trim().toLowerCase() || 'student'}`;
  const photosKey = `shule_exam_photos_${assignment.id}_${studentProfile?.name?.trim().toLowerCase() || 'student'}`;

  // 1. Persistent Start Timestamp (Never resets on refresh/exit until submitted or cancelled)
  const [startedAt] = useState(() => {
    const saved = localStorage.getItem(sessionKey);
    if (saved) return saved;
    const now = new Date().toISOString();
    localStorage.setItem(sessionKey, now);
    return now;
  });

  const totalDurationSecs = (assignment.durationMinutes || 45) * 60;

  // Real-time calculation of remaining seconds based on system clock
  const calculateRemaining = useCallback(() => {
    const startMillis = new Date(startedAt).getTime();
    const elapsedSecs = Math.floor((Date.now() - startMillis) / 1000);
    return Math.max(0, totalDurationSecs - elapsedSecs);
  }, [startedAt, totalDurationSecs]);

  const [secondsRemaining, setSecondsRemaining] = useState(calculateRemaining);

  // 2. Persistent Uploaded/Snapped Photos (Doesn't lose progress if camera switches app)
  const [photos, setPhotos] = useState(() => {
    try {
      const saved = localStorage.getItem(photosKey);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPhotoZoom, setSelectedPhotoZoom] = useState(null);
  const fileInputRef = useRef(null);

  // Countdown timer bound to real clock
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateRemaining();
      setSecondsRemaining(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [calculateRemaining]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Helper to persist photos state
  const savePhotos = (newPhotos) => {
    setPhotos(newPhotos);
    try {
      localStorage.setItem(photosKey, JSON.stringify(newPhotos));
    } catch (e) {
      console.warn("Storage quota limit reached for draft photos", e);
    }
  };

  // Client-side fast image compression (reduces a 5MB phone photo down to ~150KB in milliseconds!)
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1400; // Optimal resolution for reading handwritten physics text

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.78);
          resolve(compressedDataUrl);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newCompressed = [];
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        const compressed = await compressImage(file);
        newCompressed.push(compressed);
      }
    }
    const updated = [...photos, ...newCompressed];
    savePhotos(updated);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemovePhoto = (index) => {
    const updated = photos.filter((_, i) => i !== index);
    savePhotos(updated);
  };

  const handleCancelExam = () => {
    if (confirm("Je, una uhakika unataka kuondoka kwenye mtihani huu? Muda wako wa mtihani utafutwa ukianza upya.")) {
      localStorage.removeItem(sessionKey);
      localStorage.removeItem(photosKey);
      onCancel();
    }
  };

  const handleSubmit = async () => {
    if (!photos.length) {
      alert("Tafadhali piga angalau picha 1 ya ukurasa wa daftari lako lenye hesabu kabla ya kuwasilisha.");
      return;
    }

    setIsSubmitting(true);
    // Clear session storage on submission so future retakes start fresh
    localStorage.removeItem(sessionKey);
    localStorage.removeItem(photosKey);

    await onSubmitHandwritten({
      assignmentId: assignment.id,
      studentName: studentProfile.name,
      studentId: studentProfile.studentId,
      formLevel: studentProfile.formLevel || assignment.formLevel,
      schoolName: studentProfile.schoolName || assignment.schoolName,
      photos,
      startedAt
    });
    setIsSubmitting(false);
  };

  const isTimeUp = secondsRemaining <= 0;

  return (
    <div className="snap-exam-container animate-fade">
      {/* Top Bar */}
      <div className="snap-top-banner">
        <div className="banner-left">
          <div className="banner-badges">
            <span className="subject-pill">Fizikia (Physics)</span>
            <span className="form-pill">{assignment.formLevel}</span>
            <span className="school-pill">{assignment.schoolName || "Gairo Secondary School"}</span>
          </div>
          <h1 className="snap-exam-title">{assignment.title}</h1>
          <p className="snap-exam-meta">
            Mwanafunzi: <strong>{studentProfile.name}</strong> | Mwalimu: <strong>{assignment.teacherName || "Mwl. Richard Lomayan"}</strong>
          </p>
        </div>

        <div className="banner-timer-box">
          <Clock size={18} className="timer-icon" />
          <div className="timer-text">
            <span className="timer-label">Muda Uliobaki:</span>
            <span className="timer-count" style={{ color: secondsRemaining < 300 ? '#f87171' : '#ffffff' }}>
              {formatTime(secondsRemaining)}
            </span>
          </div>
        </div>
      </div>

      {isTimeUp && (
        <div className="time-up-warning-banner animate-fade">
          <AlertTriangle size={18} />
          <span>⏰ <strong>Muda wa mtihani umekwisha!</strong> Tafadhali wasilisha picha za kurasa za daftari lako ulizofanya sasa hivi.</span>
        </div>
      )}

      {/* Two Column Layout: Left Exam Questions Paper, Right Photo Upload Station */}
      <div className="snap-work-grid">
        {/* Left Column: Teacher's Exam Paper */}
        <div className="exam-sheet-card">
          <div className="sheet-header">
            <div className="sheet-title-row">
              <FileText size={20} className="text-primary" />
              <h3>Karatasi ya Mtihani (Maswali ya Mwl. Richard Lomayan)</h3>
            </div>
            <span className="sheet-guide-pill">Soma hapa kisha fanya kwenye daftari lako nyumbani</span>
          </div>

          <div className="sheet-content-box">
            {/* If teacher uploaded an image of paper */}
            {assignment.examPhoto && (
              <div className="exam-photo-view">
                <img src={assignment.examPhoto} alt="Karatasi ya Mtihani" className="exam-paper-img" />
              </div>
            )}

            {/* Questions Text */}
            {assignment.questionsText ? (
              <pre className="questions-pre-text">{assignment.questionsText}</pre>
            ) : (
              <p className="text-muted">Maswali yameambatanishwa kwenye picha ya mtihani hapo juu.</p>
            )}
          </div>
        </div>

        {/* Right Column: Student's Handwritten Exercise Book Photo Station */}
        <div className="upload-station-card">
          <div className="station-header">
            <div className="station-title-row">
              <Camera size={20} className="text-emerald" />
              <h3>Piga / Pakia Picha za Daftari Lako</h3>
            </div>
            <p className="station-desc">
              Piga picha safi ya kila ukurasa uliofanyia hesabu kwa kalamu kwenye daftari lako.
            </p>
          </div>

          {/* Hidden multi-file input with camera capture */}
          <input 
            type="file" 
            ref={fileInputRef}
            accept="image/*"
            capture="environment"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />

          {/* Camera Trigger Dropzone */}
          <div className="camera-dropzone" onClick={() => fileInputRef.current?.click()}>
            <div className="camera-icon-circle">
              <Camera size={28} />
            </div>
            <div className="camera-cta-content">
              <h4>Bofya Hapa Kupiga Picha ya Daftari</h4>
              <p>Inapunguza ukubwa wa picha kiotomatiki ili isitumie bando na ifike haraka kwa Mwalimu.</p>
              <button type="button" className="btn-camera-trigger">
                <Plus size={16} />
                <span>Piga / Chagua Picha ya Ukurasa</span>
              </button>
            </div>
          </div>

          {/* Uploaded Notebook Pages Preview Grid */}
          {photos.length > 0 && (
            <div className="photos-preview-section animate-fade">
              <div className="photos-preview-header">
                <h4>Kurasa za Daftari Zilizopigwa ({photos.length})</h4>
                <button 
                  type="button" 
                  className="btn-add-more-photos"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Plus size={14} />
                  <span>Ongeza Ukurasa Mwingine</span>
                </button>
              </div>

              <div className="photos-grid">
                {photos.map((imgUrl, index) => (
                  <div key={index} className="photo-thumb-card animate-slide">
                    <img 
                      src={imgUrl} 
                      alt={`Ukurasa ${index + 1}`} 
                      className="thumb-img" 
                      onClick={() => setSelectedPhotoZoom(imgUrl)}
                    />
                    <div className="thumb-footer">
                      <span className="page-label">Ukurasa {index + 1}</span>
                      <button 
                        type="button" 
                        className="btn-del-thumb" 
                        onClick={() => handleRemovePhoto(index)}
                        title="Futa Ukurasa Huu"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="station-actions-footer">
            <button 
              type="button" 
              className="btn-cancel-exam" 
              onClick={handleCancelExam}
              disabled={isSubmitting}
            >
              Ghairi
            </button>

            <button 
              type="button" 
              className="btn-submit-work"
              onClick={handleSubmit}
              disabled={isSubmitting || photos.length === 0}
            >
              {isSubmitting ? (
                <>
                  <Sparkles size={18} className="spin-icon" />
                  <span>Mwalimu Anasoma & Kusahihisha Daftari...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Wasilisha Kazi kwa Mwalimu ({photos.length} Kurasa)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Photo Zoom Modal */}
      {selectedPhotoZoom && (
        <div className="modal-backdrop" onClick={() => setSelectedPhotoZoom(null)}>
          <div className="zoom-modal-card animate-slide">
            <img src={selectedPhotoZoom} alt="Kazi ya Daftari" className="zoomed-photo" />
            <button className="btn-close-zoom" onClick={() => setSelectedPhotoZoom(null)}>
              Funga
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
