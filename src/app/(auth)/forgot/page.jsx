'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from "@/component/Logo";
import Link from "next/link";
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [showMessage, setShowMessage] = useState(false);
    const router = useRouter();

    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');
    const [newPass, setNewPass] = useState('');

    const API_URL = '/api/forgot';

    const formVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4 } },
        exit: { opacity: 0, y: -30, scale: 0.95, transition: { duration: 0.4 } },
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        const form = new FormData();

        try {
            if (step === 1) {
                form.append('step', '1');
                form.append('user_name', phone);
            } else if (step === 2) {
                form.append('step', '2');
                form.append('user_name', phone);
                form.append('code_forget', code);
            } else if (step === 3) {
                form.append('step', '3');
                form.append('user_name', phone);
                form.append('new_pass', newPass);
            }

            const res = await fetch(API_URL, {
                method: 'POST',
                body: form,
            });

            const text = await res.text();
            const result = text.trim();

            console.log('Server response:', result);

            if (result === 'T') {
                if (step === 1) {
                    setMessage('کد تایید به شماره شما ارسال شد.');
                    setStep(2);
                } else if (step === 2) {
                    setMessage('کد تایید صحیح است. لطفا رمز جدید وارد کنید.');
                    setStep(3);
                } else if (step === 3) {
                    setMessage('رمز شما با موفقیت تغییر کرد.');
                    setShowMessage(true);
                    setTimeout(() => {
                        setShowMessage(false);
                        router.push('/login');
                    }, 1500);
                }
            } else {
                setError(result);
            }
        } catch (err) {
            console.error(err);
            setError('خطا در ارتباط با سرور');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto font-[Iransans]">
            <Logo />
            <h2 className="text-[20px] font-semibold mb-2">به بیت باکس خوش آمدید.</h2>
            <p className="text-[15px] font-light">فراموشی رمز ورود</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center justify-center mt-6 w-full overflow-hidden">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.input
                            key="step1"
                            type="text"
                            placeholder="شماره موبایل"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            variants={formVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="w-full py-3 px-2 bg-[#454545] rounded-[8px]"
                            required
                        />
                    )}

                    {step === 2 && (
                        <motion.input
                            key="step2"
                            type="text"
                            placeholder="کد تایید ۴ رقمی"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            variants={formVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="w-full py-3 px-2 bg-[#454545] rounded-[8px]"
                            required
                        />
                    )}

                    {step === 3 && (
                        <motion.input
                            key="step3"
                            type="password"
                            placeholder="رمز جدید"
                            value={newPass}
                            onChange={(e) => setNewPass(e.target.value)}
                            variants={formVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="w-full py-3 px-2 bg-[#454545] rounded-[8px]"
                            required
                        />
                    )}
                </AnimatePresence>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#FFEB3B] hover:bg-[#C7B40B] duration-150 text-black font-semibold rounded-[8px] mt-5"
                >
                    {loading
                        ? 'لطفا صبر کنید...'
                        : step === 1
                            ? 'ارسال کد تایید'
                            : step === 2
                                ? 'تایید کد'
                                : 'ثبت رمز جدید'}
                </button>

                {message && (
                    <p
                        className={`
              transition-all duration-500 ease-in-out
              ${showMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
              bg-green-600 text-white py-2 px-4 rounded mt-4 shadow-lg
            `}
                    >
                        {message}
                    </p>
                )}

                {error && <p className="text-red-400">{error}</p>}
            </form>

            <div className="flex gap-2 items-center justify-center mt-6 w-full">
                <Link className="text-[#a5a5a5]" href="/">بازگشت به صفحه اصلی</Link>
            </div>
        </div>
    );
}
