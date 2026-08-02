'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ShieldCheck, Phone, Lock, ArrowRight, RotateCcw, CheckCircle2, AlertCircle, Mail, User } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { submitOTP, verifyOTP } from '@/lib/api-client';

const BRAND_COLOR = '#04164a';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f3f0ff] flex items-center justify-center py-12 px-4">
          <p className="text-slate-500 font-body">Loading sign in...</p>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const pendingAction = searchParams.get('action') || 'access your account';

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [phoneError, setPhoneError] = useState('');
  const [apiError, setApiError] = useState('');

  useGSAP(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.login-anim', 
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

  const sendOtp = async (phoneNumber: string) => {
    setApiError('');
    if (!validateNigerianPhone(phoneNumber)) {
      setPhoneError('Please enter a valid Nigerian phone number (e.g., 08012345678)');
      return;
    }
    setPhoneError('');
    setIsSubmitting(true);

    try {
      const response = await submitOTP(phoneNumber, 'login');
      const responseData = response.data as { dev_code?: string } | undefined;
      if (responseData?.dev_code) {
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

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    sendOtp(phone);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

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
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      setIsSubmitting(false);
      router.push(callbackUrl);
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
        {/* Brand Header */}
        <div className="text-center mb-10 login-anim opacity-0">
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
            Welcome back
          </h1>
          <p className="text-slate-600 font-body">
            Sign in to {pendingAction}
          </p>
        </div>

        {/* Login Card */}
        <Card className="bg-white/90 backdrop-blur-sm border-purple-100 shadow-xl login-anim opacity-0">
          <CardHeader className="text-center pb-4">
            <div className="w-14 h-14 rounded-2xl bg-[#f3f0ff] flex items-center justify-center text-[#04164a] mx-auto mb-4">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <CardTitle className="font-heading text-2xl" style={{ color: BRAND_COLOR }}>
              Quick Sign In
            </CardTitle>
            <p className="text-sm text-slate-600 font-body mt-1">
              We'll send a 6-digit code to your phone
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {apiError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-body">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            {/* STEP 1: Phone Number Input */}
            {step === 'phone' && (
              <form onSubmit={handleSendOtp} className="space-y-5">
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

            {/* STEP 2: 6-Digit OTP Input */}
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
                        id={`otp-input-${idx}`}
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
                    onClick={() => { sendOtp(phone); }}
                    className="text-[#04164a] font-semibold disabled:text-slate-400 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                  </button>
                </div>
              </form>
            )}

            <div className="border-t border-purple-100 pt-4 font-body text-[11px] text-slate-500 flex items-center gap-2 justify-center">
              <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>NDPR Compliant. Your information is protected under Nigerian data privacy laws.</span>
            </div>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="text-center mt-6 space-y-2 login-anim opacity-0">
          <p className="text-sm text-slate-500 font-body">
            Don't have an account?{' '}
            <Link href="/landlord/register" className="text-[#04164a] font-semibold hover:underline font-body">
              Register as Landlord
            </Link>
          </p>
          <p className="text-xs text-slate-400 font-body">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-[#04164a]">Terms</Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline hover:text-[#04164a]">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}