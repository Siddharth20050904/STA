"use client";
import React, { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { registerStudent } from "../api/auth/register";
import { useSession } from "next-auth/react";
import Image from "next/image";

async function handleSignUp(params: { email: string; password: string; name: string}) {
    const result = await registerStudent(params.name, params.email, params.password);
    if(!result) return null;

    const signInResult = await signIn("credentials", { email: params.email, password: params.password, redirect: false, type:"STUDENT" });
    if(!signInResult) return null;
    return signInResult;
}

export default function LoginPage() {
    const route = useRouter();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

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
        const result = await handleSignUp({ name: username, email: email, password: password });
        if(!result) {alert("Something went wrong, please signup again."); return null;}
        if(result.ok) route.push('/verfying-by-admin');
    };

  return (
    // component
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
            action="#"
            method="POST"
            className="space-y-4 bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-700 text-gray-100"
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
                className="mt-1 p-2 w-full bg-gray-700/50 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-colors duration-300"
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
                className="mt-1 p-2 w-full bg-gray-700/50 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-colors duration-300"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-100">
                Password
              </label>
              <input
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                id="password"
                name="password"
                className="mt-1 p-2 w-full bg-gray-700/50 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-colors duration-300"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-100">
                Confirm Password
              </label>
              <input
                type="password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                id="confirm-password"
                name="confirm-password"
                className="mt-1 p-2 w-full bg-gray-700/50 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-colors duration-300"
              />
            </div>
            <div>
              <button
                onClick={handleSubmit}
                type="submit"
                className={`w-full bg-emerald-400 text-gray-950 font-semibold p-2 rounded-md hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-colors duration-300 ${password !== confirmPassword ? "cursor-not-allowed opacity-60" : ""}`}
                disabled={password !== confirmPassword}
              >
                Sign Up
              </button>
              {password !== confirmPassword && <p className="text-red-400 text-sm mt-2">Passwords do not match</p>}
            </div>
          </form>
          <div className="mt-4 text-sm text-gray-400 text-center">
            <p>
              Already have an account?{" "}
              <a href="/signin" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                Sign In here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}