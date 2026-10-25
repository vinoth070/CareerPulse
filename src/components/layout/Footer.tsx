import React, { useState } from 'react';
import { BRAND_CONFIG } from '../../config/brand';
import { Briefcase, Shield, Lock, HelpCircle, Mail, CheckCircle2, X } from 'lucide-react';

export const Footer: React.FC = () => {
  const [modalTopic, setModalTopic] = useState<'privacy' | 'terms' | 'about' | 'help' | null>(null);

  return (
    <>
      <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
            {/* Col 1: Brand & Mission */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">
                  {BRAND_CONFIG.name}
                </span>
              </div>
              <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                {BRAND_CONFIG.shortDescription}
              </p>
              <div className="pt-2 text-xs text-slate-500">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Shield className="w-4 h-4" />
                  <span>Zero-Trust Candidate Privacy & Direct Employer Verification</span>
                </div>
              </div>
            </div>

            {/* Col 2: For Students */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
                For Students
              </h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li>
                  <a href="#how-it-works" className="hover:text-white transition-colors">
                    Weekly Assessments
                  </a>
                </li>
                <li>
                  <a href="#for-students" className="hover:text-white transition-colors">
                    Skills Profile Builder
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-white transition-colors">
                    Verified Badges
                  </a>
                </li>
                <li>
                  <a href="#for-students" className="hover:text-white transition-colors">
                    Company Opportunities
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: For Enterprises */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
                For Enterprises
              </h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li>
                  <a href="#for-companies" className="hover:text-white transition-colors">
                    Talent Discovery
                  </a>
                </li>
                <li>
                  <a href="#for-companies" className="hover:text-white transition-colors">
                    Verified Assessment Filters
                  </a>
                </li>
                <li>
                  <a href="#for-companies" className="hover:text-white transition-colors">
                    Direct Applications
                  </a>
                </li>
                <li>
                  <a href="#for-companies" className="hover:text-white transition-colors">
                    Employer Verification
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 4: Legal & Support */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
                Transparency & Legal
              </h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li>
                  <button
                    onClick={() => setModalTopic('privacy')}
                    className="hover:text-white transition-colors text-left"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setModalTopic('terms')}
                    className="hover:text-white transition-colors text-left"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setModalTopic('about')}
                    className="hover:text-white transition-colors text-left"
                  >
                    About Us
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setModalTopic('help')}
                    className="hover:text-white transition-colors text-left"
                  >
                    Help & Contact
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <p>
              &copy; {new Date().getFullYear()} {BRAND_CONFIG.name}. Built with enterprise Firebase & React.
            </p>
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" /> End-to-end Session Encryption
              </span>
              <span>All rights reserved</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Info Modals */}
      {modalTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-200">
            <button
              onClick={() => setModalTopic(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {modalTopic === 'privacy' && (
              <div>
                <div className="flex items-center gap-2.5 text-blue-700 mb-3">
                  <Shield className="w-6 h-6" />
                  <h3 className="text-lg font-bold text-slate-900">Privacy & Consent Policy</h3>
                </div>
                <div className="text-sm text-slate-600 space-y-3 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
                  <p>
                    <strong>Your Data, Your Control:</strong> At {BRAND_CONFIG.name}, we believe talent profiles should be fully governed by the job seeker. Your profile is not publicly discoverable by recruiters unless you explicitly enable <em>Public Recruiter Discovery</em> in your settings.
                  </p>
                  <p>
                    <strong>No Password or Auth Exposure:</strong> We never log or store raw passwords. Authentication credentials are managed exclusively by Firebase Authentication.
                  </p>
                  <p>
                    <strong>Assessment Integrity:</strong> Weekly quiz submissions record only your answer choices and calculated performance metrics. Assessment metrics are never shared with third parties without your profile discovery consent.
                  </p>
                </div>
              </div>
            )}

            {modalTopic === 'terms' && (
              <div>
                <div className="flex items-center gap-2.5 text-blue-700 mb-3">
                  <Lock className="w-6 h-6" />
                  <h3 className="text-lg font-bold text-slate-900">Terms of Service</h3>
                </div>
                <div className="text-sm text-slate-600 space-y-3 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
                  <p>
                    <strong>Truth in Advertising:</strong> Company recruiters must provide verified work email credentials. Job listings must represent authentic employment or internship opportunities.
                  </p>
                  <p>
                    <strong>Academic Integrity:</strong> Students agree to complete weekly skill assessments independently. Quizzes represent self-development metrics and not formal university degrees.
                  </p>
                  <p>
                    <strong>Fair Hiring Standards:</strong> Recruiters may not discriminate against candidates on the basis of protected characteristics.
                  </p>
                </div>
              </div>
            )}

            {modalTopic === 'about' && (
              <div>
                <div className="flex items-center gap-2.5 text-blue-700 mb-3">
                  <Briefcase className="w-6 h-6" />
                  <h3 className="text-lg font-bold text-slate-900">About {BRAND_CONFIG.name}</h3>
                </div>
                <div className="text-sm text-slate-600 space-y-3 leading-relaxed">
                  <p>
                    {BRAND_CONFIG.name} is an open, skills-first career development network designed to close the gap between academic preparation and enterprise hiring.
                  </p>
                  <p>
                    Rather than relying on static resumes or generic keyword filtering, we emphasize regular skill assessments and verified project portfolios to highlight genuine problem-solving ability.
                  </p>
                </div>
              </div>
            )}

            {modalTopic === 'help' && (
              <div>
                <div className="flex items-center gap-2.5 text-blue-700 mb-3">
                  <HelpCircle className="w-6 h-6" />
                  <h3 className="text-lg font-bold text-slate-900">Help & Support</h3>
                </div>
                <div className="text-sm text-slate-600 space-y-3 leading-relaxed">
                  <p>
                    Need assistance with your account, weekly quizzes, or recruitment listings?
                  </p>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">{BRAND_CONFIG.contactEmail}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    Our platform support team typically responds to inquiries within 24 business hours.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setModalTopic(null)}
                className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
