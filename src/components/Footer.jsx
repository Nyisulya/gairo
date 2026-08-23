import React from 'react';
import { GraduationCap, Heart, BookOpen, Sparkles, ShieldCheck } from 'lucide-react';

export default function Footer({ schoolName, t }) {
  return (
    <footer className="app-footer no-print">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <GraduationCap size={24} />
              <span>{t.appTitle}</span>
            </div>
            <p className="footer-tagline">
              Mfumo Mahiri wa Kazi za Likizo & Mitihani ya Sekondari wenye Masahihisho na Alama za Papo Hapo.
            </p>
          </div>

          <div className="footer-features">
            <div className="feature-pill">
              <Sparkles size={16} />
              <span>Masahihisho ya Papo Hapo</span>
            </div>
            <div className="feature-pill">
              <BookOpen size={16} />
              <span>Kidato cha 1 hadi 6</span>
            </div>
            <div className="feature-pill">
              <ShieldCheck size={16} />
              <span>Dashibodi ya Mwalimu</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} {schoolName || 'Shule ya Sekondari'}. Haki zote zimehifadhiwa.</p>
          <p className="footer-motto">
            "Elimu ni Ufunguo wa Maisha - Jifunze Wakati Wowote, Popote Ulipo."
          </p>
        </div>
      </div>
    </footer>
  );
}
