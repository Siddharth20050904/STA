"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Home() {

  const {data: session, status} = useSession();
  const router = useRouter();

  useEffect(()=>{
      if(status === 'unauthenticated') router.push('/signin');
      else if(session?.user.type === 'STUDENT' && !session?.user.isVerified) router.push('/verification-request');
      else if(session?.user.type === 'ADMIN') router.push('/admin/dashboard');
      else if(session?.user.type === 'TEACHER') router.push('/teacher/dashboard');
  }, [session, router, status]);

  return (
    <></>
  );
}
