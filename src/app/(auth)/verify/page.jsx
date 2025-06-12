'use client';
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/component/Logo";

export default function VerifyPage() {
    const searchParams = useSearchParams();
    const user_name = searchParams.get('user_name');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [timer, setTimer] = useState(120);  // تایمر 120 ثانیه
    const [canResend, setCanResend] = useState(false);  // برای فعال کردن دکمه ارسال مجدد کد
    const router = useRouter();

    // تایمر 120 ثانیه
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prevTime) => prevTime - 1);
            }, 1000);

            return () => clearInterval(interval);  // تمیز کردن تایمر وقتی کامپوننت unmount میشه
        } else {
            setCanResend(true);  // وقتی تایمر تموم میشه، دکمه ارسال مجدد فعال میشه
        }
    }, [timer]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (code.length !== 4) {
            setError("کد فعالسازی ۴ رقمی است");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_name, encode: code })
            });

            const data = await res.json();
            if (res.ok) {
                alert("✅ حساب با موفقیت فعال شد");
                router.push("/login");
            } else {
                setError(data?.msg || "خطا در تایید");
            }
        } catch (err) {
            setError("مشکل در اتصال به سرور");
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        // اینجا کد برای ارسال دوباره باید قرار بگیره
        setTimer(120); // تایمر رو دوباره از نو شروع می‌کنیم
        setCanResend(false);  // دکمه ارسال مجدد را غیرفعال می‌کنیم

        // ارسال درخواست برای کد جدید
        try {
            const res = await fetch('/api/resend-code', {  // فرضاً این endpoint برای ارسال دوباره کد هست
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_name }),
            });

            if (res.ok) {
                alert("کد جدید ارسال شد.");
            } else {
                setError("خطا در ارسال کد جدید");
            }
        } catch (err) {
            setError("مشکل در ارسال کد جدید");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto font-[Iransans]">
            <Logo />
            <h2 className="text-[20px] font-semibold mb-2">تایید شماره موبایل</h2>
            <p className="text-[15px] font-light">کد فعالسازی ارسال شده را وارد کنید.</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6 w-full">
                <input type="text" placeholder="کد فعالسازی" value={code} onChange={e => setCode(e.target.value)} className="w-full py-3 px-2 bg-[#454545] rounded-[8px]" />
                <button disabled={loading} type="submit" className="w-full py-3 bg-[#FFEB3B] hover:bg-[#C7B40B] text-black font-semibold rounded-[8px] mt-5">
                    {loading ? 'در حال تایید...' : 'تایید'}
                </button>
                {error && <div className="text-red-500 text-sm">{error}</div>}
            </form>

            <div className="mt-4 text-sm">
                <span className="text-gray-500">زمان باقی‌مانده: {timer} ثانیه</span>
            </div>

            {canResend && (
                <button
                    onClick={handleResendCode}
                    className="w-full py-3 bg-[#FFEB3B] hover:bg-[#C7B40B] text-black font-semibold rounded-[8px] mt-5"
                >
                    ارسال دوباره کد
                </button>
            )}
        </div>
    );
}
