import React, { useState } from 'react';
import { DigitalBadge, BadgeTier } from '../../types';
import {
  Award,
  ShieldCheck,
  Code2,
  Cpu,
  Terminal,
  Zap,
  Star,
  CheckCircle2,
  ExternalLink,
  X,
  Sparkles,
  Trophy
} from 'lucide-react';

interface BadgeCardProps {
  badge: DigitalBadge;
  size?: 'sm' | 'md' | 'lg';
  showDetailsOnClick?: boolean;
}

export const BadgeCard: React.FC<BadgeCardProps> = ({
  badge,
  size = 'md',
  showDetailsOnClick = true
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  // Render appropriate Lucide icon
  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu':
        return <Cpu className="w-full h-full" />;
      case 'Code2':
        return <Code2 className="w-full h-full" />;
      case 'Terminal':
        return <Terminal className="w-full h-full" />;
      case 'Zap':
        return <Zap className="w-full h-full" />;
      case 'Star':
        return <Star className="w-full h-full" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-full h-full" />;
      case 'Trophy':
        return <Trophy className="w-full h-full" />;
      default:
        return <Award className="w-full h-full" />;
    }
  };

  const getTierStyles = (tier: BadgeTier) => {
    switch (tier) {
      case 'gold':
        return {
          border: 'border-amber-300',
          bg: 'bg-gradient-to-b from-amber-50 to-white',
          iconBg: 'bg-amber-100 text-amber-800 border-amber-300',
          tagBg: 'bg-amber-100 text-amber-900 border-amber-300',
          label: 'Gold Tier'
        };
      case 'silver':
        return {
          border: 'border-slate-300',
          bg: 'bg-gradient-to-b from-slate-100 to-white',
          iconBg: 'bg-slate-200 text-slate-800 border-slate-300',
          tagBg: 'bg-slate-100 text-slate-700 border-slate-300',
          label: 'Silver Tier'
        };
      case 'bronze':
        return {
          border: 'border-orange-300',
          bg: 'bg-gradient-to-b from-orange-50 to-white',
          iconBg: 'bg-orange-100 text-orange-800 border-orange-300',
          tagBg: 'bg-orange-100 text-orange-900 border-orange-300',
          label: 'Bronze Tier'
        };
      case 'verified':
      default:
        return {
          border: 'border-blue-300',
          bg: 'bg-gradient-to-b from-blue-50/60 to-white',
          iconBg: 'bg-blue-100 text-blue-800 border-blue-200',
          tagBg: 'bg-blue-100 text-blue-900 border-blue-200',
          label: 'Verified Credential'
        };
    }
  };

  const tierStyles = getTierStyles(badge.tier);

  return (
    <>
      <div
        onClick={() => showDetailsOnClick && setModalOpen(true)}
        className={`group relative rounded-2xl border ${tierStyles.border} ${tierStyles.bg} p-4 transition-all duration-200 hover:shadow-md ${
          showDetailsOnClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
        }`}
      >
        <div className="flex items-start gap-3.5">
          {/* Badge Icon Emblem */}
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center p-2.5 shrink-0 border ${tierStyles.iconBg} shadow-xs group-hover:scale-105 transition-transform`}
          >
            {getBadgeIcon(badge.iconName)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1 mb-1">
              <span
                className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${tierStyles.tagBg}`}
              >
                {tierStyles.label}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {new Date(badge.earnedDate).toLocaleDateString(undefined, {
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>

            <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
              {badge.title}
            </h4>

            <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
              {badge.description}
            </p>

            {badge.scoreOrMetric && (
              <div className="mt-2 text-[11px] font-semibold text-slate-700 bg-white/80 px-2 py-0.5 rounded border border-slate-200 inline-block">
                {badge.scoreOrMetric}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal with Verification Details */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200 animate-in fade-in">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pt-2 pb-4 border-b border-slate-100">
              <div
                className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center p-3.5 border ${tierStyles.iconBg} shadow-sm mb-3`}
              >
                {getBadgeIcon(badge.iconName)}
              </div>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${tierStyles.tagBg}`}
              >
                {tierStyles.label}
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-2">{badge.title}</h3>
              <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">{badge.description}</p>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Issuing Authority:</span>
                <span className="font-bold text-slate-900">{badge.issuedBy}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Date Awarded:</span>
                <span className="font-medium text-slate-800">
                  {new Date(badge.earnedDate).toLocaleDateString(undefined, {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Qualification Metric:</span>
                <span className="font-bold text-blue-700">{badge.scoreOrMetric || 'Verified Competency'}</span>
              </div>
              <div className="py-1.5">
                <span className="font-semibold text-slate-500 block mb-1">Earning Criteria:</span>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {badge.criteria}
                </p>
              </div>
              <div className="py-1 text-[11px] text-slate-400 font-mono flex items-center justify-between">
                <span>Verification ID:</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded">{badge.verificationId}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Close Verification
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
