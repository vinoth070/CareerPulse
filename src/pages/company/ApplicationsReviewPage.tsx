import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { JobApplication, ApplicationStatus, JoiningDetails, InterviewDetails } from '../../types';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { createNotification } from '../../services/networkingService';
import {
  FileText,
  Filter,
  CheckCircle2,
  AlertCircle,
  User,
  Mail,
  GraduationCap,
  Clock,
  ArrowRight,
  Calendar,
  Video,
  Award,
  Sparkles,
  MapPin,
  DollarSign,
  Phone,
  Briefcase,
  X,
  ExternalLink,
  ChevronRight,
  FileCheck,
  Send,
  Building2
} from 'lucide-react';

const PIPELINE_STAGES: { key: ApplicationStatus; label: string; badgeColor: string }[] = [
  { key: 'applied', label: '1. Applied', badgeColor: 'bg-blue-50 text-blue-700 border-blue-200' },
  { key: 'under_review', label: '2. Under Review', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200' },
  { key: 'shortlisted', label: '3. Shortlisted', badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { key: 'assessment', label: '4. Assessment', badgeColor: 'bg-violet-50 text-violet-700 border-violet-200' },
  { key: 'interview_scheduled', label: '5. Interview Scheduled', badgeColor: 'bg-purple-50 text-purple-700 border-purple-200' },
  { key: 'interview_completed', label: '6. Interview Completed', badgeColor: 'bg-teal-50 text-teal-700 border-teal-200' },
  { key: 'offer_pending', label: '7. Offer Pending', badgeColor: 'bg-orange-50 text-orange-700 border-orange-200' },
  { key: 'offer_issued', label: '8. Offer Issued', badgeColor: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
  { key: 'offer_accepted', label: '9. Offer Accepted', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { key: 'hired', label: '10. Hired', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold' },
  { key: 'joining_info_available', label: '11. Joining Info Ready', badgeColor: 'bg-green-100 text-green-900 border-green-300' },
  { key: 'rejected', label: 'Rejected', badgeColor: 'bg-slate-100 text-slate-500 border-slate-200' },
  { key: 'withdrawn', label: 'Withdrawn', badgeColor: 'bg-slate-100 text-slate-400 border-slate-200' }
];

export const ApplicationsReviewPage: React.FC = () => {
  const { currentUser, companyProfile } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStage, setFilterStage] = useState<string>('all');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Modal States
  const [schedulingApp, setSchedulingApp] = useState<JobApplication | null>(null);
  const [interviewForm, setInterviewForm] = useState<InterviewDetails>({
    scheduledDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    scheduledTime: '14:00 UTC',
    interviewType: 'technical',
    meetingLink: '',
    interviewerName: '',
    interviewerTitle: 'Senior Engineering Manager',
    notes: 'Technical coding round and systems architecture discussion.',
    roundNumber: 1
  });

  const [configuringOfferApp, setConfiguringOfferApp] = useState<JobApplication | null>(null);
  const [offerForm, setOfferForm] = useState<JoiningDetails>({
    offerRole: '',
    salaryPackage: '$120,000 / year',
    expectedJoiningDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
    officeLocation: 'Corporate Tech Campus',
    officeAddress: '100 Innovation Boulevard, Tech Park, Suite 400',
    googleMapsUrl: '',
    reportingManager: 'Jordan Miller (VP Engineering)',
    recruiterContactEmail: '',
    recruiterContactPhone: '+1 (555) 019-4820',
    welcomeMessage: 'We are thrilled to welcome you to our team! Prepare for an exciting career journey with impactful projects.',
    workMode: 'hybrid',
    onboardingChecklist: [
      { id: 't-1', label: 'Review and e-sign official employment agreement', completed: false },
      { id: 't-2', label: 'Submit government ID and background verification details', completed: false },
      { id: 't-3', label: 'Select corporate development laptop & equipment preferences', completed: false },
      { id: 't-4', label: 'Complete direct deposit payroll authorization form', completed: false }
    ],
    requiredDocuments: [
      { id: 'd-1', name: 'Government Issued Photo ID / Passport', submitted: false, mandatory: true },
      { id: 'd-2', name: 'Degree Certificate or Consolidated Transcript', submitted: false, mandatory: true },
      { id: 'd-3', name: 'Tax Identification / Social Security Number form', submitted: false, mandatory: true },
      { id: 'd-4', name: 'Prior internship relieving letter (if applicable)', submitted: false, mandatory: false }
    ]
  });

  const fetchApplications = async () => {
    if (!currentUser) return;
    try {
      const q = query(
        collection(db, 'applications'),
        where('companyId', '==', currentUser.uid)
      );
      const snap = await getDocs(q);
      const list: JobApplication[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as any) });
      });
      list.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
      setApplications(list);
    } catch (e) {
      console.warn('Applications fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [currentUser]);

  // Status message generation for student notification
  const getStageNotificationDetails = (status: ApplicationStatus, jobTitle: string, companyName: string) => {
    switch (status) {
      case 'under_review':
        return {
          title: `Application Under Review: ${jobTitle}`,
          message: `The recruiting team at ${companyName} has opened and is actively reviewing your candidate application.`
        };
      case 'shortlisted':
        return {
          title: `Shortlisted for ${jobTitle}!`,
          message: `Great news! You have been shortlisted by ${companyName} for the next evaluation milestone.`
        };
      case 'assessment':
        return {
          title: `Assessment Stage: ${jobTitle}`,
          message: `You have advanced to the technical assessment phase with ${companyName}. Check your application portal for details.`
        };
      case 'interview_scheduled':
        return {
          title: `Interview Scheduled with ${companyName}`,
          message: `Your interview for ${jobTitle} has been scheduled. View your meeting link and interview preparation notes.`
        };
      case 'interview_completed':
        return {
          title: `Interview Completed: ${jobTitle}`,
          message: `Your interview with ${companyName} has concluded and the evaluation rubric is under debrief review.`
        };
      case 'offer_pending':
        return {
          title: `Offer Formulation: ${jobTitle}`,
          message: `The hiring committee at ${companyName} has designated your profile for an employment offer.`
        };
      case 'offer_issued':
        return {
          title: `Formal Offer Received from ${companyName}!`,
          message: `Congratulations! An official offer has been issued for ${jobTitle}. Review compensation, office location, and accept your offer!`
        };
      case 'offer_accepted':
        return {
          title: `Offer Accepted Confirmed: ${jobTitle}`,
          message: `Your offer acceptance with ${companyName} is recorded. Welcome to the team!`
        };
      case 'hired':
        return {
          title: `You are officially HIRED by ${companyName}! 🎉`,
          message: `Welcome aboard! Your joining confirmation and onboarding milestones are active in your Celebratory Hiring Dashboard.`
        };
      case 'joining_info_available':
        return {
          title: `Joining Information Ready: ${companyName}`,
          message: `Office directions, Google Maps directions, onboarding checklist, and recruiter contacts are available for your start date.`
        };
      case 'rejected':
        return {
          title: `Application Update: ${jobTitle}`,
          message: `Thank you for taking the time to apply with ${companyName}. We have decided not to advance your application at this time.`
        };
      default:
        return {
          title: `Application Status Changed: ${jobTitle}`,
          message: `Your application status at ${companyName} has been updated to ${status.replace('_', ' ')}.`
        };
    }
  };

  const handleUpdateStatus = async (
    appId: string,
    newStatus: ApplicationStatus,
    optionalPayload?: { joiningDetails?: JoiningDetails; interviewDetails?: InterviewDetails; feedbackNote?: string }
  ) => {
    try {
      const appRef = doc(db, 'applications', appId);
      const app = applications.find((a) => a.id === appId);
      const companyName = companyProfile?.companyName || app?.companyName || 'Enterprise Partner';
      const jobTitle = app?.jobTitle || 'Opportunity';

      const updateData: any = {
        status: newStatus,
        updatedAt: new Date().toISOString()
      };

      if (optionalPayload?.joiningDetails) {
        updateData.joiningDetails = optionalPayload.joiningDetails;
      }
      if (optionalPayload?.interviewDetails) {
        updateData.interviewDetails = optionalPayload.interviewDetails;
      }
      if (optionalPayload?.feedbackNote) {
        updateData.feedbackNote = optionalPayload.feedbackNote;
      }

      await updateDoc(appRef, updateData);

      // Dispatch persistent real-time in-app notification to candidate!
      if (app?.candidateUid) {
        const notifInfo = getStageNotificationDetails(newStatus, jobTitle, companyName);
        await createNotification({
          recipientUid: app.candidateUid,
          type: newStatus.includes('interview') ? 'interview_scheduled' : 'application_update',
          title: notifInfo.title,
          message: notifInfo.message,
          link: '/student/opportunities'
        });
      }

      setApplications(
        applications.map((a) =>
          a.id === appId ? { ...a, ...updateData } : a
        )
      );

      setFeedback(`Candidate updated to stage: ${newStatus.replace('_', ' ').toUpperCase()}. Candidate notified.`);
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      console.error(err);
      setFeedback('Failed to update application status.');
    }
  };

  // Open Interview Scheduler
  const handleOpenScheduler = (app: JobApplication) => {
    setSchedulingApp(app);
    setInterviewForm({
      scheduledDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      scheduledTime: '14:00 UTC',
      interviewType: 'technical',
      meetingLink: `/interview/${app.id}`,
      interviewerName: companyProfile?.recruiterName || 'Senior Technical Lead',
      interviewerTitle: 'Technical Hiring Manager',
      notes: `Evaluation for ${app.jobTitle || 'Role'}. Topics: System Architecture, Data Structures, Problem Solving.`,
      roundNumber: 1
    });
  };

  // Submit Scheduled Interview
  const handleSaveInterviewSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingApp) return;

    await handleUpdateStatus(schedulingApp.id, 'interview_scheduled', {
      interviewDetails: interviewForm
    });
    setSchedulingApp(null);
  };

  // Open Offer Configurator
  const handleOpenOfferModal = (app: JobApplication, targetStatus: ApplicationStatus = 'offer_issued') => {
    setConfiguringOfferApp(app);
    const officeAddr = companyProfile?.headquartersAddress || companyProfile?.location || '100 Technology Way, Suite 400';
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(officeAddr)}`;
    setOfferForm({
      offerRole: app.jobTitle || 'Software Engineer',
      salaryPackage: '$120,000 / year',
      expectedJoiningDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
      officeLocation: companyProfile?.location || 'Corporate Headquarters',
      officeAddress: officeAddr,
      googleMapsUrl: mapsLink,
      reportingManager: `${companyProfile?.recruiterName || 'Talent Lead'} & Engineering Director`,
      recruiterContactEmail: companyProfile?.workEmail || currentUser?.email || '',
      recruiterContactPhone: companyProfile?.recruiterPhone || '+1 (555) 019-3829',
      welcomeMessage: `We were thoroughly impressed by your performance throughout our evaluation rounds. Welcome to ${companyProfile?.companyName || 'our company'}!`,
      workMode: 'hybrid',
      onboardingChecklist: [
        { id: 't-1', label: 'Sign and return official offer confirmation', completed: false },
        { id: 't-2', label: 'Provide government identification & verified degrees', completed: false },
        { id: 't-3', label: 'Choose engineering workstation & IT peripherals', completed: false },
        { id: 't-4', label: 'Submit direct deposit & tax withholding elections', completed: false }
      ],
      requiredDocuments: [
        { id: 'd-1', name: 'Government Issued ID / Passport', submitted: false, mandatory: true },
        { id: 'd-2', name: 'Graduation Degree / Course Completion Certificate', submitted: false, mandatory: true },
        { id: 'd-3', name: 'Taxpayer Identification / SSN / PAN verification', submitted: false, mandatory: true },
        { id: 'd-4', name: 'Signed Code of Conduct Agreement', submitted: false, mandatory: true }
      ]
    });
  };

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configuringOfferApp) return;

    await handleUpdateStatus(configuringOfferApp.id, 'offer_issued', {
      joiningDetails: offerForm
    });
    setConfiguringOfferApp(null);
  };

  const filteredApps = applications.filter((app) => {
    return filterStage === 'all' || app.status === filterStage;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-slate-900 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-2">
              <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Enterprise Recruiter Pipeline</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Candidate Applications &amp; 11-Stage Hiring Lifecycle
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Advance candidates from initial review to assessment, interviews, offer issuance, and confirmed joining with automated real-time candidate notifications.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="py-2.5 px-3 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
            >
              <option value="all">All 11 Pipeline Stages</option>
              {PIPELINE_STAGES.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {feedback && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs sm:text-sm text-emerald-900 flex items-center gap-2 shadow-xs animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* 11 Pipeline Milestone Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {PIPELINE_STAGES.slice(0, 11).map((st) => {
            const count = applications.filter((a) => a.status === st.key).length;
            const isSelected = filterStage === st.key;
            return (
              <button
                key={st.key}
                onClick={() => setFilterStage(isSelected ? 'all' : st.key)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'ring-2 ring-slate-900 bg-white shadow-xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
                  {st.label}
                </p>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-xl font-extrabold text-slate-900">{count}</span>
                  {count > 0 && (
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              Active Candidates ({filteredApps.length})
            </h3>
            <span className="text-xs text-slate-400">
              Sorted by application date (newest first)
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500">
              Loading candidates in pipeline...
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs space-y-2">
              <FileText className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-700">No applications in this stage</p>
              <p>Candidates applying to your jobs or challenges will automatically appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredApps.map((app) => {
                const currentStageObj = PIPELINE_STAGES.find((s) => s.key === app.status);

                return (
                  <div key={app.id} className="p-6 hover:bg-slate-50/60 transition-colors space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Candidate Identity */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-bold text-slate-900">{app.candidateName}</h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase border ${currentStageObj?.badgeColor || 'bg-slate-100'}`}>
                            {currentStageObj?.label || app.status.replace('_', ' ')}
                          </span>
                          {app.matchScore !== undefined && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              {app.matchScore}% Skill Fit
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1 font-semibold text-slate-800">
                            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                            {app.jobTitle || 'Role Opening'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {app.candidateEmail}
                          </span>
                          {app.candidateDegree && (
                            <span className="flex items-center gap-1">
                              <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                              {app.candidateDegree} &bull; {app.candidateInstitution}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-slate-400">
                            <Clock className="w-3 h-3" />
                            Applied {new Date(app.appliedAt).toLocaleDateString()}
                          </span>
                        </div>

                        {app.coverNote && (
                          <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 italic max-w-2xl">
                            "{app.coverNote}"
                          </p>
                        )}

                        {/* Interview Details if scheduled */}
                        {app.interviewDetails?.scheduledDate && (
                          <div className="p-3 bg-purple-50/80 rounded-xl border border-purple-200 text-xs text-purple-900 flex flex-wrap items-center gap-3">
                            <Video className="w-4 h-4 text-purple-600 shrink-0" />
                            <span>
                              <strong>Interview Scheduled:</strong> {app.interviewDetails.scheduledDate} at {app.interviewDetails.scheduledTime} ({app.interviewDetails.interviewType})
                            </span>
                            {app.interviewDetails.meetingLink && (
                              <a
                                href={app.interviewDetails.meetingLink}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2 py-0.5 bg-purple-600 text-white rounded font-bold text-[11px] hover:bg-purple-700 flex items-center gap-1"
                              >
                                Join Interview Room <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        )}

                        {/* Offer / Joining Details if issued or hired */}
                        {app.joiningDetails && (
                          <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                            <div className="flex items-center gap-2 font-bold text-emerald-950">
                              <Award className="w-4 h-4 text-emerald-700" />
                              <span>Official Offer: {app.joiningDetails.offerRole} &bull; {app.joiningDetails.salaryPackage}</span>
                            </div>
                            <p className="text-[11px] text-emerald-800">
                              Joining Date: <strong>{app.joiningDetails.expectedJoiningDate}</strong> &bull; Office: {app.joiningDetails.officeAddress}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Stage Progression Actions */}
                      <div className="flex flex-wrap lg:flex-col items-end gap-2 shrink-0">
                        {/* Milestone Fast-Action Buttons */}
                        {app.status === 'applied' && (
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'under_review')}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1"
                          >
                            <span>Mark Under Review</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}

                        {app.status === 'under_review' && (
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'shortlisted')}
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1"
                          >
                            <span>Shortlist Candidate</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}

                        {app.status === 'shortlisted' && (
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'assessment')}
                            className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1"
                          >
                            <span>Send Assessment</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}

                        {(app.status === 'assessment' || app.status === 'shortlisted') && (
                          <button
                            onClick={() => handleOpenScheduler(app)}
                            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Schedule Interview</span>
                          </button>
                        )}

                        {app.status === 'interview_scheduled' && (
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'interview_completed')}
                            className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1"
                          >
                            <span>Mark Interview Complete</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}

                        {app.status === 'interview_completed' && (
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'offer_pending')}
                            className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1"
                          >
                            <span>Mark Offer Pending</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}

                        {(app.status === 'offer_pending' || app.status === 'interview_completed') && (
                          <button
                            onClick={() => handleOpenOfferModal(app, 'offer_issued')}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                          >
                            <Award className="w-4 h-4" />
                            <span>Issue Formal Offer</span>
                          </button>
                        )}

                        {app.status === 'offer_accepted' && (
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'hired')}
                            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                          >
                            <Sparkles className="w-4 h-4" />
                            <span>Confirm Hired Status</span>
                          </button>
                        )}

                        {app.status === 'hired' && (
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'joining_info_available')}
                            className="px-3.5 py-1.5 bg-green-700 hover:bg-green-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1"
                          >
                            <span>Publish Joining Package</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}

                        {/* Dropdown for Jump to any Stage */}
                        <div className="flex items-center gap-1 pt-1">
                          <select
                            value={app.status}
                            onChange={(e) => {
                              const target = e.target.value as ApplicationStatus;
                              if (target === 'interview_scheduled') {
                                handleOpenScheduler(app);
                              } else if (target === 'offer_issued' || target === 'hired' || target === 'joining_info_available') {
                                handleOpenOfferModal(app, target);
                              } else {
                                handleUpdateStatus(app.id, target);
                              }
                            }}
                            className="py-1 px-2 text-[11px] bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:outline-none"
                          >
                            {PIPELINE_STAGES.map((s) => (
                              <option key={s.key} value={s.key}>{s.label}</option>
                            ))}
                          </select>

                          {app.status !== 'rejected' && (
                            <button
                              onClick={() => {
                                const reason = prompt('Optional rejection note for candidate:');
                                handleUpdateStatus(app.id, 'rejected', { feedbackNote: reason || undefined });
                              }}
                              className="px-2 py-1 text-[11px] text-rose-600 hover:bg-rose-50 rounded-lg font-semibold"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Schedule Interview Modal */}
      {schedulingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-200 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
                  Hiring Pipeline Milestone 5
                </span>
                <h3 className="text-lg font-bold text-slate-900">Schedule Candidate Interview</h3>
                <p className="text-xs text-slate-500">Candidate: {schedulingApp.candidateName} &bull; {schedulingApp.jobTitle}</p>
              </div>
              <button
                onClick={() => setSchedulingApp(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInterviewSchedule} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Interview Date *</label>
                  <input
                    type="date"
                    required
                    value={interviewForm.scheduledDate}
                    onChange={(e) => setInterviewForm({ ...interviewForm, scheduledDate: e.target.value })}
                    className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Time &amp; Timezone *</label>
                  <input
                    type="text"
                    required
                    value={interviewForm.scheduledTime}
                    onChange={(e) => setInterviewForm({ ...interviewForm, scheduledTime: e.target.value })}
                    placeholder="e.g. 14:00 UTC / 10:00 AM EST"
                    className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Interview Type</label>
                  <select
                    value={interviewForm.interviewType}
                    onChange={(e) => setInterviewForm({ ...interviewForm, interviewType: e.target.value as any })}
                    className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                  >
                    <option value="technical">Technical Coding &amp; Architecture</option>
                    <option value="system_design">System Design &amp; Scale</option>
                    <option value="behavioral">Behavioral &amp; Leadership</option>
                    <option value="hr">HR Culture &amp; Compensation</option>
                    <option value="executive">Executive Final Round</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Interviewer Name</label>
                  <input
                    type="text"
                    required
                    value={interviewForm.interviewerName}
                    onChange={(e) => setInterviewForm({ ...interviewForm, interviewerName: e.target.value })}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Interview Room Link</label>
                <input
                  type="text"
                  value={interviewForm.meetingLink}
                  onChange={(e) => setInterviewForm({ ...interviewForm, meetingLink: e.target.value })}
                  placeholder="/interview/room-id or Google Meet / Zoom link"
                  className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Preparation Notes for Candidate</label>
                <textarea
                  rows={3}
                  value={interviewForm.notes}
                  onChange={(e) => setInterviewForm({ ...interviewForm, notes: e.target.value })}
                  placeholder="Instructions, topics, and environment preparation..."
                  className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSchedulingApp(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Confirm Schedule &amp; Notify Candidate</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Configure Offer & Joining Details Modal */}
      {configuringOfferApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  Hiring Pipeline Milestones 8 to 11 &bull; Employment Package
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Configure Official Offer &amp; Joining Dossier
                </h3>
                <p className="text-xs text-slate-500">
                  Candidate: {configuringOfferApp.candidateName} &bull; {configuringOfferApp.candidateEmail}
                </p>
              </div>
              <button
                onClick={() => setConfiguringOfferApp(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOffer} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Offered Role Title *</label>
                  <input
                    type="text"
                    required
                    value={offerForm.offerRole}
                    onChange={(e) => setOfferForm({ ...offerForm, offerRole: e.target.value })}
                    className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Salary Package / Compensation *</label>
                  <input
                    type="text"
                    required
                    value={offerForm.salaryPackage}
                    onChange={(e) => setOfferForm({ ...offerForm, salaryPackage: e.target.value })}
                    placeholder="e.g. $125,000 / year or ₹18,00,000 / year"
                    className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Joining Date *</label>
                  <input
                    type="date"
                    required
                    value={offerForm.expectedJoiningDate}
                    onChange={(e) => setOfferForm({ ...offerForm, expectedJoiningDate: e.target.value })}
                    className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Work Arrangement</label>
                  <select
                    value={offerForm.workMode}
                    onChange={(e) => setOfferForm({ ...offerForm, workMode: e.target.value as any })}
                    className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="hybrid">Hybrid (Campus + Remote)</option>
                    <option value="onsite">Onsite (Corporate Campus)</option>
                    <option value="remote">100% Remote Global</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirmed Office Address *</label>
                <input
                  type="text"
                  required
                  value={offerForm.officeAddress}
                  onChange={(e) => {
                    const addr = e.target.value;
                    setOfferForm({
                      ...offerForm,
                      officeAddress: addr,
                      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`
                    });
                  }}
                  placeholder="Street address, building, city, zip code"
                  className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reporting Manager</label>
                  <input
                    type="text"
                    value={offerForm.reportingManager}
                    onChange={(e) => setOfferForm({ ...offerForm, reportingManager: e.target.value })}
                    placeholder="e.g. Jordan Miller (VP Engineering)"
                    className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Recruiter Direct Phone</label>
                  <input
                    type="tel"
                    value={offerForm.recruiterContactPhone}
                    onChange={(e) => setOfferForm({ ...offerForm, recruiterContactPhone: e.target.value })}
                    placeholder="+1 (555) 019-3829"
                    className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Welcome Message for Candidate</label>
                <textarea
                  rows={2}
                  value={offerForm.welcomeMessage}
                  onChange={(e) => setOfferForm({ ...offerForm, welcomeMessage: e.target.value })}
                  className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Onboarding Checklist Summary */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <span className="font-bold text-slate-800 block">Automated Candidate Onboarding Dossier:</span>
                <div className="space-y-1 text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Includes Google Maps directions link for {offerForm.officeAddress}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Interactive 4-milestone onboarding task tracker with real-time toggle</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Required identity, degree, and tax documentation submission checklist</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setConfiguringOfferApp(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Award className="w-4 h-4" />
                  <span>Issue Formal Offer &amp; Enable Candidate Dashboard</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
