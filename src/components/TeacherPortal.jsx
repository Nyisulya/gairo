import React, { useState } from 'react';
import { 
  BarChart3, 
  BookOpen, 
  Users, 
  Award, 
  Plus, 
  Trash2, 
  Share2, 
  Download, 
  Search, 
  Lock, 
  KeyRound, 
  CheckCircle2, 
  Settings, 
  Sparkles, 
  School, 
  TrendingUp, 
  Eye, 
  Camera, 
  Key,
  ShieldCheck,
  Copy
} from 'lucide-react';

export default function TeacherPortal({ 
  assignments, 
  submissions, 
  analytics, 
  isAuthenticated, 
  onLogin, 
  onCreateAssignmentClick, 
  onDeleteAssignment, 
  onViewStudentSubmission,
  settings,
  onUpdateSettings,
  t 
}) {
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('analytics');
  
  const [gradebookSearch, setGradebookSearch] = useState('');
  const [selectedFormFilter, setSelectedFormFilter] = useState('all');
  const [selectedAssignmentFilter, setSelectedAssignmentFilter] = useState('all');

  const [copySuccessMsg, setCopySuccessMsg] = useState('');

  // Settings form state
  const [schoolNameInput, setSchoolNameInput] = useState(settings?.schoolName || 'Gairo Secondary School');
  const [teacherNameInput, setTeacherNameInput] = useState(settings?.teacherName || 'Mwl. Richard Lomayan');
  const [apiKeyInput, setApiKeyInput] = useState(settings?.deepseekApiKey || '');
  const [classCodesState, setClassCodesState] = useState(settings?.classCodes || {
    "Form 1": "GAIRO-F1",
    "Form 2": "GAIRO-F2",
    "Form 3": "GAIRO-F3",
    "Form 4": "GAIRO-F4"
  });
  const [newPinInput, setNewPinInput] = useState('');
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [settingsMsg, setSettingsMsg] = useState('');

  const formLevels = ["Form 1", "Form 2", "Form 3", "Form 4"];

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    const res = await onLogin(pinInput.trim());
    if (!res.success) {
      setLoginError(res.error || "PIN siyo sahihi.");
    }
  };

  const handleShareWhatsAppInvite = (assignment) => {
    const origin = window.location.origin;
    const formCode = (settings?.classCodes && settings.classCodes[assignment.formLevel]) || `GAIRO-${assignment.formLevel.replace(/\s+/g, '')}`.toUpperCase();
    const magicLink = `${origin}/?form=${encodeURIComponent(assignment.formLevel)}&code=${encodeURIComponent(formCode)}`;

    const text = `🔬 *KAZI YA LIKIZO: FIZIKIA (${assignment.formLevel.toUpperCase()})*\n\n` +
      `🏫 *${settings?.schoolName || 'GAIRO SECONDARY SCHOOL'}*\n` +
      `👨‍🏫 *Mwalimu wa Somo:* ${settings?.teacherName || 'Mwl. Richard Lomayan'}\n` +
      `📝 *Kazi:* ${assignment.title}\n\n` +
      `🔑 *Class Code ya ${assignment.formLevel}:* *${formCode}*\n\n` +
      `📌 *Maelekezo:* Fanya maswali kwenye daftari lako nyumbani kwa kalamu, kisha piga picha na uipakie kupitia link hii ya moja kwa moja:\n` +
      `👉 ${magicLink}\n\n` +
      `_Mfumo utakusahihishia na kukupa maksi na masahihisho yako hapo hapo!_`;

    navigator.clipboard.writeText(text).then(() => {
      setCopySuccessMsg(`Ujumbe wa WhatsApp na Magic Link ya ${assignment.formLevel} (Code: ${formCode}) umenakiliwa!`);
      setTimeout(() => setCopySuccessMsg(''), 6000);
    }).catch(() => {
      alert(text);
    });
  };

  const handleExportCSV = () => {
    if (!submissions || submissions.length === 0) {
      alert("Hakuna matokeo ya kupakua kwa sasa.");
      return;
    }

    const headers = ["Jina la Mwanafunzi", "Darasa", "Namba ya Usajili", "Somo", "Kazi", "Alama (%)", "Daraja", "Muda (Sekunde)", "Tarehe"];
    const rows = submissions.map(s => [
      `"${s.studentName}"`,
      `"${s.formLevel}"`,
      `"${s.studentId || ''}"`,
      `"${s.subject || 'Physics'}"`,
      `"${s.assignmentTitle.replace(/"/g, '""')}"`,
      s.percentage,
      `"${s.grade}"`,
      s.timeTakenSeconds,
      `"${new Date(s.submittedAt).toLocaleString()}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Matokeo_Fizikia_GairoSec_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSettingsSave = async (e) => {
    e.preventDefault();
    setSettingsMsg('');
    const res = await onUpdateSettings({
      pin: currentPinInput,
      schoolName: schoolNameInput,
      teacherName: teacherNameInput,
      deepseekApiKey: apiKeyInput,
      classCodes: classCodesState,
      newPin: newPinInput || undefined
    });
    if (res.success) {
      setSettingsMsg("Mipangilio na Class Codes zimehifadhiwa kikamilifu!");
      setCurrentPinInput('');
      setNewPinInput('');
    } else {
      setSettingsMsg(res.error || "Kosa limetokea wakati wa kuhifadhi.");
    }
  };

  const filteredSubmissions = (submissions || []).filter((s) => {
    const matchSearch = s.studentName.toLowerCase().includes(gradebookSearch.toLowerCase()) ||
                        s.assignmentTitle.toLowerCase().includes(gradebookSearch.toLowerCase());
    const matchForm = selectedFormFilter === 'all' || s.formLevel.toLowerCase() === selectedFormFilter.toLowerCase();
    const matchAssignment = selectedAssignmentFilter === 'all' || s.assignmentId === selectedAssignmentFilter;
    return matchSearch && matchForm && matchAssignment;
  });

  if (!isAuthenticated) {
    return (
      <div className="teacher-auth-container animate-fade">
        <div className="teacher-login-card animate-slide">
          <div className="login-icon-box">
            <Lock size={32} />
          </div>
          <h2>Kuingia kwa Mwalimu (Mwl. Richard Lomayan)</h2>
          <p>Ingiza namba ya siri (PIN) ya mwalimu ili kuingia kwenye dashibodi ya Fizikia ya Gairo Secondary School.</p>

          <form onSubmit={handleLoginSubmit} className="teacher-login-form">
            <div className="form-group">
              <label className="form-label">PIN ya Mwalimu *</label>
              <div className="pin-input-wrap">
                <KeyRound size={18} className="pin-icon" />
                <input 
                  type="password"
                  maxLength={8}
                  className="form-input pin-field"
                  placeholder="Weka PIN yako ya siri"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            {loginError && (
              <div className="login-error-alert animate-fade">
                <span>{loginError}</span>
              </div>
            )}

            <button type="submit" className="btn-login-hero">
              <Lock size={18} />
              <span>Ingia Dashibodi ya Mwalimu</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-portal-container animate-fade">
      {/* Teacher Header Banner */}
      <div className="teacher-header-banner">
        <div className="banner-left">
          <div className="teacher-badge-pill">
            <School size={16} />
            <span>{settings?.schoolName || 'Gairo Secondary School'} - Idara ya Fizikia</span>
          </div>
          <h1>Dashibodi ya Mwl. Richard Lomayan 👨‍🏫</h1>
          <p>Dhibiti Class Codes za madarasa, pakia mitihani, fuatilia madaftari ya wanafunzi, na angalia ripoti za ufaulu.</p>
        </div>

        <div className="banner-cta">
          <button className="btn-create-quiz-cta" onClick={onCreateAssignmentClick}>
            <Plus size={20} />
            <span>+ Pakia Kazi Mpya (Snap/Upload)</span>
          </button>
        </div>
      </div>

      {copySuccessMsg && (
        <div className="toast-success-banner animate-fade">
          <CheckCircle2 size={18} />
          <span>{copySuccessMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="teacher-tabs-nav">
        <button 
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart3 size={18} />
          <span>Takwimu & Ufaulu</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'assignments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          <BookOpen size={18} />
          <span>Kazi Zilizopakiwa ({assignments.length})</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'gradebook' ? 'active' : ''}`}
          onClick={() => setActiveTab('gradebook')}
        >
          <Users size={18} />
          <span>Madaftari ya Wanafunzi ({(submissions || []).length})</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={18} />
          <span>Class Codes & Mipangilio</span>
        </button>
      </div>

      {/* TAB 1: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="analytics-tab-content animate-fade">
          <div className="analytics-stats-grid">
            <div className="stat-card">
              <div className="stat-card-icon icon-blue">
                <BookOpen size={24} />
              </div>
              <div className="stat-card-data">
                <span className="stat-card-num">{assignments.length}</span>
                <span className="stat-card-label">Mitihani ya Likizo</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon icon-emerald">
                <Camera size={24} />
              </div>
              <div className="stat-card-data">
                <span className="stat-card-num">{(submissions || []).length}</span>
                <span className="stat-card-label">Madaftari Yaliyosahihishwa</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon icon-amber">
                <TrendingUp size={24} />
              </div>
              <div className="stat-card-data">
                <span className="stat-card-num">{analytics?.averageScore || 0}%</span>
                <span className="stat-card-label">Wastani wa Alama (Fizikia)</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon icon-purple">
                <Award size={24} />
              </div>
              <div className="stat-card-data">
                <span className="stat-card-num">{analytics?.passRate || 0}%</span>
                <span className="stat-card-label">Ufaulu wa Jumla</span>
              </div>
            </div>
          </div>

          {/* Grade Distribution */}
          <div className="analytics-panel">
            <div className="panel-header">
              <h3>Mgao wa Madaraja ya Fizikia (Grade Distribution)</h3>
            </div>
            <div className="grade-bars-container">
              {['A', 'B', 'C', 'D', 'F'].map((g) => {
                const count = analytics?.gradeCounts?.[g] || 0;
                const total = analytics?.totalSubmissions || 1;
                const percent = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={g} className="grade-bar-row">
                    <span className="grade-bar-letter">Grade {g}</span>
                    <div className="grade-bar-track">
                      <div className={`grade-bar-fill fill-${g.toLowerCase()}`} style={{ width: `${percent}%` }}></div>
                    </div>
                    <span className="grade-bar-count">{count} ({percent}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ASSIGNMENTS & WHATSAPP MAGIC LINKS */}
      {activeTab === 'assignments' && (
        <div className="assignments-tab-content animate-fade">
          <div className="tab-actions-header">
            <div>
              <h2>Mitihani & Kazi za Likizo za Fizikia ({assignments.length})</h2>
              <p>Bonyeza kitufe cha WhatsApp kutuma Magic Link yenye Class Code moja kwa moja kwa wanafunzi.</p>
            </div>
            <button className="btn-primary" onClick={onCreateAssignmentClick}>
              <Plus size={18} />
              <span>+ Pakia Mtihani Mpya</span>
            </button>
          </div>

          <div className="assignments-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Darasa</th>
                  <th>Kichwa cha Mtihani</th>
                  <th>Class Code</th>
                  <th>Madaftari</th>
                  <th>Hatua & WhatsApp</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => {
                  const subCount = (submissions || []).filter(s => s.assignmentId === a.id).length;
                  const formCode = (settings?.classCodes && settings.classCodes[a.formLevel]) || `GAIRO-${a.formLevel.replace(/\s+/g, '')}`.toUpperCase();

                  return (
                    <tr key={a.id}>
                      <td><span className="table-form-badge">{a.formLevel}</span></td>
                      <td>
                        <strong>{a.title}</strong>
                        {a.deadline && <span className="cell-sub-date">Deadline: {a.deadline}</span>}
                      </td>
                      <td>
                        <span className="font-mono font-bold text-primary bg-primary-50 px-2 py-1 rounded">
                          {formCode}
                        </span>
                      </td>
                      <td>
                        <span className="submission-count-badge">
                          {subCount} wanafunzi
                        </span>
                      </td>
                      <td>
                        <div className="action-btns-row">
                          <button 
                            className="btn-icon-table btn-whatsapp"
                            onClick={() => handleShareWhatsAppInvite(a)}
                            title="Tuma Magic Link WhatsApp"
                          >
                            <Share2 size={16} />
                          </button>
                          <button 
                            className="btn-icon-table btn-delete"
                            onClick={() => {
                              if (confirm(`Je, una uhakika unataka kufuta kazi hii: "${a.title}"?`)) {
                                onDeleteAssignment(a.id);
                              }
                            }}
                            title="Futa"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: GRADEBOOK & SUBMISSIONS */}
      {activeTab === 'gradebook' && (
        <div className="gradebook-tab-content animate-fade">
          <div className="tab-actions-header">
            <div>
              <h2>Madaftari ya Wanafunzi ({(submissions || []).length})</h2>
              <p>Tazama picha za daftari za kila mwanafunzi na alama alizopata.</p>
            </div>
            <button className="btn-secondary btn-export" onClick={handleExportCSV}>
              <Download size={18} />
              <span>Pakua Excel (CSV)</span>
            </button>
          </div>

          <div className="gradebook-filters-row">
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                className="search-input"
                placeholder="Tafuta jina la mwanafunzi..."
                value={gradebookSearch}
                onChange={(e) => setGradebookSearch(e.target.value)}
              />
            </div>

            <select 
              className="select-filter-box"
              value={selectedFormFilter}
              onChange={(e) => setSelectedFormFilter(e.target.value)}
            >
              <option value="all">Madarasa Yote</option>
              {formLevels.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div className="gradebook-table-container">
            {filteredSubmissions.length === 0 ? (
              <div className="empty-state-box">
                <Users size={40} className="empty-icon" />
                <h3>Hakuna madaftari yaliyopokelewa kwa sasa.</h3>
                <p>Wanafunzi wakituma picha za madaftari yao zitatokea hapa.</p>
              </div>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Mwanafunzi</th>
                    <th>Kidato</th>
                    <th>Mtihani</th>
                    <th>Alama</th>
                    <th>Daraja</th>
                    <th>Kurasa za Daftari</th>
                    <th>Tarehe</th>
                    <th>Hatua</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((sub) => (
                    <tr key={sub.id}>
                      <td>
                        <strong>{sub.studentName}</strong>
                      </td>
                      <td><span className="table-form-badge">{sub.formLevel}</span></td>
                      <td>{sub.assignmentTitle}</td>
                      <td>
                        <span className={`score-badge ${sub.passed ? 'score-passed' : 'score-failed'}`}>
                          {sub.percentage}% ({sub.totalScore}/{sub.maxScore})
                        </span>
                      </td>
                      <td>
                        <span className="grade-pill-table" style={{ backgroundColor: sub.gradeColor || '#10b981' }}>
                          {sub.grade}
                        </span>
                      </td>
                      <td>
                        <span className="font-semibold text-primary">
                          📷 {sub.studentPhotos?.length || 1} kurasa
                        </span>
                      </td>
                      <td className="text-muted">
                        {new Date(sub.submittedAt).toLocaleDateString()} {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td>
                        <button 
                          className="btn-view-paper"
                          onClick={() => onViewStudentSubmission(sub)}
                        >
                          <Eye size={15} />
                          <span>Kagua Daftari</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: CLASS CODES & SETTINGS */}
      {activeTab === 'settings' && (
        <div className="settings-tab-content animate-fade">
          <div className="settings-card">
            <h2>Nambari za Siri za Madarasa (Class Codes) & Mipangilio</h2>
            <p>Dhibiti msimbo wa kila darasa unaowazuia watu baki wasiohusika kujiunga.</p>

            {settingsMsg && (
              <div className="settings-alert-banner">
                <Sparkles size={16} />
                <span>{settingsMsg}</span>
              </div>
            )}

            <form onSubmit={handleSettingsSave} className="settings-form">
              {/* Class Codes Editor */}
              <div className="class-codes-management-box">
                <h4 className="font-bold text-slate-800 mb-2">🔑 Class Codes za Gairo Secondary School:</h4>
                <div className="form-grid-2">
                  {formLevels.map((lvl) => (
                    <div key={lvl} className="form-group">
                      <label className="form-label">{lvl} Class Code:</label>
                      <input 
                        type="text" 
                        className="form-input font-mono font-bold tracking-wider"
                        value={classCodesState[lvl] || ''}
                        onChange={(e) => setClassCodesState({ ...classCodesState, [lvl]: e.target.value.toUpperCase() })}
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group mt-4">
                <label className="form-label">Jina la Shule</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={schoolNameInput}
                  onChange={(e) => setSchoolNameInput(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Jina la Mwalimu wa Fizikia</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={teacherNameInput}
                  onChange={(e) => setTeacherNameInput(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  DeepSeek API Key (AI Vision Engine)
                </label>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="sk-534222..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Namba ya Siri ya Sasa (Teacher PIN) *</label>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="Weka PIN yako ya sasa"
                  value={currentPinInput}
                  onChange={(e) => setCurrentPinInput(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">PIN Mpya ya Mwalimu (Hiari)</label>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="Weka PIN mpya"
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary">
                Hifadhi Mipangilio & Class Codes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
