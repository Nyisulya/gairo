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
  Plus
} from 'lucide-react';

export default function QuizBuilderModal({ 
  isOpen, 
  onClose, 
  onSaveAssignment, 
  settings 
}) {
  const formLevels = settings?.formLevels || ["Form 1", "Form 2", "Form 3", "Form 4", "Form 5", "Form 6"];
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState('');
  const [formLevel, setFormLevel] = useState('Form 2');
  const [teacherName, setTeacherName] = useState(settings?.teacherName || 'Mwl. Richard Lomayan');
  const [questionsText, setQuestionsText] = useState('');
  const [examPhoto, setExamPhoto] = useState(null);
  const [markingGuide, setMarkingGuide] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [deadline, setDeadline] = useState('');
  const [totalMarks, setTotalMarks] = useState(50);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setExamPhoto(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleQuickTemplate = () => {
    setTitle('Physics Form 2 Holiday Challenge: Electricity & Magnetism');
    setFormLevel('Form 2');
    setQuestionsText(`GAIRO SECONDARY SCHOOL - PHYSICS FORM 2
KAZI YA LIKIZO YA FIZIKIA

1. Betri ya volteji 24 V imeunganishwa na ukinzani wa 8 Ω. Kokotoa mkondo wa umeme (Current - I). [Alama 10]
2. Vipingamizi viwili vya 4 Ω na 6 Ω vimeunganishwa sambamba. Tafuta ukinzani wa jumla (Equivalent Resistance). [Alama 15]
3. Mashine ina VR = 5. Mzigo wa 800 N unanyanyuliwa kwa nguvu ya 200 N. Tafuta MA na Ufanisi (Efficiency %). [Alama 15]
4. Taja sifa tatu za mistari ya nguvu ya sumaku (Magnetic Field Lines). [Alama 10]`);
    setMarkingGuide(`1. I = V / R = 24 / 8 = 3.0 A.
2. 1/Rp = 1/4 + 1/6 = 5/12 => Rp = 2.4 Ω.
3. MA = 800/200 = 4; Efficiency = (4/5) * 100% = 80%.
4. Huanzia North kwenda South; Hazikatani; Nguvu kubwa penye msongamano.`);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim()) {
      setErrorMessage("Tafadhali weka jina la kazi ya mtihani.");
      return;
    }

    if (!questionsText.trim() && !examPhoto) {
      setErrorMessage("Tafadhali piga picha ya karatasi ya mtihani au andika maswali hapa.");
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
              <p>Piga picha ya mtihani au bandika maswali moja kwa moja kwa sekunde chache.</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {/* Quick Template */}
        <div className="quick-templates-bar">
          <span className="template-label">
            <Sparkles size={16} />
            Mwalimu:
          </span>
          <button type="button" className="template-pill-btn" onClick={handleQuickTemplate}>
            ⚡ Pakia Mfano wa Maswali ya Haraka ya Fizikia (Form 2)
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
            <h3 className="section-title">2. Karatasi ya Mtihani (Maswali)</h3>

            {/* Option A: Photo of Exam Paper */}
            <div className="exam-photo-upload-box">
              <label className="form-label">
                📷 Chaguo A: Piga Picha ya Karatasi ya Mtihani (Camera / Gallery Upload)
              </label>
              
              <input 
                type="file" 
                ref={fileInputRef}
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={handlePhotoSelect}
              />

              {examPhoto ? (
                <div className="uploaded-exam-photo-preview">
                  <img src={examPhoto} alt="Mtihani" className="preview-exam-img" />
                  <button 
                    type="button" 
                    className="btn-remove-exam-photo"
                    onClick={() => setExamPhoto(null)}
                  >
                    <Trash2 size={16} />
                    Ondoa Picha Hii
                  </button>
                </div>
              ) : (
                <div className="upload-trigger-card" onClick={() => fileInputRef.current?.click()}>
                  <Camera size={28} className="text-primary" />
                  <span>Bofya hapa kupiga picha ya karatasi ya mtihani</span>
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
                rows="6"
                placeholder="Swali 1: Kokotoa mkondo wa umeme I ikiwa V = 24V na R = 8Ω...&#10;Swali 2: Eleza Kanuni ya Archimedes..."
                value={questionsText}
                onChange={(e) => setQuestionsText(e.target.value)}
              />
            </div>

            {/* Optional: Marking Scheme */}
            <div className="form-group mt-3">
              <label className="form-label">
                💡 Mwongozo wa Majibu / Marking Scheme (Hiari - Mwalimu anaweza kuweka majibu yake):
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
              <span>Chapisha Kazi ya Fizikia kwa Wanafunzi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
