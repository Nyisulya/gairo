import React from 'react';
import { 
  GraduationCap, 
  UserCheck, 
  ShieldCheck, 
  Languages, 
  Sparkles,
  BookOpen,
  LogOut,
  Moon,
  Sun
} from 'lucide-react';

export default function Navbar({ 
  currentRole, 
  setCurrentRole, 
  lang, 
  setLang, 
  t, 
  studentProfile, 
  onLogoutTeacher, 
  isTeacherAuthenticated,
  onResetStudent,
  theme,
  setTheme
}) {
  return (
    <header className="navbar-wrapper">
      {/* Top Notification Holiday Ticker */}
      <div className="holiday-ticker">
        <div className="ticker-content">
          <Sparkles size={14} className="ticker-icon" />
          <span>{t.holidayBanner}</span>
        </div>
      </div>

      <div className="navbar-main">
        <div className="navbar-container">
          {/* Row 1: Brand Logo & Quick Utilities */}
          <div className="navbar-header-row">
            <div className="navbar-brand" onClick={() => setCurrentRole('student')}>
              <div className="brand-logo-icon">
                <GraduationCap size={22} />
              </div>
              <div className="brand-text-block">
                <div className="brand-title">
                  {t.appTitle}
                  <span className="brand-badge">Sekondari</span>
                </div>
                <span className="brand-subtitle">{t.appSubtitle}</span>
              </div>
            </div>

            <div className="navbar-quick-tools">
              <button 
                className="action-btn-pill" 
                onClick={() => setLang(lang === 'sw' ? 'en' : 'sw')}
                title="Badili Lugha"
              >
                <Languages size={14} />
                <span className="lang-label">{lang === 'sw' ? 'SW' : 'EN'}</span>
              </button>

              <button 
                className="action-btn-pill theme-btn" 
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                title="Badili Muonekano"
              >
                {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
              </button>

              {currentRole === 'teacher' && isTeacherAuthenticated && (
                <button className="logout-btn-pill" onClick={onLogoutTeacher} title={t.logout}>
                  <LogOut size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Row 2: Portal Switcher (Full Width on Mobile) */}
          <div className="navbar-switcher-row">
            <div className="portal-switcher full-width-switcher">
              <button 
                className={`portal-tab ${currentRole === 'student' ? 'active' : ''}`}
                onClick={() => setCurrentRole('student')}
              >
                <BookOpen size={15} />
                <span>{t.studentPortal}</span>
              </button>
              <button 
                className={`portal-tab ${currentRole === 'teacher' ? 'active' : ''}`}
                onClick={() => setCurrentRole('teacher')}
              >
                <ShieldCheck size={15} />
                <span>{t.teacherPortal}</span>
                {isTeacherAuthenticated && <span className="auth-indicator" />}
              </button>
            </div>
          </div>

          {/* Row 3 (Optional): Student Pill Bar if logged in */}
          {currentRole === 'student' && studentProfile?.name && (
            <div className="navbar-student-bar">
              <div className="student-badge-pill">
                <span className="student-avatar">{studentProfile.name.charAt(0).toUpperCase()}</span>
                <div className="student-pill-details">
                  <span className="student-pill-name">{studentProfile.name}</span>
                  <span className="student-pill-form">{studentProfile.formLevel}</span>
                </div>
              </div>
              <button 
                className="btn-change-student-inline" 
                onClick={onResetStudent}
                title={t.changeProfile}
              >
                Badili Mwanafunzi
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
