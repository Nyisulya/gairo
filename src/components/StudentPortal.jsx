import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Clock, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  User, 
  Sparkles, 
  Calendar, 
  Layers, 
  GraduationCap, 
  History, 
  TrendingUp, 
  FileText, 
  School, 
  Check, 
  ChevronRight, 
  ShieldCheck, 
  KeyRound, 
  AlertCircle,
  Lock
} from 'lucide-react';

export default function StudentPortal({ 
  assignments, 
  studentProfile, 
  onSaveProfile, 
  onStartAssignment, 
  submissions, 
  onViewPastResult, 
  t, 
  settings 
}) {
  const [nameInput, setNameInput] = useState(studentProfile?.name || '');
  const [selectedForm, setSelectedForm] = useState(studentProfile?.formLevel || 'Form 4');
  const [classCodeInput, setClassCodeInput] = useState('');
  const [regInput, setRegInput] = useState(studentProfile?.studentId || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('assignments'); // assignments | my_history
  const [errorMessage, setErrorMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const formLevels = [
    { id: "Form 1", title: "Kidato cha Kwanza", icon: "🌱", focus: "Measurement, Density & Pressure", defaultCode: "GAIRO-F1" },
    { id: "Form 2", title: "Kidato cha Pili", icon: "⚡", focus: "Current Electricity & Simple Machines", defaultCode: "GAIRO-F2" },
    { id: "Form 3", title: "Kidato cha Tatu", icon: "🔭", focus: "Optics, Waves & Newton's Laws", defaultCode: "GAIRO-F3" },
    { id: "Form 4", title: "Kidato cha Nne", icon: "🎓", focus: "NECTA Masterclass: Electromagnetism & Radioactivity", defaultCode: "GAIRO-F4" }
  ];

  // Auto-detect Magic Link parameters from WhatsApp link (e.g. ?form=Form 4&code=GAIRO-F4)
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const formParam = urlParams.get('form');
      const codeParam = urlParams.get('code');

      if (formParam && formLevels.some(f => f.id.toLowerCase() === formParam.toLowerCase())) {
        const matchedForm = formLevels.find(f => f.id.toLowerCase() === formParam.toLowerCase()).id;
        setSelectedForm(matchedForm);
      }
      if (codeParam) {
        setClassCodeInput(codeParam.trim());
      }
    } catch (err) {
      console.error("URL Params parse error:", err);
    }
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!nameInput.trim()) {
      setErrorMessage("Tafadhali ingiza jina lako kamili.");
      return;
    }

    if (!classCodeInput.trim()) {
      setErrorMessage(`Tafadhali ingiza Nambari ya Siri ya Darasa (Class Code) ya ${selectedForm}.`);
      return;
    }

    setIsVerifying(true);
    try {
      const res = await fetch('/api/auth/verify-class-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formLevel: selectedForm,
          classCode: classCodeInput.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        onSaveProfile({
          name: nameInput.trim(),
          formLevel: selectedForm,
          studentId: regInput.trim() || `STD-${Math.floor(1000 + Math.random() * 9000)}`,
          classCode: classCodeInput.trim()
        });
      } else {
        setErrorMessage(data.error || "Class Code uliyoingiza si sahihi.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setErrorMessage("Hitilafu ya mtandao wakati wa kuhakiki Class Code.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Filter assignments tailored to the student's selected class
  const classAssignments = useMemo(() => {
    const activeLevel = studentProfile?.formLevel || selectedForm;
    return assignments.filter((a) => {
      const matchForm = a.formLevel.toLowerCase() === activeLevel.toLowerCase();
      const matchSearch = !searchTerm.trim() || 
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.subject.toLowerCase().includes(searchTerm.toLowerCase());
      return matchForm && matchSearch;
    });
  }, [assignments, studentProfile, selectedForm, searchTerm]);

  // Student's completed map
  const completedMap = useMemo(() => {
    const map = {};
    if (studentProfile?.name && submissions) {
      submissions
        .filter(s => s.studentName.toLowerCase() === studentProfile.name.toLowerCase())
        .forEach(s => {
          map[s.assignmentId] = s;
        });
    }
    return map;
  }, [submissions, studentProfile]);

  // Student's past submissions history
  const myPastSubmissions = useMemo(() => {
    if (!studentProfile?.name || !submissions) return [];
    return submissions.filter(s => s.studentName.toLowerCase() === studentProfile.name.toLowerCase());
  }, [submissions, studentProfile]);

  // Student's personal statistics
  const studentStats = useMemo(() => {
    if (!myPastSubmissions.length) {
      return { totalDone: 0, avgScore: 0, bestGrade: '-' };
    }
    const totalScore = myPastSubmissions.reduce((sum, s) => sum + s.percentage, 0);
    const avg = Math.round(totalScore / myPastSubmissions.length);
    const grades = myPastSubmissions.map(s => s.grade);
    const best = grades.includes('A') ? 'A' : grades.includes('B') ? 'B' : grades.includes('C') ? 'C' : 'D';
    return {
      totalDone: myPastSubmissions.length,
      avgScore: avg,
      bestGrade: best
    };
  }, [myPastSubmissions]);

  // 1. SMART ACCESS-CONTROLLED ONBOARDING / LOGIN SCREEN (If not signed in)
  if (!studentProfile?.name) {
    const currentClassDetails = formLevels.find(f => f.id === selectedForm) || formLevels[3];

    return (
      <div className="student-portal-container animate-fade">
        <div className="smart-login-card animate-slide">
          {/* Header */}
          <div className="smart-login-header">
            <div className="school-pill-badge">
              <School size={16} />
              <span>{settings?.schoolName || 'Gairo Secondary School'}</span>
            </div>
            <h2>Mlango wa Kazi za Likizo za Fizikia 🎓</h2>
            <p>
              Ingiza jina lako na Nambari ya Siri ya Darasa lako (Class Code) kuanza kufanya mazoezi na kusahihishiwa mara moja na <strong>Mwl. Richard Lomayan</strong>.
            </p>
          </div>

          {errorMessage && (
            <div className="login-error-alert animate-fade">
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="smart-login-form">
            {/* Student Name Input */}
            <div className="form-group">
              <label className="form-label">Jina Lako Kamili (Mwanafunzi) *</label>
              <div className="input-with-icon-wrap">
                <User size={18} className="input-field-icon" />
                <input 
                  type="text"
                  className="form-input custom-login-input"
                  placeholder="Mfano: John Gongwa au Baraka Juma"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Class Cards Selector */}
            <div className="form-group">
              <label className="form-label">Chagua Kidato / Darasa Lako *</label>
              <div className="class-cards-grid">
                {formLevels.map((form) => {
                  const isSelected = selectedForm === form.id;
                  return (
                    <div 
                      key={form.id}
                      className={`class-select-card ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => {
                        setSelectedForm(form.id);
                        setErrorMessage('');
                      }}
                    >
                      <div className="class-card-icon">{form.icon}</div>
                      <div className="class-card-info">
                        <strong>{form.id}</strong>
                        <span className="class-card-focus">{form.focus}</span>
                      </div>
                      {isSelected && (
                        <div className="class-card-check">
                          <Check size={16} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Class Passcode / Access Code Field */}
            <div className="form-group">
              <label className="form-label">Nambari ya Siri ya Darasa (Class Code) ya {selectedForm} *</label>
              <div className="input-with-icon-wrap">
                <KeyRound size={18} className="input-field-icon text-primary" />
                <input 
                  type="text"
                  className="form-input custom-login-input font-bold tracking-wider"
                  placeholder={`Weka Class Code ya ${selectedForm}`}
                  value={classCodeInput}
                  onChange={(e) => setClassCodeInput(e.target.value.toUpperCase())}
                  required
                />
              </div>
              <span className="pin-hint-text">
                🔒 Msimbo huu umetolewa na Mwl. Richard Lomayan kwenye group la WhatsApp la {selectedForm}.
              </span>
            </div>

            {/* Optional Registration Number */}
            <div className="form-group">
              <label className="form-label">Namba ya Usajili / Daftari (Hiari)</label>
              <input 
                type="text"
                className="form-input"
                placeholder="Mfano: S0101/0045"
                value={regInput}
                onChange={(e) => setRegInput(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-login-submit" disabled={isVerifying}>
              {isVerifying ? (
                <>
                  <Sparkles size={18} className="spin-icon" />
                  <span>Inathibitisha Class Code...</span>
                </>
              ) : (
                <>
                  <Lock size={18} />
                  <span>Ingia Kwenye Kazi za {selectedForm}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. PERSONALIZED CLASS DASHBOARD (e.g. Form 4 Portal)
  return (
    <div className="student-portal-container animate-fade">
      {/* Personalized Welcome Banner */}
      <div className="student-welcome-banner">
        <div className="banner-left">
          <div className="banner-badge">
            <School size={15} />
            <span>{settings?.schoolName || 'Gairo Secondary School'} • {studentProfile.formLevel}</span>
          </div>
          <h1 className="banner-headline">
            Hujambo, <span className="highlight-name">{studentProfile.name}</span> 👋
          </h1>
          <p className="banner-subtext">
            Hapa ndipo kituo chako cha mazoezi ya <strong>{studentProfile.formLevel} ya Fizikia</strong>. Fanya maswali kwenye daftari lako nyumbani, piga picha na uipakie ili usahihishiwe na <strong>Mwl. Richard Lomayan</strong> papo hapo.
          </p>
        </div>

        {/* Real-time Student Performance Badges */}
        <div className="banner-stats-pill">
          <div className="banner-stat-item">
            <span className="stat-big-num">{studentStats.totalDone}</span>
            <span className="stat-label">Madaftari Uliyotuma</span>
          </div>
          <div className="banner-stat-divider" />
          <div className="banner-stat-item">
            <span className="stat-big-num text-amber">{studentStats.avgScore}%</span>
            <span className="stat-label">Wastani wa Alama</span>
          </div>
          <div className="banner-stat-divider" />
          <div className="banner-stat-item">
            <span className="stat-big-num text-emerald">{studentStats.bestGrade}</span>
            <span className="stat-label">Daraja la Juu</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Assignments vs History) */}
      <div className="student-tabs-strip">
        <button 
          className={`student-tab-btn ${activeTab === 'assignments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          <BookOpen size={18} />
          <span>Mitihani ya Likizo ({classAssignments.length})</span>
        </button>

        <button 
          className={`student-tab-btn ${activeTab === 'my_history' ? 'active' : ''}`}
          onClick={() => setActiveTab('my_history')}
        >
          <History size={18} />
          <span>Madaftari Yangu Yaliyosahihishwa ({myPastSubmissions.length})</span>
        </button>
      </div>

      {/* TAB 1: ASSIGNMENTS CATALOG */}
      {activeTab === 'assignments' && (
        <div className="assignments-tab-section animate-fade">
          {/* Search Filter */}
          <div className="catalog-filters-bar">
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                className="search-input"
                placeholder={`Tafuta mada au mtihani wa ${studentProfile.formLevel}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="assignments-section">
            <div className="section-title-wrap">
              <h2>Kazi za Likizo za {studentProfile.formLevel} ({classAssignments.length})</h2>
              <span className="current-filter-badge">Mwalimu: Mwl. Richard Lomayan</span>
            </div>

            {classAssignments.length === 0 ? (
              <div className="empty-state-box">
                <BookOpen size={48} className="empty-icon" />
                <h3>Hakuna mtihani uliopatikana kwa sasa.</h3>
                <p>Mwalimu Richard Lomayan ataongeza kazi hivi punde.</p>
              </div>
            ) : (
              <div className="assignment-cards-grid">
                {classAssignments.map((assignment) => {
                  const pastResult = completedMap[assignment.id];
                  const isDone = !!pastResult;

                  return (
                    <div key={assignment.id} className="assignment-card">
                      <div className="assignment-card-header">
                        <span className="card-subject-tag">{assignment.subject || 'Physics'}</span>
                        <span className="card-form-tag">{assignment.formLevel}</span>
                        {assignment.deadline && (
                          <span className="card-deadline-tag">Mwisho: {assignment.deadline}</span>
                        )}
                      </div>

                      <h3 className="card-title">{assignment.title}</h3>
                      <p className="card-desc">{assignment.instructions || "Fanya kazi hii kwenye daftari lako kisha piga picha na kuipakia."}</p>

                      <div className="card-meta-row">
                        <div className="card-meta-item">
                          <Clock size={15} />
                          <span>{assignment.durationMinutes} dakika</span>
                        </div>
                        <div className="card-meta-item">
                          <Award size={15} />
                          <span>Jumla: {assignment.totalMarks || 50} Marks</span>
                        </div>
                        <div className="card-meta-item">
                          <Sparkles size={15} />
                          <span>Pass: {assignment.passMark || 50}%</span>
                        </div>
                      </div>

                      {/* Action Footer */}
                      <div className="assignment-card-footer">
                        {isDone ? (
                          <div className="completed-action-row">
                            <div className="done-status-badge">
                              <CheckCircle2 size={16} />
                              <span>Ulisahihishwa: {pastResult.percentage}% ({pastResult.grade})</span>
                            </div>
                            <div className="action-buttons-pair">
                              <button 
                                className="btn-card-result" 
                                onClick={() => onViewPastResult(pastResult)}
                              >
                                Tazama Ripoti
                              </button>
                              <button 
                                className="btn-card-retake" 
                                onClick={() => onStartAssignment(assignment)}
                                title="Fanya Tena Kazi Hii"
                              >
                                Rudia
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button 
                            className="btn-card-start"
                            onClick={() => onStartAssignment(assignment)}
                          >
                            <span>Fungua Mtihani & Tuma Picha za Daftari</span>
                            <ArrowRight size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MY PAST SUBMISSIONS & RESULTS */}
      {activeTab === 'my_history' && (
        <div className="history-tab-section animate-fade">
          <div className="section-title-wrap mb-4">
            <h2>Madaftari Yako Yaliyosahihishwa na Mwl. Richard ({myPastSubmissions.length})</h2>
            <p className="text-muted">Bofya kazi yoyote kuangalia maoni ya mwalimu na masahihisho ya fomula.</p>
          </div>

          {myPastSubmissions.length === 0 ? (
            <div className="empty-state-box">
              <History size={48} className="empty-icon" />
              <h3>Bado hujawasilisha kazi yoyote ya daftari.</h3>
              <p>Fungua mtihani kwenye tab ya kwanza, fanya kwenye daftari lako, na utume picha zake!</p>
            </div>
          ) : (
            <div className="history-cards-grid">
              {myPastSubmissions.map((sub) => (
                <div key={sub.id} className="history-card" onClick={() => onViewPastResult(sub)}>
                  <div className="history-card-top">
                    <div className="history-meta">
                      <span className="card-form-tag">{sub.formLevel}</span>
                      <span className="history-date">{new Date(sub.submittedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="history-grade-badge" style={{ backgroundColor: sub.gradeColor || '#10b981' }}>
                      {sub.grade} ({sub.percentage}%)
                    </div>
                  </div>

                  <h3 className="history-title">{sub.assignmentTitle}</h3>
                  <p className="history-comment">"{sub.overallTeacherComment}"</p>

                  <div className="history-footer">
                    <span className="history-pages-count">📷 {sub.studentPhotos?.length || 1} kurasa za daftari</span>
                    <span className="history-view-link">
                      Kagua Ripoti Kamili <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
