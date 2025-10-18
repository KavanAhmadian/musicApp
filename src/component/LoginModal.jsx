'use client';
import { Icon } from "@iconify/react";
import Link from "next/link";

export default function LoginModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
            <div className="bg-[#1a1a1a] rounded-lg p-6 w-80 text-center">
                <Icon icon="solar:lock-password-linear" className="text-5xl text-yellow-400 mx-auto mb-4" />
                <h2 className="text-white text-xl mb-2">نیاز به ورود</h2>
                <p className="text-gray-400 mb-6">برای استفاده از این قابلیت باید وارد حساب کاربری شوید</p>

                <Link
                    href="/login"
                    className="block w-full py-2 bg-yellow-500 text-black font-bold rounded mb-3 hover:bg-yellow-400 transition"
                >
                    ورود به حساب
                </Link>

                <button
                    onClick={onClose}
                    className="w-full py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
                >
                    بستن
                </button>
            </div>
        </div>
    );
}
