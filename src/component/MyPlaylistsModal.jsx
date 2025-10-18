// components/MyPlaylistsModal.jsx (یا داخل همون صفحه‌تون)
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';

function collageThumbs(thumbsField) {
    return String(thumbsField || '')
        .split('*')
        .map(s => s.trim())
        .filter(u => u && u !== '+')
        .slice(0, 4);
}

function getUserNameFromLocal() {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem('userInfo');
        if (!raw || raw === 'undefined') return null;
        const obj = JSON.parse(raw);
        return obj?.user_name || obj?.phone || obj?.mobile || obj?.username || null;
    } catch {
        return null;
    }
}

export default function MyPlaylistsModal({ open, onClose }) {
    const [loading, setLoading] = useState(false);
    const [playlists, setPlaylists] = useState([]);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');

    const userName = useMemo(() => getUserNameFromLocal(), [open]);

    const fetchPlaylists = async () => {
        if (!userName) {
            setError('برای مشاهده پلی‌لیست‌ها ابتدا وارد شوید.');
            setPlaylists([]);
            return;
        }
        setLoading(true);
        setError('');
        setNotice('');
        try {
            const res = await fetch('/api/customPlayList', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                cache: 'no-store',
                body: JSON.stringify({ op: 'list', user_name: userName, pageno: 1 }),
            });
            const raw = await res.text();
            let data;
            try {
                data = JSON.parse(raw);
            } catch {
                console.error('non-JSON response snippet:', raw.slice(0, 300));
                throw new Error('پاسخ سرور معتبر نبود (JSON نبود).');
            }

            if (!res.ok || data?.success === false) {
                console.error('server error:', data);
                throw new Error(data?.error || data?.message || 'خطا در دریافت لیست');
            }

            const rows =
                (Array.isArray(data?.list) && data.list) ||
                (Array.isArray(data?.all) && data.all) ||
                [];

            setPlaylists(rows);
            if (data?.msg_cr_playlist) setNotice(String(data.msg_cr_playlist));
        } catch (e) {
            setError('خطا در دریافت پلی‌لیست‌ها');
            setPlaylists([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (open) fetchPlaylists(); }, [open]); // eslint-disable-line

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[10050]">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="absolute left-1/2 top-1/2 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 bg-[#1c1c1c] text-white rounded-2xl shadow-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold">پلی‌لیست‌های من</h3>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchPlaylists}
                            className="text-xs px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20"
                        >
                            بروزرسانی
                        </button>
                        <button onClick={onClose} className="text-[#FFEB3B]">
                            <Icon icon="solar:close-circle-outline" className="text-2xl" />
                        </button>
                    </div>
                </div>

                {!userName && <div className="text-sm text-amber-300 mb-3">برای مشاهده پلی‌لیست‌ها ابتدا وارد شوید.</div>}
                {notice && <div className="text-xs text-amber-300 mb-3">{notice}</div>}
                {error && <div className="text-red-400 text-sm mb-3">{error}</div>}

                <div className="max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="py-10 text-center text-gray-300">در حال بارگذاری…</div>
                    ) : !playlists.length ? (
                        <div className="py-10 text-center text-gray-400">پلی‌لیستی یافت نشد.</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {playlists.map((pl) => {
                                const thumbs =
                                    collageThumbs(pl?.thumbnail_url) ||
                                    collageThumbs(pl?.thumbnail_url2) ||
                                    collageThumbs(pl?.thumbnail_url3);
                                return (
                                    <div key={pl.id} className="rounded-xl bg-[#232323] hover:bg-[#2b2b2b] transition p-3 flex gap-3 items-center">
                                        <div className="grid grid-cols-2 grid-rows-2 w-20 h-20 rounded overflow-hidden bg-neutral-700 shrink-0">
                                            {Array.from({ length: 4 }).map((_, i) =>
                                                thumbs[i] ? (
                                                    <img key={i} src={thumbs[i]} alt="" className="object-cover w-full h-full" />
                                                ) : (
                                                    <div key={i} className="bg-neutral-800" />
                                                )
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-semibold truncate">{pl.title || 'بی‌نام'}</div>
                                            {pl?.count ? <div className="text-xs text-gray-400">{pl.count}</div> : null}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
