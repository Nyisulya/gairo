import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import StudentPortal from './components/StudentPortal';
import ExamHall from './components/ExamHall';
import ResultView from './components/ResultView';
import TeacherPortal from './components/TeacherPortal';
import QuizBuilderModal from './components/QuizBuilderModal';
import StudentDetailModal from './components/StudentDetailModal';
import Footer from './components/Footer';
import { translations } from './utils/i18n';
import './App.css';

export default function App() {
  const [lang, setLang] = useState('sw');
  const [theme, setTheme] = useState('light');
  const [currentRole, setCurrentRole] = useState('student'); // 'student' | 'teacher'
  
  // Data states
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Student State
  const [studentProfile, setStudentProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('shule_student_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Active Flow states
  const [activeQuiz, setActiveQuiz] = useState(null); // Full assignment object when student is taking test
  const [currentResult, setCurrentResult] = useState(null); // Result object to display after submission
  
  // Teacher states
  const [isTeacherAuthenticated, setIsTeacherAuthenticated] = useState(() => {
    return sessionStorage.getItem('shule_teacher_auth') === 'true';
  });
  const [isQuizBuilderOpen, setIsQuizBuilderOpen] = useState(false);
  const [inspectingSubmission, setInspectingSubmission] = useState(null);

  const t = translations[lang] || translations.sw;

  // Apply theme to body
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resAssign, resSubs, resAnalytics, resSettings] = await Promise.all([
        fetch('/api/assignments').then(r => r.json()),
        fetch('/api/submissions').then(r => r.json()),
        fetch('/api/analytics').then(r => r.json()),
        fetch('/api/settings').then(r => r.json())
      ]);

      if (Array.isArray(resAssign)) setAssignments(resAssign);
      if (Array.isArray(resSubs)) setSubmissions(resSubs);
      if (resAnalytics && !resAnalytics.error) setAnalytics(resAnalytics);
      if (resSettings && !resSettings.error) setSettings(resSettings);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Student Actions
  const handleSaveProfile = (profile) => {
    setStudentProfile(profile);
    try {
      localStorage.setItem('shule_student_profile', JSON.stringify(profile));
    } catch (e) {
      console.error("localStorage error:", e);
    }
  };

  const handleResetStudent = () => {
    if (confirm("Je, unataka kubadili taarifa za mwanafunzi?")) {
      setStudentProfile(null);
      localStorage.removeItem('shule_student_profile');
      setActiveQuiz(null);
      setCurrentResult(null);
    }
  };

  const handleStartAssignment = async (assignmentSummary) => {
    try {
      // Fetch full questions for this assignment from API
      const res = await fetch(`/api/assignments/${assignmentSummary.id}`);
      const fullAssignment = await res.json();
      if (fullAssignment && !fullAssignment.error) {
        setActiveQuiz(fullAssignment);
        setCurrentResult(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert("Kazi haijapatikana.");
      }
    } catch (err) {
      console.error("Error loading quiz:", err);
      alert("Kuna hitilafu wakati wa kupakia maswali. Tafadhali jaribu tena.");
    }
  };

  const handleSubmitHandwritten = async (submissionPayload) => {
    try {
      const res = await fetch(`/api/assignments/${submissionPayload.assignmentId}/submit-handwritten`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionPayload)
      });
      const data = await res.json();
      if (data.success && data.submission) {
        setActiveQuiz(null);
        setCurrentResult(data.submission);
        fetchData(); // refresh submissions & analytics in background
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert(data.error || "Kosa limetokea wakati wa kuwasilisha.");
      }
    } catch (err) {
      console.error("Error submitting quiz:", err);
      alert("Hitilafu ya mtandao wakati wa kuwasilisha picha za daftari.");
    }
  };

  const handleViewPastResult = (submission) => {
    setCurrentResult(submission);
    setActiveQuiz(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setActiveQuiz(null);
    setCurrentResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Teacher Actions
  const handleTeacherLogin = async (pin) => {
    try {
      const res = await fetch('/api/teacher/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });
      const data = await res.json();
      if (data.success) {
        setIsTeacherAuthenticated(true);
        sessionStorage.setItem('shule_teacher_auth', 'true');
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch {
      return { success: false, error: "Hitilafu ya mawasiliano na seva." };
    }
  };

  const handleTeacherLogout = () => {
    setIsTeacherAuthenticated(false);
    sessionStorage.removeItem('shule_teacher_auth');
  };

  const handleSaveNewAssignment = async (assignmentData) => {
    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...assignmentData,
          schoolName: settings?.schoolName || "Shule ya Sekondari"
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsQuizBuilderOpen(false);
        fetchData();
        alert("✅ Kazi mpya ya likizo imechapishwa kikamilifu!");
      } else {
        alert(data.error || "Imeshindikana kuhifadhi kazi.");
      }
    } catch (err) {
      console.error("Error creating assignment:", err);
      alert("Kuna hitilafu ya mtandao.");
    }
  };

  const handleDeleteAssignment = async (id) => {
    try {
      const res = await fetch(`/api/assignments/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.error || "Imeshindikana kufuta.");
      }
    } catch (err) {
      console.error("Error deleting assignment:", err);
    }
  };

  const handleUpdateSettings = async (payload) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch {
      return { success: false, error: "Hitilafu wakati wa kuhifadhi mipangilio." };
    }
  };

  return (
    <div className="app-layout">
      {/* Top Main Navigation */}
      <Navbar 
        currentRole={currentRole}
        setCurrentRole={(role) => {
          setCurrentRole(role);
          setActiveQuiz(null);
          setCurrentResult(null);
        }}
        lang={lang}
        setLang={setLang}
        t={t}
        studentProfile={studentProfile}
        onLogoutTeacher={handleTeacherLogout}
        isTeacherAuthenticated={isTeacherAuthenticated}
        onResetStudent={handleResetStudent}
        theme={theme}
        setTheme={setTheme}
      />

      {/* Main Dynamic View Content */}
      <main className="main-content">
        {currentRole === 'student' ? (
          /* Student Portal Views */
          activeQuiz ? (
            /* Taking an interactive test / assignment */
            <ExamHall 
              assignment={activeQuiz}
              studentProfile={studentProfile}
              onSubmitHandwritten={handleSubmitHandwritten}
              onCancel={handleBackToHome}
            />
          ) : currentResult ? (
            /* Instant Auto-Graded Result View */
            <ResultView 
              result={currentResult}
              onBackToHome={handleBackToHome}
              t={t}
            />
          ) : (
            /* Student Assignment Catalog & History */
            <StudentPortal 
              assignments={assignments}
              studentProfile={studentProfile}
              onSaveProfile={handleSaveProfile}
              onStartAssignment={handleStartAssignment}
              submissions={submissions}
              onViewPastResult={handleViewPastResult}
              t={t}
              settings={settings}
            />
          )
        ) : (
          /* Teacher Portal View */
          <TeacherPortal 
            assignments={assignments}
            submissions={submissions}
            analytics={analytics}
            isAuthenticated={isTeacherAuthenticated}
            onLogin={handleTeacherLogin}
            onCreateAssignmentClick={() => setIsQuizBuilderOpen(true)}
            onDeleteAssignment={handleDeleteAssignment}
            onViewStudentSubmission={(sub) => setInspectingSubmission(sub)}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            t={t}
          />
        )}
      </main>

      {/* Teacher Question Builder Modal */}
      {isQuizBuilderOpen && (
        <QuizBuilderModal 
          isOpen={isQuizBuilderOpen}
          onClose={() => setIsQuizBuilderOpen(false)}
          onSaveAssignment={handleSaveNewAssignment}
          settings={settings}
          t={t}
        />
      )}

      {/* Teacher Inspect Student Paper Modal */}
      {inspectingSubmission && (
        <StudentDetailModal 
          submission={inspectingSubmission}
          onClose={() => setInspectingSubmission(null)}
        />
      )}

      {/* Footer */}
      <Footer schoolName={settings?.schoolName} t={t} />
    </div>
  );
}
