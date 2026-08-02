'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Phone, ArrowRight, RotateCcw, CheckCircle2, AlertCircle, UserCog } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { sendOtp, verifyAgentOtp } from '@/lib/api-client';

const BRAND_COLOR = '#04164a';

export default function AgentLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f3f0ff] flex items-center justify-center py-12 px-4">
          <p className="text-slate-500 font-body">Loading agent sign in...</p>
        </div>
      }
    >
      <AgentLoginContent />
    </Suspense>
  );
}

function AgentLoginContent() {
  const router = useRouter();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [phoneError, setPhoneError] = useState('');
  const [apiError, setApiError] = useState('');

  useGSAP(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.agent-login-anim',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'power2.out' }
      );
    });
    return () => ctx.revert();
  }, []);

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

  const sendAgentOtp = async (phoneNumber: string) => {
    setApiError('');
    if (!validateNigerianPhone(phoneNumber)) {
      setPhoneError('Please enter a valid Nigerian phone number (e.g., 08012345678)');
      return;
    }
    setPhoneError('');
    setIsSubmitting(true);

    try {
      const response = await sendOtp(phoneNumber, 'agent_login');
      const responseData = response.data as { dev_code?: string } | undefined;
      if (responseData?.dev_code) {
        console.log('DEV Agent OTP Code:', responseData.dev_code);
      }
      setIsSubmitting(false);
      setStep('otp');
      setResendTimer(60);
    } catch (error: any) {
      setIsSubmitting(false);
      setPhoneError(error.message || 'Failed to send OTP. Please try again.');
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    sendAgentOtp(phone);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`agent-otp-input-${index + 1}`);
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
      await verifyAgentOtp(phone, fullCode);
      setIsSubmitting(false);
      router.push('/dashboard/agent');
      router.refresh();
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
    <div className="min-h-screen bg-[#f3f0ff] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10 agent-login-anim opacity-0">
          <Link href="/" className="flex items-center justify-center gap-3 mb-6" aria-label="Primekey Homes home">
            <Image
              src="/assets/logo.svg"
              alt="Primekey Logo Icon"
              width={214}
              height={111}
              className="w-12 h-auto"
              priority
            />
            <span className="text-3xl font-bold tracking-tight font-heading" style={{ color: BRAND_COLOR }}>
              Primekey
            </span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading mb-2" style={{ color: BRAND_COLOR }}>
            Agent Sign In
          </h1>
          <p className="text-slate-600 font-body">Access the Primekey agent dashboard</p>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm border-purple-100 shadow-xl agent-login-anim opacity-0">
          <CardHeader className="text-center pb-4">
            <div className="w-14 h-14 rounded-2xl bg-[#f3f0ff] flex items-center justify-center text-[#04164a] mx-auto mb-4">
              <UserCog className="w-7 h-7" />
            </div>
            <CardTitle className="font-heading text-2xl" style={{ color: BRAND_COLOR }}>
              Team Access
            </CardTitle>
            <p className="text-sm text-slate-600 font-body mt-1">
              We'll send a 6-digit code to your registered phone
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {apiError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-body">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            {step === 'phone' && (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="font-body text-xs font-semibold text-[#04164a]">
                    Registered Agent Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08012345678 or +234..."
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
                        id={`agent-otp-input-${idx}`}
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
                  {isSubmitting ? 'Verifying...' : 'Verify & Sign In'}
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
                    onClick={() => sendAgentOtp(phone)}
                    className="text-[#04164a] font-semibold disabled:text-slate-400 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                  </button>
                </div>
              </form>
            )}

            <div className="border-t border-purple-100 pt-4 text-center">
              <Link href="/dashboard/agent" className="text-xs text-slate-500 hover:text-[#04164a] font-body">
                Already signed in? Go to dashboard
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
