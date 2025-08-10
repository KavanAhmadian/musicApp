'use client';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Icon } from "@iconify/react";
import { useRouter } from 'next/navigation';

function VideoPlayerPage() {
    const router = useRouter();
    const id = useSearchParams().get('video_id');
    const [videoUrl, setVideoUrl] = useState('');
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [thumbnail, setThumbnail] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [userPoints, setUserPoints] = useState(0);
    const [requiredPoints, setRequiredPoints] = useState(2);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const checkLoginStatus = () => {
            if (typeof window !== 'undefined') {
                const userInfo = localStorage.getItem('userInfo');
                if (userInfo) {
                    try {
                        const parsedUser = JSON.parse(userInfo);
                        setUser(parsedUser);
                        setIsLoggedIn(true);
                        setUserPoints(parsedUser.vote || 0);
                    } catch (e) {
                        console.error("Error parsing user info", e);
                    }
                } else {
                    setIsLoggedIn(false);
                }
            }
        };

        const fetchVideo = async () => {
            try {
                const res = await fetch(`/api/videoSingle?video_id=${id}`);
                const data = await res.json();

                if (data.error) {
                    setError(data.error);
                } else {
                    setVideoUrl(data?.url || '');
                    setTitle(data?.all?.[0]?.title || 'بدون عنوان');
                    setArtist(data?.all?.[0]?.fard_name || 'ناشناس');
                    setThumbnail(data?.all?.[0]?.fard_pic || '');
                }
            } catch (error) {
                console.error('خطا در دریافت اطلاعات ویدیو', error);
                setError('خطا در دریافت اطلاعات ویدیو');
            } finally {
                setLoading(false);
            }
        };

        checkLoginStatus();
        fetchVideo();
    }, [id]);

    const handleDownloadClick = () => {
        setShowPopup(true);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
    };

    const handlePurchasePoints = () => {
        router.push('/purchase-points');
        setShowPopup(false);
    };

    const handleDownload = () => {
        if (userPoints >= requiredPoints) {
            // Update points in localStorage
            const updatedUser = { ...user, vote: userPoints - requiredPoints };
            localStorage.setItem('userInfo', JSON.stringify(updatedUser));
            setUser(updatedUser);
            setUserPoints(updatedUser.vote);

            // Start download
            window.location.href = videoUrl;
            setShowPopup(false);
        }
    };

    const handleLogin = () => {
        router.push('/login');
    };

    if (loading) return <p>در حال بارگذاری...</p>;
    if (error) return <p>{error}</p>;
    if (!videoUrl) return <p>ویدیو پیدا نشد.</p>;

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-neutral-900 rounded-xl shadow-lg">
            <div className="flex items-center justify-between w-full mb-6">
                <div className="flex items-center">
                    <img
                        src={thumbnail.replace('http://', 'https://')}
                        alt={artist}
                        className="w-24 h-24 rounded-full shadow-xl mr-4"
                    />
                    <div className={`mx-2`}>
                        <h2 className="text-xl font-semibold text-white">{artist}</h2>
                        <h3 className="text-lg text-white">{title}</h3>
                    </div>
                </div>
                <Icon
                    icon="solar:arrow-down-linear"
                    className="text-[#7F7F7F] cursor-pointer"
                    style={{ width: "32px", height: "32px" }}
                    onClick={handleDownloadClick}
                />
            </div>

            <video controls className="w-full max-w-2xl rounded-xl shadow-lg">
                <source src={videoUrl.replace('http://', 'https://')} type="video/mp4" />
                مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
            </video>

            {/* Popup Modal */}
            {showPopup && (
                <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-neutral-800 p-8 rounded-xl shadow-lg max-w-lg w-full">
                        {isLoggedIn ? (
                            <>
                                <h2 className="text-xl text-[18px] text-center mb-4">آیا می‌خواهید این ویدیو را دانلود کنید؟</h2>

                                <div className="mb-4">
                                    <p className={`text-center text-neutral-400 mb-2` }> {title} - {artist} </p>
                                    <div className="bg-neutral-700 py-2 px-4 rounded-xl text-neutral-400 mb-2 flex items-center justify-between" >
                                        <span>  امتیاز مورد نیاز: {requiredPoints}</span>
                                        <span> امتیاز باقی‌مانده شما: {userPoints}</span>
                                    </div>

                                </div>
                                <div className="flex justify-between">
                                    <button
                                        className="bg-neutral-950 text-white px-4 py-2 rounded-lg"
                                        onClick={handleClosePopup}
                                    >
                                        انصراف
                                    </button>
                                    <button
                                        className={`${userPoints >= requiredPoints ? 'bg-yellow-500' : 'bg-yellow-500'} text-black px-4 py-2 rounded-lg`}
                                        onClick={userPoints >= requiredPoints ? handleDownload : handlePurchasePoints}
                                    >
                                        {userPoints >= requiredPoints ? 'دانلود' : 'خرید امتیاز'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="mb-5 text-center text-[14px]">
                                    <p className="mb-2">برای دانلود این ویدیو باید وارد حساب کاربری خود شوید.</p>
                                    <p className="mb-2">اگر حساب کاربری ندارید، می‌توانید ثبت نام کنید.</p>
                                </div>
                                <div className="flex justify-between">
                                    <button
                                        className="bg-neutral-950 text-white px-4 py-2 rounded-lg"
                                        onClick={handleClosePopup}
                                    >
                                        انصراف
                                    </button>
                                    <button
                                        className="bg-neutral-700 text-white px-4 py-2 rounded-lg"
                                        onClick={handleLogin}
                                    >
                                        ورود به حساب کاربری
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default VideoPlayerPage;