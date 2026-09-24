'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Phone, Lock, ArrowRight, RotateCcw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { submitOTP, verifyOTP, saveUserSession } from '@/lib/api-client';

const BRAND_COLOR = '#04164a';

interface AuthInterceptSheetProps {
  isOpen: boolean;
  onClose: () => void;
  pendingActionName: string; // e.g., "Book Inspection Tour" or "Save Property"
  pendingActionData?: Record<string, unknown>; // e.g., { propertyId: '123' }
  onSuccess: (data?: Record<string, unknown>) => void;
}

export const AuthInterceptSheet: React.FC<AuthInterceptSheetProps> = ({
  isOpen,
  onClose,
  pendingActionName,
  pendingActionData,
  onSuccess,
}) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [phoneError, setPhoneError] = useState('');
  const [apiError, setApiError] = useState('');

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && resendTimer > 0) {
      timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendTimer]);

  // Basic Nigerian Phone Format Check
  const validateNigerianPhone = (num: string) => {
    const cleaned = num.replace(/\s+/g, '');
    const regex = /^(?:\+234|234|0)[789][01]\d{8}$/;
    return regex.test(cleaned);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    if (!validateNigerianPhone(phone)) {
      setPhoneError('Please enter a valid Nigerian phone number (e.g., 08012345678)');
      return;
    }
    setPhoneError('');
    setIsSubmitting(true);

    try {
      const response = await submitOTP(phone, 'login');
      const responseData = response.data as { dev_code?: string } | undefined;
      if (responseData?.dev_code && process.env.NODE_ENV !== 'production') {
        // DEV ONLY — dev_code is never returned in production (is_dev_client guard)
        console.log('DEV OTP Code:', responseData.dev_code);
      }
      setIsSubmitting(false);
      setStep('otp');
      setResendTimer(60);
    } catch (error: any) {
      setIsSubmitting(false);
      setPhoneError(error.message || 'Failed to send OTP. Please try again.');
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next OTP input box
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    const fullCode = otp.join('');
    if (fullCode.length < 6) return;

    setIsSubmitting(true);

    try {
      const response = await verifyOTP(phone, fullCode, 'login');
      const verifyData = response.data as { access: string; refresh: string; user: { id: string; phone: string; is_new_user: boolean } } | undefined;
      if (!verifyData) throw new Error('Invalid response from server');
      const { access, refresh, user } = verifyData;
      
      // Store tokens (session-scoped - cleared when the tab closes)
      if (typeof window !== 'undefined') {
        saveUserSession(access, refresh, user);
      }
      
      setIsSubmitting(false);
      onSuccess(pendingActionData); // Executes pending action with context
      handleReset();
      onClose();
    } catch (error: any) {
      setIsSubmitting(false);
      setApiError(error.message || 'Invalid code. Please try again.');
    }
  };

  const handleReset = () => {
    setStep('phone');
    setPhone('');
    setOtp(['', '', '', '', '', '']);
    setPhoneError('');
    setApiError('');
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && (onClose(), handleReset())}>
      <SheetContent className="bg-white border-l border-slate-200 w-full sm:max-w-md p-6 flex flex-col justify-between">
        <div className="space-y-6 pt-4">
          
          {/* Header Banner */}
          <SheetHeader className="text-left space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#f3f0ff] flex items-center justify-center text-[#04164a]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <SheetTitle className="font-heading text-2xl font-bold text-[#04164a]">
              {step === 'phone' ? 'Quick Sign In' : 'Enter Verification Code'}
            </SheetTitle>
            <SheetDescription className="font-body text-slate-600 text-sm">
              Please sign in to complete your request to{' '}
              <strong className="text-[#04164a]">{pendingActionName}</strong>.
            </SheetDescription>
          </SheetHeader>

          {/* STEP 1: Phone Number Input */}
          {step === 'phone' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-body text-xs font-semibold text-[#04164a]">
                  Nigerian Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08012345678 or +234..."
                    className="pl-10 h-11 border-slate-200 font-body focus:ring-[#04164a]/20 rounded-xl"
                  />
                </div>
                {phoneError && (
                  <p className="font-body text-xs text-rose-600 pt-1">{phoneError}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !phone}
                className="w-full bg-[#04164a] hover:bg-[#04164a]/90 text-white font-heading h-11 rounded-xl flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Verification Code'}
                {!isSubmitting && <ArrowRight className="w-4 h-4" />}
              </Button>
            </form>
          )}

          {/* STEP 2: 6-Digit OTP Input */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="space-y-2">
                <p className="font-body text-xs text-slate-500">
                  We sent a 6-digit code to <strong className="text-slate-800">{phone}</strong>
                </p>
                <div className="flex gap-2 justify-between py-2">
                  {otp.map((digit, idx) => (
                    <Input
                      key={idx}
                      id={`otp-input-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      className="w-11 h-12 text-center font-heading text-lg font-bold border-slate-200 focus:border-[#04164a] focus:ring-1 focus:ring-[#04164a] rounded-xl"
                    />
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || otp.join('').length < 6}
                className="w-full bg-[#04164a] hover:bg-[#04164a]/90 text-white font-heading h-11 rounded-xl flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify & Proceed'}
                {!isSubmitting && <CheckCircle2 className="w-4 h-4" />}
              </Button>

              <div className="flex items-center justify-between font-body text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-slate-500 hover:text-[#04164a] underline"
                >
                  Change Phone
                </button>

                <button
                  type="button"
                  disabled={resendTimer > 0}
                  onClick={() => setResendTimer(60)}
                  className="text-[#04164a] font-semibold disabled:text-slate-400 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Footer Trust Indicator */}
        <div className="border-t border-slate-100 pt-4 font-body text-[11px] text-slate-500 flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>NDPR Compliant. Your information is protected under Nigerian data privacy laws.</span>
        </div>
      </SheetContent>
    </Sheet>
  );
};
