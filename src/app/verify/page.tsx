"use client";
import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

function Verify() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const router = useRouter();
    useEffect(()=>{
        const verifyTeacher = async()=>{
            const teacher = await signIn('credentials',{type: 'TEACHER', token, redirect:false});
            if(teacher) router.push('/teacher/dashboard');
        }

        verifyTeacher();
    }, [token, router]);
    return (
        <div>page</div>
    )
}

export default Verify;