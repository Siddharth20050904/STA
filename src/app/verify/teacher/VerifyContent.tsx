"use client";
import React, { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

function VerifyContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const router = useRouter();

    useEffect(() => {
        const verifyTeacher = async () => {
            const teacher = await signIn('credentials', { type: 'TEACHER', token, redirect: false });
            if (teacher) router.push('/teacher/dashboard');
        };
        verifyTeacher();
    }, [token, router]);

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-900 via-indigo-900 to-indigo-700 text-white px-6">
            <div className="max-w-md w-full text-center">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
                    <div className="flex flex-col items-center space-y-4">
                        <Loader2 className="w-10 h-10 animate-spin text-indigo-300" />
                        <h1 className="text-2xl font-bold tracking-wide">Verifying Your Account</h1>
                        <p className="text-indigo-200 text-sm"> 
                            You’ll be redirected to your dashboard shortly.
                        </p>
                    </div>
                </div>
                <footer className="mt-8 text-indigo-300 text-xs">
                    © {new Date().getFullYear()}
                </footer>
            </div>
        </div>
    );
}

export default VerifyContent;
