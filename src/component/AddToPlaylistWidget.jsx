'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';

function collageThumbs(thumbsField) {

    return String(thumbsField || '')
        .split('*')
        .filter(Boolean)
        .slice(0, 4);
}

function defaultGetUserName() {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem('userInfo');
        if (!raw || raw === 'undefined') return null;
        const obj = JSON.parse(raw);
        return obj?.user_name || obj?.mobile || obj?.phone || obj?.username || null;
    } catch {
        return null;
    }
}

async function getJsonSafe(res) {
    const ct = res.headers.get('content-type') || '';
    const txt = await res.text();
    let data = null;
    try { if (ct.includes('application/json')) data = JSON.parse(txt); } catch {}
    return { data, txt };
}

export default function AddToPlaylistWidget({ videoId, open, onClose, trigger, getUserName }) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = typeof open === 'boolean';
    const isOpen = isControlled ? open : internalOpen;

    const close = () => (isControlled ? onClose?.() : setInternalOpen(false));
    const openModal = () => { if (!isControlled) setInternalOpen(true); };

    const [loading, setLoading] = useState(false);
    const [playlists, setPlaylists] = useState([]);
    const [error, setError] = useState('');
    const [selectedId, setSelectedId] = useState(null);
    const [statusMsg, setStatusMsg] = useState('');

    const [newTitle, setNewTitle] = useState('');
    const [creating, setCreating] = useState(false);
    const [adding, setAdding] = useState(false);

    const [addedMap, setAddedMap] = useState({}); // { [id]: true }

    const userName = useMemo(
        () => (getUserName ? getUserName() : defaultGetUserName()),
        [getUserName, isOpen]
    );


    useEffect(() => {
        if (!isOpen) return;
        setError('');
        setStatusMsg('');
        setAddedMap({});
        setSelectedId(null);

        if (!userName) {
            setError('برای افزودن به پلی‌لیست باید وارد شوید.');
            return;
        }

        (async () => {
            setLoading(true);
            try {

                const res = await fetch('/api/customPlayList', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ op: 'list', user_name: userName, pageno: 1 }),
                });
                const { data, txt } = await getJsonSafe(res);
                if (data?.success === false || !data) {
                    console.log('list debug:', { data, txt });
                    throw new Error('list failed');
                }
                const list = Array.isArray(data?.list) ? data.list : [];
                setPlaylists(list);
                // انتخاب خودکار اولین پلی‌لیست
                if (list.length) setSelectedId(list[0].id);
            } catch (e) {
                setError('خطا در دریافت پلی‌لیست‌ها');
                console.error('list error:', e?.message);
            } finally {
                setLoading(false);
            }
        })();
    }, [isOpen, userName]);

    const bumpCount = (listId) => {
        setPlaylists((prev) =>
            prev.map((pl) =>
                String(pl.id) === String(listId)
                    ? { ...pl, count: (parseInt(pl.count, 10) || 0) + 1 }
                    : pl
            )
        );
    };

    const addToSelected = async () => {
        if (!userName || !selectedId || !videoId) return;
        setStatusMsg('');
        setAdding(true);
        try {
            const res = await fetch('/api/customPlayList', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    op: 'add',
                    user_name: userName,
                    video_id: videoId,
                    list_id: selectedId
                }),
            });
            const { data, txt } = await getJsonSafe(res);
            if (data?.success === false || !data) {
                console.log('add debug:', { data, txt });
                throw new Error('add failed');
            }

            setAddedMap((m) => ({ ...m, [String(selectedId)]: true }));
            bumpCount(selectedId);
            setStatusMsg(data?.msg || 'آهنگ با موفقیت اضافه شد.');
        } catch (e) {
            setStatusMsg('افزودن ناموفق بود.');
        } finally {
            setAdding(false);
        }
    };

    const createAndAdd = async () => {
        if (!userName || !newTitle.trim() || !videoId) return;
        setCreating(true);
        setStatusMsg('');
        try {
            const title = newTitle.trim();
            const res = await fetch('/api/customPlayList', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    op: 'create',
                    user_name: userName,
                    video_id: videoId,
                    title,
                }),
            });
            const { data, txt } = await getJsonSafe(res);
            if (data?.success === false || !data) {
                console.log('create debug:', { data, txt });
                throw new Error('create failed');
            }

            const newId = data?.list_id || data?.id || data?.playlist_id || `tmp-${Date.now()}`;
            const newPl = { id: newId, title, count: 1, thumbnail_url: '' };
            setPlaylists((prev) => [newPl, ...prev]);
            setSelectedId(newId);
            setAddedMap((m) => ({ ...m, [String(newId)]: true }));
            setStatusMsg(data?.msg || 'پلی‌لیست ساخته شد و آهنگ اضافه شد.');
            setNewTitle('');
        } catch (e) {
            setStatusMsg('ساخت/افزودن ناموفق بود.');
        } finally {
            setCreating(false);
        }
    };

    return (
        <>
            {!isControlled && trigger ? (
                <span onClick={openModal} style={{ display: 'inline-flex' }}>{trigger}</span>
            ) : null}

            {!isOpen ? null : (
                <div className="fixed inset-0 z-[10050]">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#1c1c1c] text-white rounded-2xl shadow-2xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-bold">افزودن به پلی‌لیست</h3>
                            <button onClick={close} className="text-[#FFEB3B]">
                                <Icon icon="solar:close-circle-outline" className="text-2xl" />
                            </button>
                        </div>

                        {!userName && (
                            <div className="text-sm text-amber-300 mb-3">برای استفاده از این قابلیت باید وارد شوید.</div>
                        )}

                        {error && <div className="text-red-400 text-sm mb-2">{error}</div>}

                        <div className="border border-white/10 rounded-xl p-3 mb-3 max-h-[40vh] overflow-y-auto">
                            {loading ? (
                                <div className="py-6 text-center text-gray-300">در حال بارگذاری…</div>
                            ) : !playlists.length ? (
                                <div className="text-gray-400 text-sm">پلی‌لیستی یافت نشد.</div>
                            ) : (
                                <ul className="space-y-2">
                                    {playlists.map((pl) => {
                                        const thumbs = collageThumbs(pl?.thumbnail_url);
                                        const isSelected = String(selectedId) === String(pl.id);
                                        const justAdded = !!addedMap[String(pl.id)];
                                        return (
                                            <li
                                                key={pl.id}
                                                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${isSelected ? 'bg-white/10' : 'hover:bg-white/5'}`}
                                                onClick={() => setSelectedId(pl.id)}
                                            >
                                                <div className="grid grid-cols-2 grid-rows-2 w-16 h-16 rounded overflow-hidden bg-neutral-700">
                                                    {Array.from({ length: 4 }).map((_, i) =>
                                                        thumbs[i] ? (
                                                            <img key={i} src={thumbs[i]} alt="" className="object-cover w-full h-full" />
                                                        ) : (
                                                            <div key={i} className="bg-neutral-800" />
                                                        )
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className="text-sm font-semibold">{pl.title || 'بی‌نام'}</div>
                                                        {justAdded && (
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                                اضافه شد ✓
                              </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {pl.count} {/* نمایش تعداد آهنگ */}
                                                    </div>
                                                </div>
                                                <input type="radio" readOnly checked={isSelected} />
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-2 mb-4">
                            <button
                                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50"
                                onClick={addToSelected}
                                disabled={!selectedId || !userName || !videoId || adding}
                            >
                                {adding ? 'در حال افزودن…' : 'افزودن'}
                            </button>
                        </div>

                        <div className="border border-white/10 rounded-xl p-3">
                            <div className="text-sm font-semibold mb-2">ساخت پلی‌لیست جدید</div>
                            <div className="flex items-center gap-2">
                                <input
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    className="flex-1 bg-[#2a2a2a] rounded-lg px-3 py-2 outline-none"
                                    placeholder="عنوان پلی‌لیست جدید من"
                                    dir="rtl"
                                />
                                <button
                                    onClick={createAndAdd}
                                    disabled={!newTitle.trim() || !userName || creating || !videoId}
                                    className="px-3 py-2 rounded-lg bg-[#FFEB3B] text-black hover:bg-[#d6c20f] disabled:opacity-50"
                                >
                                    {creating ? 'در حال ساخت…' : 'ساخت + افزودن'}
                                </button>
                            </div>
                        </div>

                        {statusMsg && <div className="mt-3 text-sm text-emerald-300">{statusMsg}</div>}
                    </div>
                </div>
            )}
        </>
    );
}
