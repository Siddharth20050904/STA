"use client"
import React, { useEffect, useState } from "react"
import { signOut, useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'
import { Clock1, LogOut, Search, Check, X, User } from 'lucide-react'
import {
  fetchAppointmentsByTeacher,
  updateAppointmentApprovalStatus,
} from "@/app/api/appointment_manager/appointment_manager"

type Appointment = {
  id: string
  student: string
  subject: string
  date: string
  time: string
  message?: string
  status: "pending" | "upcoming" | "completed" | "cancelled"
  approvalStatus: string
}

const initialAppointments: Appointment[] = []

export default function TeacherDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments)
  const [search, setSearch] = useState("")
  const [expanded, setExpanded] = useState<string | null>(null)
  const [expandedUpcoming, setExpandedUpcoming] = useState<string | null>(null)
  const [expandedPast, setExpandedPast] = useState<string | null>(null)
  const [showProfile, setShowProfile] = useState(false)

  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") router.push("/signin")
    else if (session?.user.type === "STUDENT") {
      if (!session.user.isVerified) router.push("/request-verification")
      else router.push("/student/dashboard")
    } else if (session?.user.type === "ADMIN") router.push("/admin/dashboard")
  }, [session, router, status])

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return
    const fetchAppointmentFunc = async () => {
      const fetchedAppointments = await fetchAppointmentsByTeacher(session.user.id)
      if (!fetchedAppointments) return
      setAppointments(
        fetchedAppointments.map((appointment) => ({
          id: appointment.id,
          student: appointment.studentName,
          subject: appointment.subject,
          date: new Date(appointment.time).toLocaleDateString(),
          time: new Date(appointment.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          message: appointment.message,
          status: appointment.status,
          approvalStatus: appointment.approvalStatus,
        })),
      )
    }

    fetchAppointmentFunc()
  }, [session, status])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)

  const filteredAppointments = appointments.filter(
    (a) =>
      a.student.toLowerCase().includes(search.toLowerCase()) ||
      (a.subject || "").toLowerCase().includes(search.toLowerCase()),
  )

  const markApproveStatus = async (id: string, stat: string) => {
    const updatedAppointment = await updateAppointmentApprovalStatus(id, stat)
    if (updatedAppointment) {
      setAppointments((prevItems) =>
        prevItems.map((appointment) =>
          appointment.id === id ? { ...appointment, approvalStatus: stat } : appointment,
        ),
      )
    } else {
      alert("Error in updating the appointment, Please try later!")
    }
  }

  return (
    <div className="min-h-screen bg-black text-gray-100 flex flex-col">
      <header className="border-b border-gray-800">
        <div className="h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
        <div className="flex flex-row justify-between items-center text-3xl font-bold p-6 bg-gradient-to-r from-gray-950 to-gray-900">
          <div></div>
          <h1 className="text-white">Teacher Dashboard</h1>
          <div className="flex items-center gap-4">
            {/* Profile button - shows dropdown with user info */}
            <div className="relative">
              <button
                onClick={() => setShowProfile((s) => !s)}
                className="flex items-center gap-2 hover:bg-green-500/10 rounded-md px-3 py-1.5 text-sm text-gray-400 hover:text-green-400 transition-colors"
                aria-haspopup="true"
                aria-expanded={showProfile}
              >
                <User size={18} />
                <span className="hidden sm:inline">Profile</span>
              </button>
              {showProfile && (
                <div className="absolute right-0 mt-2 w-64 bg-gray-950 border border-gray-800 rounded-md shadow-lg p-4 text-sm text-gray-100 z-50">
                  <div className="font-semibold text-white">{session?.user?.name ?? '—'}</div>
                  <div className="text-gray-300 truncate">{session?.user?.email ?? '—'}</div>
                  <div className="mt-2 text-xs text-gray-400">Role: {session?.user?.type ?? '—'}</div>
                </div>
              )}
            </div>

            <button
              className="hover:bg-green-500/10 rounded p-2 transition-colors text-gray-400 hover:text-green-400"
              onClick={async () => {
                await signOut()
                router.push("/signin")
              }}
              aria-label="Logout"
            >
              <LogOut size={24} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 justify-center items-start">
        <div className="flex flex-col md:flex-row gap-8 p-6 md:p-12 w-full h-[calc(100vh-100px)]">
          <div className="flex-1 h-full bg-gray-950 border border-gray-800 rounded-lg shadow-xl p-6 md:p-10 flex flex-col min-w-0">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800">
              <div className="w-1 h-6 bg-green-500"></div>
              <h2 className="text-2xl font-semibold text-green-400">Appointments & Requests</h2>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  placeholder="Search pending requests..."
                  value={search}
                  onChange={handleSearch}
                  className="p-2.5 pl-10 w-full bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-sm lg:text-base text-gray-200">
                <thead className="sticky top-0 border-b border-gray-700 bg-gray-900/80 backdrop-blur">
                  <tr>
                    <th className="px-3 py-3 text-left font-semibold text-gray-300">Student</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-300">Subject</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-300">Date</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-300">Time</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.filter((a) => a.approvalStatus === "pending").length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-gray-500 text-center">
                        No pending requests.
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments
                      .filter((a) => a.approvalStatus === "pending" && a.status !== "cancelled")
                      .map((a) => (
                        <React.Fragment key={a.id}>
                          <tr
                            className="border-b border-gray-800 hover:bg-gray-900/60 transition cursor-pointer"
                            onClick={() => setExpanded(expanded === a.id ? null : a.id)}
                          >
                            <td className="px-3 py-3 font-medium">{a.student}</td>
                            <td className="px-3 py-3 text-gray-400">{a.subject}</td>
                            <td className="px-3 py-3 text-gray-400">{a.date}</td>
                            <td className="px-3 py-3 text-gray-400">{a.time}</td>
                            <td className="flex justify-center px-3 py-3">
                              <Clock1 className="text-gray-400" size={20} />
                            </td>
                          </tr>
                          {expanded === a.id && (
                            <tr className="bg-gray-900/50 border-b border-gray-800">
                              <td colSpan={5} className="px-6 py-4">
                                <div className="space-y-2 text-gray-300">
                                  <div>
                                    <span className="font-semibold text-green-400">Student:</span> {a.student}
                                  </div>
                                  <div>
                                    <span className="font-semibold text-green-400">Subject:</span> {a.subject}
                                  </div>
                                  <div>
                                    <span className="font-semibold text-green-400">Date:</span> {a.date}
                                  </div>
                                  <div>
                                    <span className="font-semibold text-green-400">Time:</span> {a.time}
                                  </div>
                                  {a.message && (
                                    <div className="mt-2">
                                      <span className="font-semibold text-green-400">Message:</span> {a.message}
                                    </div>
                                  )}
                                </div>
                                <div className="mt-4 flex gap-3">
                                  {a.status === "upcoming" && (
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => markApproveStatus(a.id, "accepted")}
                                        className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-black px-4 py-1.5 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg hover:shadow-green-500/30"
                                      >
                                        <Check size={16} />
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => markApproveStatus(a.id, "rejected")}
                                        className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-gray-200 px-4 py-1.5 rounded-lg text-sm font-medium transition-all border border-gray-700"
                                      >
                                        <X size={16} />
                                        Reject
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex-1 h-full bg-gray-950 border border-gray-800 rounded-lg shadow-xl p-6 md:p-10 flex flex-col min-w-0 overflow-y-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800">
                <div className="w-1 h-6 bg-green-500"></div>
                <h2 className="text-2xl font-semibold text-green-400">Upcoming Appointments</h2>
              </div>
              <div className="overflow-y-auto">
                <table className="w-full text-sm lg:text-base text-gray-200">
                  <thead className="sticky top-0 border-b border-gray-700 bg-gray-900/80 backdrop-blur">
                    <tr>
                      <th className="px-3 py-3 text-left font-semibold text-gray-300">Student</th>
                      <th className="px-3 py-3 text-left font-semibold text-gray-300">Subject</th>
                      <th className="px-3 py-3 text-left font-semibold text-gray-300">Date</th>
                      <th className="px-3 py-3 text-left font-semibold text-gray-300">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.filter((a) => a.status === "upcoming" && a.approvalStatus === "accepted").length ===
                    0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-gray-500 text-center">
                          No upcoming appointments.
                        </td>
                      </tr>
                    ) : (
                      appointments
                        .filter((a) => a.status === "upcoming" && a.approvalStatus === "accepted")
                        .map((a) => (
                          <React.Fragment key={a.id}>
                            <tr
                              className="border-b border-gray-800 hover:bg-gray-900/60 transition cursor-pointer"
                              onClick={() => setExpandedUpcoming(expandedUpcoming === a.id ? null : a.id)}
                            >
                              <td className="px-3 py-3 font-medium">{a.student}</td>
                              <td className="px-3 py-3 text-gray-400">{a.subject}</td>
                              <td className="px-3 py-3 text-gray-400">{a.date}</td>
                              <td className="px-3 py-3 text-gray-400">{a.time}</td>
                            </tr>
                            {expandedUpcoming === a.id && (
                              <tr className="bg-gray-900/50 border-b border-gray-800">
                                <td colSpan={4} className="px-6 py-4">
                                  <div className="space-y-2 text-gray-300">
                                    <div>
                                      <span className="font-semibold text-green-400">Student:</span> {a.student}
                                    </div>
                                    <div>
                                      <span className="font-semibold text-green-400">Subject:</span> {a.subject}
                                    </div>
                                    <div>
                                      <span className="font-semibold text-green-400">Date:</span> {a.date}
                                    </div>
                                    <div>
                                      <span className="font-semibold text-green-400">Time:</span> {a.time}
                                    </div>
                                    {a.message && (
                                      <div className="mt-2">
                                        <span className="font-semibold text-green-400">Message:</span> {a.message}
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800">
                <div className="w-1 h-6 bg-green-500"></div>
                <h2 className="text-2xl font-semibold text-green-400">Past Appointments</h2>
              </div>
              <div className="overflow-y-auto">
                <table className="w-full text-sm lg:text-base text-gray-200">
                  <thead className="sticky top-0 border-b border-gray-700 bg-gray-900/80 backdrop-blur">
                    <tr>
                      <th className="px-3 py-3 text-left font-semibold text-gray-300">Student</th>
                      <th className="px-3 py-3 text-left font-semibold text-gray-300">Subject</th>
                      <th className="px-3 py-3 text-left font-semibold text-gray-300">Date</th>
                      <th className="px-3 py-3 text-left font-semibold text-gray-300">Time</th>
                      <th className="px-3 py-3 text-center font-semibold text-gray-300">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.filter(
                      (a) => a.status === "completed" || a.approvalStatus === "rejected" || a.status === "cancelled",
                    ).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-gray-500 text-center">
                          No past appointments.
                        </td>
                      </tr>
                    ) : (
                      appointments
                        .filter(
                          (a) =>
                            a.status === "completed" || a.approvalStatus === "rejected" || a.status === "cancelled",
                        )
                        .map((a) => (
                          <React.Fragment key={a.id}>
                            <tr
                              className="border-b border-gray-800 hover:bg-gray-900/60 transition cursor-pointer"
                              onClick={() => setExpandedPast(expandedPast === a.id ? null : a.id)}
                            >
                              <td className="px-3 py-3 font-medium">{a.student}</td>
                              <td className="px-3 py-3 text-gray-400">{a.subject}</td>
                              <td className="px-3 py-3 text-gray-400">{a.date}</td>
                              <td className="px-3 py-3 text-gray-400">{a.time}</td>
                              <td
                                className={`px-3 py-3 text-center capitalize text-sm ${
                                  a.status === "completed" ? "text-green-400" : "text-gray-400"
                                }`}
                              >
                                {a.approvalStatus === "rejected" ? "Cancelled" : a.status}
                              </td>
                            </tr>
                            {expandedPast === a.id && (
                              <tr className="bg-gray-900/50 border-b border-gray-800">
                                <td colSpan={5} className="px-6 py-4">
                                  <div className="space-y-2 text-gray-300">
                                    <div>
                                      <span className="font-semibold text-green-400">Student:</span> {a.student}
                                    </div>
                                    <div>
                                      <span className="font-semibold text-green-400">Subject:</span> {a.subject}
                                    </div>
                                    <div>
                                      <span className="font-semibold text-green-400">Date:</span> {a.date}
                                    </div>
                                    <div>
                                      <span className="font-semibold text-green-400">Time:</span> {a.time}
                                    </div>
                                    <div>
                                      <span className="font-semibold text-green-400">Status:</span>{" "}
                                      <span className="capitalize">
                                        {a.approvalStatus === "rejected" ? "Cancelled" : a.status}
                                      </span>
                                    </div>
                                    {a.message && (
                                      <div className="mt-2">
                                        <span className="font-semibold text-green-400">Message:</span> {a.message}
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
