import React, { useState, useRef } from 'react';
import { 
  X, 
  Camera, 
  Upload, 
  Save, 
  Sparkles, 
  BookOpen, 
  FileText, 
  Trash2, 
  AlertCircle,
  Plus,
  Image as ImageIcon,
  ZoomIn,
  CheckCircle2
} from 'lucide-react';

export default function QuizBuilderModal({ 
  isOpen, 
  onClose, 
  onSaveAssignment, 
  settings 
}) {
  const formLevels = settings?.formLevels || ["Form 1", "Form 2", "Form 3", "Form 4", "Form 5", "Form 6"];
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const [title, setTitle] = useState('');
  const [formLevel, setFormLevel] = useState('Form 2');
  const [teacherName, setTeacherName] = useState(settings?.teacherName || 'Mwl. Richard Lomayan');
  const [questionsText, setQuestionsText] = useState('');
  const [examPhoto, setExamPhoto] = useState(null);
  const [isPhotoZoomed, setIsPhotoZoomed] = useState(false);
  const [markingGuide, setMarkingGuide] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [deadline, setDeadline] = useState('');
  const [totalMarks, setTotalMarks] = useState(50);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);

  if (!isOpen) return null;

  // Fast client-side image optimization
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1400; // Optimal resolution for reading exam paper

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
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          resolve(compressedDataUrl);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const compressed = await compressImage(file);
      setExamPhoto(compressed);
    } catch (err) {
      console.error("Error optimizing photo:", err);
    } finally {
      setIsCompressing(false);
      e.target.value = '';
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim()) {
      setErrorMessage("Tafadhali weka jina la kazi ya mtihani.");
      return;
    }

    if (!questionsText.trim() && !examPhoto) {
      setErrorMessage("Tafadhali piga/pakia picha ya karatasi ya mtihani au andika maswali hapa.");
      return;
    }

    onSaveAssignment({
      title: title.trim(),
      formLevel,
      teacherName: teacherName.trim() || "Mwl. Richard Lomayan",
      questionsText: questionsText.trim(),
      examPhoto,
      markingGuide: markingGuide.trim(),
      durationMinutes: Number(durationMinutes) || 45,
      totalMarks: Number(totalMarks) || 50,
      deadline: deadline || ""
    });
  };

  return (
    <div className="modal-backdrop animate-fade">
      <div className="snap-builder-modal-card animate-slide">
        {/* Header */}
        <div className="builder-modal-header">
          <div className="builder-title-group">
            <Camera size={24} className="text-primary" />
            <div>
              <h2>Pakia Kazi Mpya ya Fizikia (Snap & Publish)</h2>
              <p>Piga picha, chagua kutoka kwenye simu, au andika maswali moja kwa moja.</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {errorMessage && (
          <div className="builder-error-alert">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="snap-builder-form">
          {/* Section 1: Meta */}
          <div className="snap-builder-section">
            <h3 className="section-title">1. Taarifa za Kazi ya Fizikia</h3>

            <div className="form-group">
              <label className="form-label">Kichwa cha Mtihani / Kazi *</label>
              <input 
                type="text"
                className="form-input"
                placeholder="Mfano: Physics Form 2: Current Electricity Holiday Assignment"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">Kidato / Darasa</label>
                <select 
                  className="form-select"
                  value={formLevel}
                  onChange={(e) => setFormLevel(e.target.value)}
                >
                  {formLevels.map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Muda wa Kazi (Dakika)</label>
                <input 
                  type="number"
                  min="15"
                  max="180"
                  className="form-input"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tarehe ya Mwisho (Deadline)</label>
                <input 
                  type="date"
                  className="form-input"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Exam Questions (Photo or Text) */}
          <div className="snap-builder-section">
            <h3 className="section-title">2. Karatasi ya Mtihani (Picha au Maandishi)</h3>

            {/* Hidden File Inputs */}
            <input 
              type="file" 
              ref={cameraInputRef}
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={handlePhotoSelect}
            />
            <input 
              type="file" 
              ref={galleryInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoSelect}
            />

            {/* Option A: Photo of Exam Paper */}
            <div className="exam-photo-upload-box">
              <label className="form-label">
                📷 Chaguo A: Picha ya Karatasi ya Mtihani
              </label>

              {isCompressing && (
                <div className="photo-compressing-badge">
                  <Sparkles size={16} className="animate-spin" />
                  <span>Inaboresha ukubwa wa picha...</span>
                </div>
              )}

              {examPhoto ? (
                <div className="uploaded-exam-photo-preview animate-fade">
                  <div className="photo-preview-wrapper" onClick={() => setIsPhotoZoomed(true)}>
                    <img src={examPhoto} alt="Mtihani wa Fizikia" className="preview-exam-img" />
                    <div className="preview-zoom-overlay">
                      <ZoomIn size={20} />
                      <span>Bofya Kukuza Picha</span>
                    </div>
                  </div>

                  <div className="photo-preview-details">
                    <div className="photo-status-badge">
                      <CheckCircle2 size={16} className="text-emerald-500" />
                      <span>Picha ya mtihani ipo tayari kwa wanafunzi</span>
                    </div>
                    <div className="photo-actions-row">
                      <button 
                        type="button" 
                        className="btn-change-photo"
                        onClick={() => galleryInputRef.current?.click()}
                      >
                        <Upload size={14} />
                        Badili Picha
                      </button>
                      <button 
                        type="button" 
                        className="btn-remove-exam-photo"
                        onClick={() => setExamPhoto(null)}
                      >
                        <Trash2 size={14} />
                        Ondoa Picha
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="exam-upload-actions-grid">
                  {/* Button 1: Camera */}
                  <div 
                    className="exam-upload-btn camera-btn" 
                    onClick={() => cameraInputRef.current?.click()}
                  >
                    <div className="upload-icon-circle">
                      <Camera size={26} />
                    </div>
                    <div className="upload-btn-text">
                      <strong>Piga Picha kwa Kamera</strong>
                      <small>Piga picha ya karatasi ya mtihani moja kwa moja</small>
                    </div>
                  </div>

                  {/* Button 2: Gallery / Files */}
                  <div 
                    className="exam-upload-btn gallery-btn" 
                    onClick={() => galleryInputRef.current?.click()}
                  >
                    <div className="upload-icon-circle">
                      <ImageIcon size={26} />
                    </div>
                    <div className="upload-btn-text">
                      <strong>Pakia Kutoka Kwenye Simu / Gallery</strong>
                      <small>Chagua picha iliyopo tayari kwenye faili/simu</small>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Option B: Text Questions */}
            <div className="form-group mt-4">
              <label className="form-label">
                ✍️ Chaguo B: Au Andika / Bandika Maswali ya Mtihani Hapa Chini:
              </label>
              <textarea 
                className="form-textarea"
                rows="5"
                placeholder="Swali 1: Kokotoa mkondo wa umeme I ikiwa V = 24V na R = 8Ω...&#10;Swali 2: Eleza Kanuni ya Archimedes..."
                value={questionsText}
                onChange={(e) => setQuestionsText(e.target.value)}
              />
            </div>

            {/* Optional: Marking Scheme */}
            <div className="form-group mt-3">
              <label className="form-label">
                💡 Mwongozo wa Majibu / Marking Scheme (Hiari - Mwongozo wa Mwalimu):
              </label>
              <textarea 
                className="form-textarea"
                rows="3"
                placeholder="1. I = 3 A.&#10;2. Rp = 2.4 Ω.&#10;3. MA = 4.0..."
                value={markingGuide}
                onChange={(e) => setMarkingGuide(e.target.value)}
              />
            </div>
          </div>

          {/* Footer Save */}
          <div className="builder-modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Ghairi
            </button>
            <button type="submit" className="btn-save-publish">
              <Save size={18} />
              <span>Hifadhi na Chapisha Kazi kwa Wanafunzi</span>
            </button>
          </div>
        </form>
      </div>

      {/* Full Photo Zoom Modal */}
      {isPhotoZoomed && examPhoto && (
        <div className="photo-zoom-modal-backdrop" onClick={() => setIsPhotoZoomed(false)}>
          <div className="photo-zoom-content" onClick={(e) => e.stopPropagation()}>
            <button 
              type="button" 
              className="btn-close-zoom" 
              onClick={() => setIsPhotoZoomed(false)}
            >
              <X size={24} />
            </button>
            <img src={examPhoto} alt="Karatasi ya Mtihani Imekuzwa" className="zoomed-exam-img" />
          </div>
        </div>
      )}
    </div>
  );
}
