"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Image from "next/image"
import { signIn, useSession } from "next-auth/react"
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const { data, status } = useSession()

  useEffect(() => {
    if (status === "authenticated") {
      if (data?.user?.type === "ADMIN" && data?.user?.isVerified) router.push("/admin/dashboard")
      else if (data?.user?.type === "TEACHER" && data?.user?.isVerified) router.push("/teacher/dashboard")
      else if (data?.user?.type === "STUDENT" && data?.user?.isVerified) router.push("/student/dashboard")
      else alert("Your account is not verified yet. Please contact the administrator.")
    }
  }, [status, router, data])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    if(!email || !password){
      toast.error('Please fill in all fields')
      return
    }
    setSubmitting(true)
    try{
      const res = await signIn('credentials', { email, password, type: 'ADMIN', redirect: false })
      const result = res as { error?: string; ok?: boolean } | null
      if (!result) {
        toast.error('Unexpected response from auth')
        return
      }
      if (result.error) {
        // show server-provided message (e.g., "Invalid password")
        toast.error(result.error)
        return
      }
      if (result.ok) {
        toast.success("Login Successfull")
        router.push('/admin/dashboard')
      }
    } catch (err) {
      console.error(err)
      toast.error('An error occurred while signing in')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800">
      {/* Left Pane */}
      <div className="hidden lg:flex items-center justify-center flex-1 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-md text-center">
          <Image src={"/login.png"} alt="Admin Login" width={400} height={400} />
        </div>
      </div>
      {/* Right Pane */}
      <div className="w-full bg-gradient-to-br from-gray-900 to-gray-800 lg:w-1/2 flex items-center justify-center">
        <div className="max-w-md w-full p-6">
          <h1 className="text-3xl font-semibold mb-6 text-gray-100 text-center">Admin Sign In</h1>
          <form
            onSubmit={handleSubmit}
            className="space-y-4 bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-700 text-gray-100"
          >
            {/* Your form elements go here */}
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
              <button
                type="submit"
                disabled={submitting}
                className={`w-full bg-emerald-400 text-gray-950 font-semibold p-2 rounded-md hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-colors duration-300 ${submitting ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {submitting ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
            <div className="mt-6 text-center text-base text-gray-300">
              <div className="mb-2">Or login as:</div>
              <a
                href="/signin"
                className="mx-2 text-emerald-400 underline font-medium hover:text-emerald-300 transition-colors"
              >
                Student
              </a>
              <a
                href="/teacher/login"
                className="mx-2 text-emerald-400 underline font-medium hover:text-emerald-300 transition-colors"
              >
                Teacher
              </a>
            </div>
          </form>
          {/* Toast */}
          <ToastContainer position="top-right" />
        </div>
      </div>
    </div>
  )
}