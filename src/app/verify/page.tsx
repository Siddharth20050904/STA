// app/verify/page.tsx
"use client";
import { useEffect } from 'react';
import { Suspense } from 'react';
import VerifyContent from './VerifyContent'; // A component that uses useSearchParams()
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function VerifyPage() {
  const router = useRouter();
  const {data: session} = useSession();
  useEffect(()=>{
    if(!session){
      router.push('/');
    }else{
      if(session.user.type==="ADMIN") router.push('/admin/dashboard');
      else if(session.user.type==="TEACHER") router.push('/teacher/dashboard');
      else if(session.user.type==="STUDENT" && session.user.isVerified) router.push('/student/dashboard');
      else router.push('/');
    }
  },[router, session]);
  return (
    <Suspense fallback={<div>Loading verification details...</div>}>
      <VerifyContent />
    </Suspense>
  );
}