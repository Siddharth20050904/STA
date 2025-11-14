"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { registerStudent } from "../api/auth/register";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

async function handleSignUp(params: { email: string; name: string}) {
  try {
    const res = await registerStudent(params.name, params.email);
    if (!res) {
      toast.error('Unexpected response from auth');
      return null;
    }
    return res;
  } catch (err: unknown) {
    function getMessage(e: unknown): string {
      if (!e || typeof e !== 'object') return 'Registration failed'
      const rec = e as Record<string, unknown>
      if ('message' in rec && typeof rec.message === 'string') return rec.message
      return 'Registration failed'
    }
    toast.error(getMessage(err))
    return null;
  }
}

export default function SignUpPage() {
    const route = useRouter();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState<boolean>(false);

    const { data, status } = useSession();
    useEffect(() => {
        if (status === "authenticated") {
            if(data?.user?.type === "ADMIN" && data?.user?.isVerified) route.push("admin/dashboard");
            else if(data?.user?.type === "TEACHER" && data?.user?.isVerified) route.push("teacher/dashboard");
            else if(data?.user?.type === "STUDENT" && data?.user?.isVerified) route.push("student/dashboard");
            else alert("Your account is not verified yet. Please contact the administrator.");
        }
    }, [status, route, data]); 

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if(submitting) return;
        
        if(!username || !email ){
          toast.error('Please fill in all fields');
          return;
        }
        
        setSubmitting(true);
        
        try {
          const res = await handleSignUp({ name: username, email: email});
          if(res) route.push('/verifying-by-admin');
        } finally {
          setSubmitting(false);
        }
    };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800">
      {/* Left Pane */}
      <div className="hidden lg:flex items-center justify-center flex-1 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-md text-center">
          <Image src={"/login.png"} alt="Login" width={400} height={400}></Image>
        </div>
      </div>
      {/* Right Pane */}
      <div className="w-full bg-gradient-to-br from-gray-900 to-gray-800 lg:w-1/2 flex items-center justify-center">
        <div className="max-w-md w-full p-6">
          <h1 className="text-3xl font-semibold mb-6 text-gray-100 text-center">Sign Up As Student</h1>
          <form
            onSubmit={handleSubmit}
            className="space-y-4 bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-800 text-gray-100"
          >
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-100">
                Username
              </label>
              <input
                type="text"
                onChange={(e) => setUsername(e.target.value)}
                id="username"
                name="username"
                value={username}
                className="mt-1 p-2 w-full bg-gray-700/50 border border-gray-800 rounded-md text-gray-100 placeholder-gray-400 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/50 transition-colors duration-300"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-100">
                Email
              </label>
              <input
                type="text"
                onChange={(e) => setEmail(e.target.value)}
                id="email"
                name="email"
                value={email}
                className="mt-1 p-2 w-full bg-gray-700/50 border border-gray-800 rounded-md text-gray-100 placeholder-gray-400 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/50 transition-colors duration-300"
              />
            </div>
            <div>
              <button
                type="submit"
                className={`w-full bg-green-500 text-gray-950 font-semibold p-2 rounded-md hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/50 transition-colors duration-300 ${
                  submitting ? "cursor-not-allowed opacity-60" : ""
                }`}
                disabled={submitting}
              >
                {submitting ? 'Signing Up...' : 'Sign Up'}
              </button>
            </div>
          </form>
          <ToastContainer position="bottom-right" />
          <div className="mt-4 text-sm text-gray-400 text-center">
            <p>
              Already have an account?{" "}
              <a href="/signin" className="text-green-400 hover:text-green-300 transition-colors">
                Sign In here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
