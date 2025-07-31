'use client';
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/component/Logo";
import Link from "next/link";

export default function RegisterPage() {
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [pass, setPass] = useState('');
    const [refedby, setRefedby] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!phone.match(/^09\d{9}$/)) {
            setError("شماره موبایل نامعتبر است");
            return;
        }
        if (name.length < 3) {
            setError("نام را وارد کنید");
            return;
        }
        if (pass.length < 6) {
            setError("رمز عبور کوتاه است");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const queryParams = new URLSearchParams({
                user_name: phone,
                pass: pass,
                name: name,
                refed_by: refedby
            }).toString();

            // تغییر به متد GET
            const res = await fetch(`/api/register?${queryParams}`, {
                method: 'GET',  // تغییر متد به GET
            });

            const data = await res.json();
            if (res.ok) {
                router.push(`/verify?user_name=${phone}`);
            } else {
                setError(data?.msg || "خطا در ثبت نام");
            }
        } catch (err) {
            setError("مشکل در اتصال به سرور");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto font-[Iransans]">
            <Logo priority={true} />
            <h2 className="text-[20px] font-semibold mb-2">به بیت باکس خوش آمدید.</h2>
            <p className="text-[15px] font-light">برای ثبت نام فیلدهای زیر را تکمیل نمایید</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6 w-full">
                <input type="text" placeholder="شماره موبایل" value={phone} onChange={e => setPhone(e.target.value)} className="w-full py-3 px-2 bg-[#454545] rounded-[8px]" />
                <input type="text" placeholder="نام" value={name} onChange={e => setName(e.target.value)} className="w-full py-3 px-2 bg-[#454545] rounded-[8px]" />
                <input type="password" placeholder="رمز عبور" value={pass} onChange={e => setPass(e.target.value)} className="w-full py-3 px-2 bg-[#454545] rounded-[8px]" />
                <input type="text" placeholder="کد معرف (اختیاری)" value={refedby} onChange={e => setRefedby(e.target.value)} className="w-full py-3 px-2 bg-[#454545] rounded-[8px]" />

                <button disabled={loading} type="submit" className="w-full py-3 bg-[#FFEB3B] hover:bg-[#C7B40B] duration-150 text-black font-semibold rounded-[8px] mt-5">
                    {loading ? 'در حال ثبت‌نام...' : 'ایجاد حساب'}
                </button>

                {error && <div className="text-red-500 text-sm">{error}</div>}
            </form>

            <div className="flex gap-2 justify-center mt-6">
                <span className="text-[#a5a5a5]">حساب کاربری دارید؟</span>
                <Link className="text-[#FFEB3B]" href={`/login`}>ورود</Link>
            </div>
        </div>
    );
}
