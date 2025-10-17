"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Clock, ShieldCheck } from "lucide-react";

function StudentPendingApproval() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-black via-neutral-900 to-gray-900 text-gray-100 px-6">
      <div className="max-w-md w-full text-center">
        <div className="bg-neutral-900/70 backdrop-blur-xl border border-gray-800 shadow-2xl rounded-2xl p-8">
          <div className="flex flex-col items-center space-y-5">
            <ShieldCheck className="w-14 h-14 text-emerald-400" />
            <h1 className="text-3xl font-semibold tracking-wide text-white">
              Registration Successful 🎉
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your account has been created successfully.  
              You’ll be able to access our app once the <span className="text-emerald-400 font-medium">admin approves</span> your registration.
            </p>
            <div className="flex items-center justify-center space-x-2 bg-gray-800 px-4 py-2 rounded-full mt-4 border border-gray-700">
              <Clock className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-sm text-gray-300">
                Waiting for admin approval...
              </span>
            </div>
            <button
              onClick={() => router.push("/")}
              className="mt-6 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 transition-all duration-300 rounded-lg text-white font-medium shadow-lg shadow-emerald-900/40"
            >
              Return to Home
            </button>
          </div>
        </div>

        <footer className="mt-8 text-gray-500 text-xs">
          © {new Date().getFullYear()} EduPortal — All Rights Reserved
        </footer>
      </div>
    </div>
  );
}

export default StudentPendingApproval;
