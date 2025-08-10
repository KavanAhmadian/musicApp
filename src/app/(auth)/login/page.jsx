'use client';
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/component/Logo";
import Link from "next/link";

export default function LoginPage() {
    const [phone, setPhone] = useState('');
    const [pass, setPass] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_name: phone,
                    pass: pass,
                }),
                credentials: 'include'
            });

            const result = await res.json();

            if (res.ok) {
                localStorage.setItem('userInfo', JSON.stringify(result.user));

                await new Promise(resolve => setTimeout(resolve, 100));

                router.push('/my-beatbox');
                router.refresh();
            } else {
                setError(result?.msg || "ورود ناموفق");
            }
        } catch (err) {
            setError("خطا در ارتباط با سرور");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto font-[Iransans]">
            <Logo />
            <h2 className="text-[20px] font-semibold mb-2">به بیت باکس خوش آمدید.</h2>
            <p className="text-[15px] font-light">لطفا شماره موبایل و رمزعبور را وارد کنید.</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center justify-center mt-6 w-full">
                <input type="text" placeholder="شماره موبایل" value={phone} onChange={e => setPhone(e.target.value)} className="w-full py-3 px-2 bg-[#454545] rounded-[8px]" />
                <input type="password" placeholder="رمز عبور" value={pass} onChange={e => setPass(e.target.value)} className="w-full py-3 px-2 bg-[#454545] rounded-[8px]" />

                <button type="submit" disabled={loading} className="w-full py-3 bg-[#FFEB3B] hover:bg-[#C7B40B] duration-150 text-black font-semibold rounded-[8px] mt-5">
                    {loading ? 'در حال ورود...' : 'ورود'}
                </button>

                {error && <div className="text-red-500 text-sm">{error}</div>}
            </form>
            <Link className="text-[#a5a5a5] mt-3" href="/forgot"> فراموشی رمزعبور</Link>
            <div className="flex gap-2 items-center justify-center mt-6 w-full">
                <span className="text-[#a5a5a5]">حساب کاربری ندارید؟</span>
                <Link className="text-[#FFEB3B]" href="/register">ثبت نام</Link>
            </div>
        </div>
    );
}
