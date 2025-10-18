'use client';

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { Icon } from "@iconify/react";
import { useRouter } from 'next/navigation';
import ProtectedRoute from "@/component/ProtectedRoute";


const PlaylistModal = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [playlists, setPlaylists] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const router = useRouter(); // اضافه کردن router

    useEffect(() => {
        if (isOpen) {
            fetchPlaylists();
        }
    }, [isOpen, currentPage]);

    const fetchPlaylists = async () => {
        setLoading(true);
        setError(null);

        try {

            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const userName = userInfo.phone || '';

            const response = await fetch('/api/CPlayList', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    key: 'sdifu4530dsf98sf0sdf',
                    action: 'show_playlist_user',
                    user_name: userName,
                    pageno: currentPage.toString()
                })
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();

            if (data.state_all === "T") {
                setPlaylists(data.list || []);
                setTotalPages(Math.ceil(parseInt(data.tx_size || "1") / 10));
            } else {
                setError("خطا در دریافت پلی‌لیست‌ها");
            }
        } catch (e) {
            setError('خطا در دریافت پلی‌لیست‌ها');
            console.error('Fetch error:', e);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };


    const handlePlaylistClick = (playlistId, playlistTitle) => {
        onClose();

        router.push(`/listsongs?list_id=${playlistId}&title=${encodeURIComponent(playlistTitle)}`);
  
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">

            <div className="flex justify-between items-center p-4 bg-[#1a1a1a] border-b border-gray-800">
                <h2 className="text-white text-xl font-bold">پلی لیست های من</h2>
                <button
                    onClick={onClose}
                    className="text-white p-2 rounded-full hover:bg-[#3a3a3a] transition-colors"
                >
                    <Icon icon="solar:close-circle-outline" className="text-2xl" />
                </button>
            </div>


            <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-[#0f0f0f] to-[#2a2a2a]">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                            <span className="text-white text-lg">در حال بارگذاری...</span>
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="text-center py-8 text-red-400">
                            <Icon icon="solar:danger-triangle-linear" className="text-4xl mx-auto mb-4" />
                            <p className="text-xl mb-4">{error}</p>
                            <button
                                onClick={fetchPlaylists}
                                className="mt-4 px-6 py-2 bg-[#3a3a3a] text-white rounded-md hover:bg-[#4a4a4a] text-lg"
                            >
                                تلاش مجدد
                            </button>
                        </div>
                    </div>
                ) : playlists.length === 0 ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="text-center py-8 text-gray-400">
                            <Icon icon="solar:playlist-linear" className="text-5xl mx-auto mb-4" />
                            <p className="text-xl">پلی لیستی یافت نشد</p>
                            <p className="mt-2 text-gray-500">می‌توانید پلی‌لیست جدیدی ایجاد کنید</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                            {playlists.map((playlist, index) => (
                                <div
                                    key={index}
                                    className="bg-[#3a3a3a] p-4 rounded-lg flex flex-col hover:bg-[#4a4a4a] transition-colors cursor-pointer"
                                    onClick={() => handlePlaylistClick(playlist.id, playlist.title)}
                                >
                                    <div className="relative w-full h-48 rounded-md overflow-hidden bg-gradient-to-br from-purple-500 to-blue-500 mb-3">
                                        {playlist.thumbnail_url && playlist.thumbnail_url.split('*+*+')[0] ? (
                                            <img
                                                src={playlist.thumbnail_url.split('*+*+')[0].split('*')[0]}
                                                alt={playlist.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Icon icon="solar:playlist-2-linear" className="text-5xl text-white" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                            <button className="p-3 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 backdrop-blur-sm">
                                                <Icon icon="solar:play-outline" className="text-3xl text-white" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="text-white font-medium text-lg mb-1 truncate">{playlist.title || "پلی لیست بدون نام"}</h3>
                                        <p className="text-gray-400 text-sm">{playlist.count || "0 آهنگ"}</p>
                                    </div>
                                </div>
                            ))}
                        </div>


                        {totalPages > 1 && (
                            <div className="flex justify-center mt-6 pb-8">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 bg-[#3a3a3a] text-white rounded disabled:opacity-50 hover:bg-[#4a4a4a]"
                                    >
                                        قبلی
                                    </button>

                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }

                                        if (pageNum > 0 && pageNum <= totalPages) {
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => handlePageChange(pageNum)}
                                                    className={`px-4 py-2 rounded ${
                                                        currentPage === pageNum
                                                            ? 'bg-blue-500 text-white'
                                                            : 'bg-[#3a3a3a] text-white hover:bg-[#4a4a4a]'
                                                    }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        }
                                        return null;
                                    })}

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 bg-[#3a3a3a] text-white rounded disabled:opacity-50 hover:bg-[#4a4a4a]"
                                    >
                                        بعدی
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>


            <div className="p-4 bg-[#1a1a1a] border-t border-gray-800 text-center text-sm text-gray-400">
                با ساخت هر پلی لیست جدید 20 امتیاز کسر خواهد شد
            </div>
        </div>
    );
};


export default function MyBeatBoxPage() {
    const [user, setUser] = useState({ name: '', phone: '', vote: 0 });
    const [mounted, setMounted] = useState(false);
    const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
    const router = useRouter();

    const handlePurchaseClick = () => {
        router.push('/purchase-points');
    };

    useEffect(() => {
        setMounted(true);
        try {
            const storedUser = localStorage.getItem('userInfo');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (e) {
            console.error("Failed to parse user info", e);
        }
    }, []);

    if (!mounted) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <span className="text-white">در حال بارگذاری...</span>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-black">
                <div className="w-full bg-gradient-to-b from-black to-[#4e4e4e] rounded-b-2xl py-8 flex flex-col items-center justify-center">
                    <span className="text-white text-[18px] mb-2">
                        {user.name || 'کاربر'} - {user.phone}
                    </span>
                    <span className="text-[#FFEB3B] text-[21px]">
                        تعداد امتیاز : {user.voite ?? 0}
                    </span>
                    <div className="flex items-center flex-wrap justify-center gap-8 mt-8 w-full">
                        <button className="cursor-pointer py-3 px-3 md:px-5 w-40 sm:w-50 md:w-80 bg-neutral-600 text-white rounded-lg">دریافت امتیاز رایگان</button>
                        <button onClick={handlePurchaseClick} className="cursor-pointer py-3 px-3 md:px-5 w-40 sm:w-50 md:w-80 bg-neutral-600 text-white rounded-lg">خرید امتیاز</button>
                    </div>
                </div>

                <div className="flex flex-col mb-[100px] items-center justify-center gap-2 mx-auto w-9/10 mt-8">
                    {[
                        { href: "#", icon: 'solar:music-notes-linear', label: 'پلی لیست من', bg: 'from-[#865922] to-[#DFA40C]', onClick: () => setPlaylistModalOpen(true) },
                        { href: "/", icon: 'solar:playlist-minimalistic-3-linear', label: 'پلی لیست های دنبال شده', bg: 'from-[#2E5D2C] to-[#81BC3E]' },
                        { href: "/", icon: 'solar:list-check-minimalistic-bold', label: 'آلبوم های دنبال شده', bg: 'from-[#04413A] to-[#099082]' },
                        { href: "/", icon: 'solar:music-note-4-linear', label: 'خوانندگان دنبال شده', bg: 'from-[#255476] to-[#048BCD]' },
                        { href: "/liked-songs", icon: 'solar:heart-linear', label: 'آهنگ های پسندیده', bg: 'from-[#66332B] to-[#EF564A]' },
                    ].map((item, idx) => (
                        <div
                            key={idx}
                            className="bg-[#454545] w-full flex gap-4 items-center justify-start cursor-pointer hover:bg-[#555555] transition-colors rounded-lg"
                            onClick={item.onClick || (() => {})}
                        >
                            <div className={`flex items-center justify-center w-16 h-16 bg-gradient-to-b ${item.bg} rounded-l-lg`}>
                                <Icon icon={item.icon} className="text-[30px]" />
                            </div>
                            {item.onClick ? (
                                <span className="py-4 text-white">{item.label}</span>
                            ) : (
                                <Link href={item.href} className="py-4 block w-full text-white">{item.label}</Link>
                            )}
                        </div>
                    ))}
                    <hr className="my-2 border-b-1 border-neutral-800 w-full" />
                    <div className="bg-[#454545] w-full flex gap-4 items-center justify-start rounded-lg">
                        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-b from-[#054139] to-[#1A857F] rounded-l-lg">
                            <Icon icon="solar:headphones-round-sound-outline" className="text-[30px]" />
                        </div>
                        <Link href="/" className="py-4 text-white">پشتیبانی/ درخواست آهنگ</Link>
                    </div>
                </div>


                <PlaylistModal
                    isOpen={playlistModalOpen}
                    onClose={() => setPlaylistModalOpen(false)}
                />
            </div>
        </ProtectedRoute>
    );
}