import React, { useState } from 'react';
import { JobApplication, OnboardingTask, JoiningDocument } from '../../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { createNotification } from '../../services/networkingService';
import {
  Sparkles,
  Trophy,
  Building2,
  MapPin,
  Calendar,
  ExternalLink,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  FileCheck,
  UserCheck,
  X,
  Award,
  Briefcase,
  CheckSquare,
  Square,
  DollarSign
} from 'lucide-react';

interface StudentHiringCelebrationModalProps {
  application: JobApplication;
  onClose: () => void;
  onStatusUpdated?: (updatedApp: JobApplication) => void;
}

export const StudentHiringCelebrationModal: React.FC<StudentHiringCelebrationModalProps> = ({
  application,
  onClose,
  onStatusUpdated
}) => {
  const [app, setApp] = useState<JobApplication>(application);
  const [updating, setUpdating] = useState(false);
  const [successNote, setSuccessNote] = useState<string | null>(null);

  const joining = app.joiningDetails || {};
  const isOfferIssued = app.status === 'offer_issued';
  const isHiredOrAccepted =
    app.status === 'offer_accepted' ||
    app.status === 'hired' ||
    app.status === 'joining_info_available';

  // Calculate days remaining until joining
  const calculateDaysRemaining = (joiningDateStr?: string) => {
    if (!joiningDateStr) return null;
    const target = new Date(joiningDateStr).getTime();
    const now = Date.now();
    const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = calculateDaysRemaining(joining.expectedJoiningDate);

  // Toggle checklist item
  const handleToggleTask = async (taskId: string) => {
    if (!joining.onboardingChecklist) return;

    const updatedChecklist = joining.onboardingChecklist.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );

    const updatedJoining = {
      ...joining,
      onboardingChecklist: updatedChecklist
    };

    try {
      setUpdating(true);
      await updateDoc(doc(db, 'applications', app.id), {
        joiningDetails: updatedJoining,
        updatedAt: new Date().toISOString()
      });

      const updated = { ...app, joiningDetails: updatedJoining };
      setApp(updated);
      onStatusUpdated?.(updated);
    } catch (e) {
      console.error('Checklist update error:', e);
    } finally {
      setUpdating(false);
    }
  };

  // Toggle document status
  const handleToggleDocument = async (docId: string) => {
    if (!joining.requiredDocuments) return;

    const updatedDocs = joining.requiredDocuments.map((d) =>
      d.id === docId ? { ...d, submitted: !d.submitted } : d
    );

    const updatedJoining = {
      ...joining,
      requiredDocuments: updatedDocs
    };

    try {
      setUpdating(true);
      await updateDoc(doc(db, 'applications', app.id), {
        joiningDetails: updatedJoining,
        updatedAt: new Date().toISOString()
      });

      const updated = { ...app, joiningDetails: updatedJoining };
      setApp(updated);
      onStatusUpdated?.(updated);
    } catch (e) {
      console.error('Doc toggle error:', e);
    } finally {
      setUpdating(false);
    }
  };

  // Accept Offer Action
  const handleAcceptOffer = async () => {
    try {
      setUpdating(true);
      await updateDoc(doc(db, 'applications', app.id), {
        status: 'offer_accepted',
        updatedAt: new Date().toISOString()
      });

      // Notify recruiter
      if (app.companyId) {
        await createNotification({
          recipientUid: app.companyId,
          type: 'application_update',
          title: `Offer Accepted: ${app.candidateName}! 🎉`,
          message: `${app.candidateName} has formally accepted the employment offer for ${app.jobTitle || 'Role'}.`,
          link: '/company/applications'
        });
      }

      const updated = { ...app, status: 'offer_accepted' as const };
      setApp(updated);
      onStatusUpdated?.(updated);
      setSuccessNote('Congratulations! Your official offer acceptance has been transmitted to the employer.');
      setTimeout(() => setSuccessNote(null), 5000);
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  const mapsUrl =
    joining.googleMapsUrl ||
    (joining.officeAddress
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(joining.officeAddress)}`
      : 'https://maps.google.com');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative border border-slate-200">
        {/* Festive Golden / Emerald Hero Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 text-white p-6 sm:p-8 rounded-t-3xl">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-36 h-36 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber-400 text-slate-950 shadow-md">
              <Trophy className="w-4 h-4 text-slate-950" />
              <span>Celebratory Hiring Dossier &bull; Verified Offer</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Congratulations, {app.candidateName}! 🎉
            </h1>

            <p className="text-sm sm:text-base text-emerald-100 max-w-2xl leading-relaxed">
              You have been selected by <strong className="text-white underline">{app.companyName || 'the Enterprise'}</strong> for the{' '}
              <strong className="text-white">{joining.offerRole || app.jobTitle}</strong> position.
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/15">
                <span className="text-[10px] text-emerald-200 font-bold uppercase tracking-wider block">
                  Compensation Package
                </span>
                <span className="text-sm font-extrabold text-white mt-0.5 block">
                  {joining.salaryPackage || 'Industry Standard Competitive'}
                </span>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/15">
                <span className="text-[10px] text-emerald-200 font-bold uppercase tracking-wider block">
                  Expected Start Date
                </span>
                <span className="text-sm font-extrabold text-white mt-0.5 block">
                  {joining.expectedJoiningDate || 'Upcoming Schedule'}
                </span>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/15 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-emerald-200 font-bold uppercase tracking-wider block">
                  Countdown to Day One
                </span>
                <span className="text-sm font-extrabold text-amber-300 mt-0.5 block">
                  {daysRemaining !== null ? `${daysRemaining} days remaining` : 'Onboarding Active'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {successNote && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs sm:text-sm text-emerald-900 flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successNote}</span>
            </div>
          )}

          {/* Offer Acceptance CTA if still in offer_issued */}
          {isOfferIssued && (
            <div className="p-5 bg-gradient-to-r from-amber-50 to-emerald-50 rounded-2xl border-2 border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  Official Employment Offer Issued
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Review the details below and confirm your offer acceptance to finalize your onboarding roadmap.
                </p>
              </div>

              <button
                type="button"
                disabled={updating}
                onClick={handleAcceptOffer}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{updating ? 'Accepting Offer...' : 'Accept Official Offer'}</span>
              </button>
            </div>
          )}

          {/* Manager Welcome Message */}
          {joining.welcomeMessage && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Message from Hiring Team
              </span>
              <p className="text-xs text-slate-700 italic leading-relaxed">
                "{joining.welcomeMessage}"
              </p>
            </div>
          )}

          {/* Section 1: Workplace Location & Google Maps Navigation */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Confirmed Workplace &amp; Office Navigation
                </h3>
              </div>
              <span className="text-[11px] font-bold text-slate-600 bg-white px-2.5 py-0.5 rounded-full border border-slate-200 capitalize">
                {joining.workMode || 'Hybrid'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2 space-y-1">
                <span className="text-slate-400 block font-medium">Reporting Office Address:</span>
                <p className="font-bold text-slate-900 text-sm">
                  {joining.officeAddress || 'Global Enterprise Corporate Campus'}
                </p>
                <p className="text-slate-500">
                  Campus: {joining.officeLocation || 'Main Development Center'}
                </p>
              </div>

              <div className="flex items-center sm:justify-end">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Get Google Maps Directions</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Section 2: Contact Representatives */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Reporting Manager
              </span>
              <p className="font-bold text-slate-900 text-sm">
                {joining.reportingManager || 'Engineering Lead'}
              </p>
              <div className="text-xs text-slate-600 flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                <span>Department Leadership</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Recruiter Direct Contact
              </span>
              <p className="font-bold text-slate-900 text-sm">
                {joining.recruiterContactEmail || 'recruiter@enterprise.com'}
              </p>
              {joining.recruiterContactPhone && (
                <div className="text-xs text-slate-600 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{joining.recruiterContactPhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Interactive Onboarding Checklist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                Interactive Onboarding Milestones
              </h3>
              <span className="text-xs text-slate-500">
                {joining.onboardingChecklist?.filter((t) => t.completed).length || 0} of{' '}
                {joining.onboardingChecklist?.length || 4} Completed
              </span>
            </div>

            <div className="space-y-2">
              {(joining.onboardingChecklist || [
                { id: 't-1', label: 'Review and e-sign official employment agreement', completed: isHiredOrAccepted },
                { id: 't-2', label: 'Submit government ID and background verification details', completed: false },
                { id: 't-3', label: 'Select corporate development laptop & equipment preferences', completed: false },
                { id: 't-4', label: 'Complete direct deposit payroll authorization form', completed: false }
              ]).map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => handleToggleTask(task.id)}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-colors ${
                    task.completed
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span className={`text-xs font-semibold ${task.completed ? 'line-through text-slate-500' : ''}`}>
                      {task.label}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    {task.completed ? 'Completed' : 'Action Needed'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Required Documents Submission Checklist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-600" />
                Required Onboarding Documentation
              </h3>
              <span className="text-xs text-slate-400">Bring or upload prior to start date</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(joining.requiredDocuments || [
                { id: 'd-1', name: 'Government Issued Photo ID / Passport', submitted: false, mandatory: true },
                { id: 'd-2', name: 'Degree Certificate or Consolidated Transcript', submitted: false, mandatory: true },
                { id: 'd-3', name: 'Tax Identification / SSN / PAN form', submitted: false, mandatory: true },
                { id: 'd-4', name: 'Signed Code of Conduct Agreement', submitted: false, mandatory: true }
              ]).map((docItem) => (
                <div
                  key={docItem.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-slate-800">{docItem.name}</p>
                    <span className="text-[10px] text-amber-700 font-bold uppercase">
                      {docItem.mandatory ? 'Mandatory' : 'Optional'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleDocument(docItem.id)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-colors ${
                      docItem.submitted
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {docItem.submitted ? '✓ Verified / Ready' : 'Mark Ready'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 rounded-b-3xl flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Assigned to Candidate Profile: <strong className="text-slate-800">{app.candidateEmail}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs"
          >
            Close Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
