'use client'
import React, {useEffect, useState} from 'react';
import { useRouter } from 'next/navigation';

import Link from "next/link";
import { Icon } from "@iconify/react";
import ProtectedRoute from "@/component/ProtectedRoute";

function MyBeatBoxPage(props) {
    const router = useRouter();
    const [user, setUser] = useState({ name: '', phone: '', vote: 0 });

    useEffect(() => {
        const storedUser = localStorage.getItem('userInfo');

        // شرط کاملاً امن:
        if (storedUser && storedUser !== 'undefined') {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user info", e);
                router.push('/login');
            }
        } else {
            console.warn("No valid user info found, redirecting to login...");
            router.push('/login');
        }
    }, []);


    return (
        <ProtectedRoute>
        <div>
            <div className={`w-full bg-linear-to-b  from-black to-[#4e4e4e] rounded-b-2xl py-8 flex flex-col items-center justify-center`}>
                <span className={`text-white text-[18px] mb-2`}>{user.name} - {user.phone}</span>
                <span className={`text-[#FFEB3B] text-[21px]`}> تعداد امتیاز : {user.vote} </span>
                <div className={`flex items-center flex-wrap justify-center gap-8 mt-8 w-full`}>
                    <button className={`py-3 px-3 md:px-5 w-40 sm:w-50 md:w-80 bg-neutral-600 text-white`}>دریافت امتیاز رایگان</button>
                    <button className={`py-3 px-3 md:px-5 w-40 sm:w-50 md:w-80 bg-neutral-600 text-white`}> خرید امتیاز </button>
                </div>
            </div>
            <div className={`flex flex-col mb-[100px] items-center justify-center gap-2 mx-auto w-9/10 mt-8`}>
                <div className={`bg-[#454545] w-full flex gap-4 items-center justify-start`}>
                    <div className={`flex items-center justify-center w-16 h-16 bg-linear-to-b from-[#865922] to-[#DFA40C]`}>
                        <Icon icon={`solar:music-notes-linear`} className={`text-[30px]  `} />
                    </div>
                    <Link href={`/`}>پلی لیست من</Link>
                </div>
                <div className={`bg-[#454545] w-full flex gap-4 items-center justify-start`}>
                    <div className={`flex items-center justify-center w-16 h-16 bg-linear-to-b from-[#2E5D2C] to-[#81BC3E]`}>
                        <Icon icon={`solar:playlist-minimalistic-3-linear`} className={`text-[30px]  `} />
                    </div>
                    <Link href={`/`}>پلی لیست های دنبال شده</Link>
                </div>
                <div className={`bg-[#454545] w-full flex gap-4 items-center justify-start`}>
                    <div className={`flex items-center justify-center w-16 h-16 bg-linear-to-b from-[#04413A] to-[#099082]`}>
                        <Icon icon={`solar:list-check-minimalistic-bold`} className={`text-[30px]  `} />
                    </div>
                    <Link href={`/`}>آلبوم های دنبال شده</Link>
                </div>
                <div className={`bg-[#454545] w-full flex gap-4 items-center justify-start`}>
                    <div className={`flex items-center justify-center w-16 h-16 bg-linear-to-b from-[#255476] to-[#048BCD]`}>
                        <Icon icon={`solar:music-note-4-linear`} className={`text-[30px]  `} />
                    </div>
                    <Link href={`/`}>خوانندگان دنبال شده</Link>
                </div>
                <div className={`bg-[#454545] w-full flex gap-4 items-center justify-start`}>
                    <div className={`flex items-center justify-center w-16 h-16 bg-linear-to-b from-[#66332B] to-[#EF564A]`}>
                        <Icon icon={`solar:heart-linear`} className={`text-[30px]  `} />
                    </div>
                    <Link href={`/`}>آهنگ های پسند شده</Link>
                </div>
                <hr className={`my-2 border-b-1 border-neutral-800 w-full `}/>
                <div className={`bg-[#454545] w-full flex gap-4 items-center justify-start`}>
                    <div className={`flex items-center justify-center w-16 h-16 bg-linear-to-b from-[#054139] to-[#1A857F]`}>
                        <Icon icon={`solar:headphones-round-sound-outline`} className={`text-[30px]  `} />
                    </div>
                    <Link href={`/`}>پشتیبانی/ درخواست آهنگ</Link>
                </div>
            </div>
        </div>

        </ProtectedRoute>
    );
}

export default MyBeatBoxPage;