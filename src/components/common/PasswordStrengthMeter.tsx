import React from 'react';
import { Check, X, ShieldAlert, ShieldCheck } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
  confirmPassword?: string;
  showConfirmCheck?: boolean;
}

export const getPasswordStrength = (pwd: string) => {
  let score = 0;
  if (!pwd) return { score: 0, label: 'None', color: 'bg-slate-200', text: 'text-slate-400' };

  // Criteria
  const hasMinLength = pwd.length >= 8;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd);

  if (hasMinLength) score++;
  if (hasUpper && hasLower) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;
  if (pwd.length >= 12) score++;

  if (score <= 2) {
    return {
      score,
      label: 'Weak',
      color: 'bg-rose-500',
      text: 'text-rose-600',
      hasMinLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial
    };
  } else if (score === 3 || score === 4) {
    return {
      score,
      label: 'Medium',
      color: 'bg-amber-500',
      text: 'text-amber-600',
      hasMinLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial
    };
  } else {
    return {
      score,
      label: 'Strong',
      color: 'bg-emerald-500',
      text: 'text-emerald-600',
      hasMinLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial
    };
  }
};

export const PasswordStrengthMeter: React.FC<PasswordStrengthProps> = ({
  password,
  confirmPassword,
  showConfirmCheck = true
}) => {
  if (!password) return null;

  const strength = getPasswordStrength(password);
  const isMatch = confirmPassword !== undefined && confirmPassword.length > 0 && password === confirmPassword;
  const hasMismatch = confirmPassword !== undefined && confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <div className="mt-2 space-y-2 text-xs">
      {/* Strength Bar */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-slate-600 font-medium">Password Strength:</span>
          <span className={`font-semibold ${strength.text}`}>{strength.label}</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              strength.score >= 1 ? strength.color : 'bg-slate-200'
            } w-1/3`}
          />
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              strength.score >= 3 ? strength.color : 'bg-slate-200'
            } w-1/3`}
          />
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              strength.score >= 5 ? strength.color : 'bg-slate-200'
            } w-1/3`}
          />
        </div>
      </div>

      {/* Guidelines checklist */}
      <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-500 pt-1">
        <div className="flex items-center gap-1.5">
          {strength.hasMinLength ? (
            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          ) : (
            <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          )}
          <span>At least 8 characters</span>
        </div>
        <div className="flex items-center gap-1.5">
          {strength.hasUpper && strength.hasLower ? (
            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          ) : (
            <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          )}
          <span>Upper & lowercase</span>
        </div>
        <div className="flex items-center gap-1.5">
          {strength.hasNumber ? (
            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          ) : (
            <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          )}
          <span>At least one number</span>
        </div>
        <div className="flex items-center gap-1.5">
          {strength.hasSpecial ? (
            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          ) : (
            <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          )}
          <span>Special character</span>
        </div>
      </div>

      {/* Confirmation match check */}
      {showConfirmCheck && confirmPassword !== undefined && confirmPassword.length > 0 && (
        <div
          className={`flex items-center gap-1.5 p-2 rounded-lg transition-colors ${
            isMatch ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
          }`}
        >
          {isMatch ? (
            <>
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">Passwords match perfectly</span>
            </>
          ) : hasMismatch ? (
            <>
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-medium">Passwords do not match yet</span>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};
