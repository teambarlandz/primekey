'use client';

import React, { useEffect, useState } from 'react';
import { Phone, ArrowRight, RotateCcw, CheckCircle2, AlertCircle, Monitor } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const BRAND_COLOR = '#04164a';

export interface OtpAuthCardConfig {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  phoneLabel: string;
  phonePlaceholder?: string;
  verifyButtonLabel?: string;
}

interface OtpAuthCardProps<T = unknown> {
  config: OtpAuthCardConfig;
  sendOtp: (phone: string) => Promise<{ data?: unknown }>;
  verifyOtp: (phone: string, code: string) => Promise<T>;
  onSuccess: (result: T, rememberDevice?: boolean) => void;
  inputPrefix?: string;
  cardClassName?: string;
  children?: React.ReactNode;
}

export function OtpAuthCard<T = unknown>({
  config,
  sendOtp,
  verifyOtp,
  onSuccess,
  inputPrefix = 'otp',
  cardClassName,
  children,
}: OtpAuthCardProps<T>) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [phoneError, setPhoneError] = useState('');
  const [apiError, setApiError] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && resendTimer > 0) {
      timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendTimer]);

  const validateNigerianPhone = (num: string) => {
    const cleaned = num.replace(/\s+/g, '');
    const regex = /^(?:\+234|234|0)[789][01]\d{8}$/;
    return regex.test(cleaned);
  };

  const handleSendOtp = async (phoneNumber: string) => {
    setApiError('');
    if (!validateNigerianPhone(phoneNumber)) {
      setPhoneError('Please enter a valid Nigerian phone number (e.g., 08012345678)');
      return;
    }
    setPhoneError('');
    setIsSubmitting(true);

    try {
      const response = await sendOtp(phoneNumber);
      const devCode = (response?.data as { dev_code?: string } | undefined)?.dev_code;
      if (devCode && process.env.NODE_ENV !== 'production') {
        console.log(`DEV OTP Code (${config.title}):`, devCode);
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

    if (value && index < 5) {
      const nextInput = document.getElementById(`${inputPrefix}-input-${index + 1}`);
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
      const result = await verifyOtp(phone, fullCode);
      setIsSubmitting(false);
      onSuccess(result, rememberDevice);
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
    <Card className={cn('w-full bg-white/95 backdrop-blur-md border-purple-100/80 shadow-2xl rounded-3xl', cardClassName)}>
      <CardHeader className="text-center pb-6 pt-8 px-6 sm:px-8">
        <div className="w-14 h-14 rounded-2xl bg-[#f3f0ff] flex items-center justify-center text-[#04164a] mx-auto mb-4">
          {config.icon}
        </div>
        <CardTitle className="font-heading text-2xl" style={{ color: BRAND_COLOR }}>
          {config.title}
        </CardTitle>
        <p className="text-sm text-slate-600 font-body mt-1">{config.subtitle}</p>
      </CardHeader>
      <CardContent className="space-y-6 px-6 sm:px-8 pb-8">
        {apiError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-body">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {step === 'phone' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendOtp(phone);
            }}
            className="space-y-5"
          >
            <div className="space-y-1.5">
              <label className="font-body text-xs font-semibold text-[#04164a]">
                {config.phoneLabel}
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={config.phonePlaceholder ?? '08012345678 or +234...'}
                  className="pl-10 h-11 border-slate-200 font-body focus:ring-[#04164a]/20 rounded-xl"
                  autoComplete="tel"
                  disabled={isSubmitting}
                />
              </div>
              {phoneError && (
                <p className="font-body text-xs text-rose-600 pt-1">{phoneError}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !phone}
              className="w-full bg-[#04164a] hover:bg-[#04164a]/90 text-white font-heading h-11 rounded-xl flex items-center justify-center gap-2 transition-all duration-200"
            >
              {isSubmitting ? 'Sending Code...' : 'Send Verification Code'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="space-y-2">
              <p className="font-body text-xs text-slate-500 text-center">
                We sent a 6-digit code to <strong className="text-slate-800">{phone}</strong>
              </p>
              <div className="flex gap-2 justify-between py-2">
                {otp.map((digit, idx) => (
                  <Input
                    key={idx}
                    id={`${inputPrefix}-input-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    className="w-11 h-12 text-center font-heading text-lg font-bold border-slate-200 focus:border-[#04164a] focus:ring-1 focus:ring-[#04164a] rounded-xl"
                    autoComplete="one-time-code"
                    inputMode="numeric"
                  />
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || otp.join('').length < 6}
              className="w-full bg-[#04164a] hover:bg-[#04164a]/90 text-white font-heading h-11 rounded-xl flex items-center justify-center gap-2 transition-all duration-200"
            >
              {isSubmitting ? 'Verifying...' : config.verifyButtonLabel ?? 'Verify & Sign In'}
              <CheckCircle2 className="w-4 h-4" />
            </Button>

            <div className="flex items-center justify-between font-body text-xs pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="text-slate-500 hover:text-[#04164a] underline"
              >
                Change Phone
              </button>

              <button
                type="button"
                disabled={resendTimer > 0}
                onClick={() => handleSendOtp(phone)}
                className="text-[#04164a] font-semibold disabled:text-slate-400 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
              </button>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer pt-1">
              <Checkbox
                id="remember-device"
                checked={rememberDevice}
                onCheckedChange={(checked) => setRememberDevice(checked === true)}
                className="border-slate-300"
              />
              <span className="font-body text-xs text-slate-600 flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-slate-400" />
                Remember this device for 30 days
              </span>
            </label>
          </form>
        )}

        {children}
      </CardContent>
    </Card>
  );
}
