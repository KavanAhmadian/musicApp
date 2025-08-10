'use client';
import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Icon } from "@iconify/react";

const PurchasePoints = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [targetTime, setTargetTime] = useState(0);
    const router = useRouter();

    const calculateTimeLeft = useCallback(() => {
        const now = Math.floor(Date.now() / 1000);
        const difference = targetTime - now;

        if (difference <= 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }

        const days = Math.floor(difference / (60 * 60 * 24));
        const hours = Math.floor((difference % (60 * 60 * 24)) / (60 * 60));
        const minutes = Math.floor((difference % (60 * 60)) / 60);
        const seconds = Math.floor(difference % 60);

        return { days, hours, minutes, seconds };
    }, [targetTime]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/purchasePoints');

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `Request failed with status ${response.status}`);
                }

                const responseText = await response.text();
                if (!responseText.trim()) {
                    throw new Error('Empty response from API');
                }

                const result = JSON.parse(responseText);
                if (!result || Object.keys(result).length === 0) {
                    throw new Error('No data received');
                }

                setData(result);

                if (result.time_takhfif && result.time_takhfif > 0) {
                    const now = Math.floor(Date.now() / 1000);
                    setTargetTime(now + result.time_takhfif);
                }

                setError(null);
            } catch (err) {
                console.error('Fetch error:', err);
                setError(err.message || 'خطا در دریافت اطلاعات');
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (!targetTime) return;

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [targetTime, calculateTimeLeft]);

    if (loading) return (
        <div className="min-h-screen bg-neutral-800 py-8 px-4">
            <div className="max-w-4xl mx-auto bg-neutral-700 rounded-xl shadow-md overflow-hidden">
                <div className="animate-pulse">
                    <div className="h-48 w-full bg-neutral-500"></div>
                    <div className="p-6 space-y-4">
                        <div className="h-8 bg-neutral-500 rounded w-3/4"></div>
                        <div className="space-y-2">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-4 bg-neutral-500 rounded"></div>
                            ))}
                        </div>
                        <div className="grid md:grid-cols-2 gap-6 mt-8">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="border rounded-lg p-6 space-y-3">
                                    <div className="h-6 bg-neutral-500 rounded w-1/2"></div>
                                    <div className="h-4 bg-neutral-500 rounded w-1/4"></div>
                                    <div className="h-10 bg-neutral-500 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-4">
            <div className="max-w-md bg-white p-6 rounded-lg shadow-md text-center">
                <h2 className="text-xl font-bold text-red-600 mb-4">خطا در دریافت اطلاعات</h2>
                <p className="text-gray-700 mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    تلاش مجدد
                </button>
            </div>
        </div>
    );

    if (!data) return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-4">
            <div className="max-w-md bg-white p-6 rounded-lg shadow-md text-center">
                <h2 className="text-xl font-bold text-gray-700 mb-4">داده‌ای یافت نشد</h2>
                <p className="text-gray-600 mb-4">متأسفانه اطلاعاتی برای نمایش وجود ندارد.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    تلاش مجدد
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-black py-8 px-4">
            <div className="max-w-4xl mx-auto bg-black rounded-xl shadow-md overflow-hidden">
                <div className="relative h-36 w-full">
                    <Image
                        src={data.pic_url.replace('http://', 'https://')}
                        alt="پیشنهاد ویژه"
                        layout="fill"
                        objectFit="fill"
                        unoptimized
                    />
                    {data.takfif === "T" && (
                        <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                            تخفیف ویژه
                        </div>
                    )}
                </div>

                <div className="p-6">
                    <h1 className="text-[18px] font-bold text-gray-200 mb-4">{data.des1}</h1>
                    <div className="prose prose-sm text-gray-100 mb-6 whitespace-pre-line">
                        {data.des2}
                    </div>

                    {data.time_takhfif && data.time_takhfif > 0 && (
                        <div className="w-full mt-1 text-xs flex items-center justify-center gap-3">
                            <div className="text-[16px] border rounded-xs py-3 px-3 flex items-center justify-center gap-1 flex-col">
                                <span className="font-bold">{timeLeft.days}</span>
                                <span>روز</span>
                            </div>
                            <div className="text-[16px] border rounded-xs py-3 px-3 flex items-center justify-center gap-1 flex-col">
                                <span className="font-bold">{timeLeft.hours}</span>
                                <span>ساعت</span>
                            </div>
                            <div className="text-[16px] border rounded-xs py-3 px-3 flex items-center justify-center gap-1 flex-col">
                                <span className="font-bold">{timeLeft.minutes}</span>
                                <span>دقیقه</span>
                            </div>
                            <div className="text-[16px] border rounded-xs py-3 px-3 flex items-center justify-center gap-1 flex-col">
                                <span className="font-bold">{timeLeft.seconds}</span>
                                <span>ثانیه</span>
                            </div>
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6 mt-8">
                        {[data.emt1, data.emt2, data.emt3, data.emt4].map((emt, index) => {
                            if (!emt) return null;

                            const userInfo = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userInfo')) : null;
                            const phoneNumber = userInfo?.phone || '';
                            const postId = index + 1;
                            const urlWithParams = `${data.url}request.php?id=${encodeURIComponent(phoneNumber)}&post=${postId}`;

                            return (
                                <div
                                    key={index}
                                    onClick={() => router.push(urlWithParams)}
                                    className={`rounded-[12px] cursor-pointer flex items-center justify-between ${
                                        data[`p_emt${index+1}`] ? 'bg-amber-500' : 'bg-neutral-800'
                                    } hover:shadow-lg transition-shadow`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="bg-gradient-to-b from-amber-400 to-amber-800 p-2 rounded-[12px] inline-block">
                                            <Icon
                                                icon="solar:medal-star-square-outline"
                                                className="text-white"
                                                style={{ width: "56px", height: "56px" }}
                                            />
                                        </div>
                                        <h3 className="text-xl">{emt}</h3>
                                    </div>

                                    <div className="mx-2">
                                        {data[`p_emt${index+1}`] && (
                                            <p className="text-white text-[14px] line-through">
                                                {data[`p_emt${index+1}`]}
                                            </p>
                                        )}
                                        <p className="text-[16px] text-white">
                                            {data[`pm_rmt${index+1}`]}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-8 text-center text-sm text-gray-500">
                        <p>امتیازهای خریداری شده بلافاصله به حساب شما اضافه می‌شوند</p>
                        <p className="mt-1">در صورت بروز هرگونه مشکل با پشتیبانی تماس بگیرید</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PurchasePoints;