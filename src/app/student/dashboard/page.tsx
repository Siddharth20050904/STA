"use client"
import React, { useEffect, useState, useRef } from "react"
import { signOut, useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'
import { fetchAllTeachers } from "@/app/api/teacher_manager/teacher_manager"
import {
  addAppointment,
  cancellAppointment,
  fetchAppointments,
} from "@/app/api/appointment_manager/appointment_manager"
import { Ban, BookCheck, Clock1, LogOut, Plus, Search, User } from 'lucide-react'

type Appointment = {
  id: string
  teacher: string
  subject: string
  date: string
  time: string
  message?: string
  status: "upcoming" | "completed" | "cancelled"
  approvalStatus: string
}

type Teacher = {
  id: string
  name: string
  subjects: string[]
  department: string
}

export default function StudentDashboard() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [submitting, setSubmitting] = useState<boolean>(false)

  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed" | "cancelled">("upcoming")
  const [expanded, setExpanded] = useState<string | null>(null)
  const [expandedUpcoming, setExpandedUpcoming] = useState<string | null>(null)
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<{
    teacher: string
    teacherName: string
    subject: string
    date: string
    time: string
    message: string
  }>({ teacher: "", subject: "", date: "", time: "", message: "", teacherName: "" })

  const [teacherSearch, setTeacherSearch] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [showProfile, setShowProfile] = useState(false)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)
  const filteredAppointments = appointments.filter(
    (a) =>
      a.teacher.toLowerCase().includes(search.toLowerCase()) ||
      (a.subject || "").toLowerCase().includes(search.toLowerCase()),
  )
  let displayedAppointments = filteredAppointments
  if (filter !== "all") displayedAppointments = filteredAppointments.filter((a) => a.status === filter)

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      teacher.department.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      teacher.subjects.some((subject) => subject.toLowerCase().includes(teacherSearch.toLowerCase())),
  )

  useEffect(() => {
    if (status === "unauthenticated") router.push("/signin")
    else if (session?.user.type === "STUDENT" && !session?.user.isVerified) router.push("/verifying-by-admin")
    else if (session?.user.type === "ADMIN") router.push("/admin/dashboard")
    else if (session?.user.type === "TEACHER") router.push("/teacher/dashboard")
  }, [session, router, status])

  useEffect(() => {
    const fetchAllTeachersFunc = async () => {
      const fetchedTeachers = await fetchAllTeachers()
      if (fetchedTeachers)
        setTeachers(
          fetchedTeachers.map((teacher) => ({
            name: teacher.name,
            id: teacher.id,
            department: teacher.department,
            subjects: teacher.subjects,
          })),
        )
    }
    fetchAllTeachersFunc()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return
    const fetchAllAppointments = async () => {
      const fetchedAppointments = await fetchAppointments(session.user.id)
      if (fetchedAppointments)
        setAppointments(
          fetchedAppointments.map((appointment) => ({
            id: appointment.id,
            teacher: appointment.teacher.name,
            subject: appointment.subject,
            date: new Date(appointment.time).toLocaleDateString(),
            time: new Date(appointment.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            message: appointment.message,
            status: appointment.status,
            approvalStatus: appointment.approvalStatus,
          })),
        )
    }
    fetchAllAppointments()
  }, [session, status])

  const openAddModal = () => {
    setForm({ teacher: "", subject: "", date: "", time: "", message: "", teacherName: "" })
    setTeacherSearch("")
    setModalOpen(true)
  }
  const closeAddModal = () => {
    setModalOpen(false)
    setTeacherSearch("")
    setShowDropdown(false)
  }
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value })
  const handleTeacherSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTeacherSearch(e.target.value)
    setShowDropdown(true)
  }

  const selectTeacher = (teacherId: string, teacherName: string) => {
    setForm({ ...form, teacher: teacherId, teacherName: teacherName })
    setTeacherSearch(teacherName)
    setShowDropdown(false)
  }

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (submitting) return
    if (!(form.teacher && form.date && form.time && form.subject)) {
      alert("Please fill all the fields!")
      return
    }
    setSubmitting(true)
    try {
      const combinedTimeString = `${form.date}T${form.time}:00`
      const combinedTime = new Date(combinedTimeString).toISOString()

      const addedAppointment = await addAppointment({
        teacherId: form.teacher,
        studentId: session!.user.id,
        time: combinedTime,
        subject: form.subject,
        studentName: session!.user.name,
        teacherName: form.teacherName,
        createdAt: new Date().toISOString(),
        message: form.message,
      })
      if (!addedAppointment) {
        alert("Error in Adding Appointment")
        return
      }
      setAppointments((prev) => [
        ...prev,
        {
          id: addedAppointment.id,
          teacher: addedAppointment.teacher.name,
          subject: addedAppointment.subject,
          date: form.date,
          time: form.time,
          message: addedAppointment.message,
          status: "upcoming",
          approvalStatus: addedAppointment.approvalStatus,
        },
      ])
      setModalOpen(false)
      setForm({ teacher: "", subject: "", date: "", time: "", message: "", teacherName: "" })
      setTeacherSearch("")
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = async (meetingId: string) => {
    const confirmation: boolean = confirm("Do you want to cancel this meeting ?")
    if (!confirmation) return
    const cancelledAppointment = await cancellAppointment(meetingId)
    if (cancelledAppointment) {
      setAppointments((prevItems) =>
        prevItems.map((appointment) =>
          appointment.id === meetingId ? { ...appointment, status: "cancelled" } : appointment,
        ),
      )
    } else {
      alert("Error in cancelling appointment, Please try later!")
    }
  }

  return (
    <div className="min-h-screen bg-black text-gray-100 flex flex-col">
      <header className="border-b border-gray-800 bg-gradient-to-r from-gray-950 to-gray-900">
        <div className="h-1 bg-gradient-to-r from-green-500 via-green-400 to-green-600"></div>
        <div className="flex flex-row justify-between items-center text-3xl font-bold p-6">
          <div></div>
          <h1 className="text-gray-100">Student Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setShowProfile((s) => !s)}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-md text-sm text-gray-100"
                aria-haspopup="true"
                aria-expanded={showProfile}
              >
                <User size={18} />
                <span className="hidden sm:inline">Profile</span>
              </button>
              {showProfile && (
                <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-md shadow-lg p-4 text-sm text-gray-100 z-50">
                  <div className="font-semibold text-gray-100">{session?.user?.name ?? '—'}</div>
                  <div className="text-gray-300 truncate">{session?.user?.email ?? '—'}</div>
                  <div className="mt-2 text-xs text-gray-400">Role: {session?.user?.type ?? '—'}</div>
                </div>
              )}
            </div>

            <LogOut
              className="cursor-pointer hover:text-green-400 transition-colors"
              size={28}
              onClick={async () => {
                await signOut()
                router.push("/signin")
              }}
            />
          </div>
        </div>
      </header>

      <div className="flex flex-1 items-start justify-center">
        <div className="flex flex-col md:flex-row gap-8 p-6 md:p-12 w-full h-[calc(100vh-100px)]">
          <div className="flex-1 h-full bg-gray-900 border border-gray-800 rounded-xl shadow-2xl p-6 md:p-10 flex flex-col min-w-0">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-green-500 rounded-full"></div>
                <h2 className="text-2xl font-semibold text-gray-100">Appointments</h2>
              </div>
              <button
                className="bg-green-500 hover:bg-green-600 text-black px-4 py-2 rounded-lg text-sm hover:shadow-lg hover:shadow-green-500/30 font-semibold transition-all flex items-center gap-2"
                onClick={openAddModal}
              >
                <Plus size={18} />
                Add
              </button>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  placeholder="Search appointments..."
                  value={search}
                  onChange={handleSearch}
                  className="p-2.5 pl-10 w-full bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {(["all", "upcoming", "completed", "cancelled"] as const).map((f) => (
                <button
                  key={f}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    filter === f
                      ? "bg-green-500 text-black shadow-lg shadow-green-500/30"
                      : "bg-gray-800 text-gray-300 border border-gray-700 hover:border-gray-600"
                  }`}
                  onClick={() => setFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-sm lg:text-base text-gray-200">
                <thead className="sticky top-0 border-b border-gray-700 bg-gray-800/80">
                  <tr>
                    <th className="px-3 py-3 text-left">Teacher</th>
                    <th className="px-3 py-3 text-left">Subject</th>
                    <th className="px-3 py-3 text-left">Date</th>
                    <th className="px-3 py-3 text-left">Time</th>
                    <th className="px-3 py-3 text-center">Status</th>
                    <th className="px-3 py-3 text-center">Approval</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-gray-500 text-center">
                        No appointments.
                      </td>
                    </tr>
                  ) : (
                    displayedAppointments.map((a) => (
                      <React.Fragment key={a.id}>
                        <tr
                          className={`border-b border-gray-800/50 hover:bg-gray-800/50 transition cursor-pointer`}
                          onClick={() => setExpanded(expanded === a.id ? null : a.id)}
                        >
                          <td className="px-3 py-3 font-medium text-gray-100">{a.teacher}</td>
                          <td className="px-3 py-3 text-gray-300">{a.subject}</td>
                          <td className="px-3 py-3 text-gray-400">{a.date}</td>
                          <td className="px-3 py-3 text-gray-400">{a.time}</td>
                          <td className="px-3 py-3 text-center capitalize text-gray-300">{a.status}</td>
                          <td className="flex justify-center px-3 py-3">
                            {a.approvalStatus === "accepted" ? (
                              <BookCheck className="text-green-400" size={20} />
                            ) : a.approvalStatus === "pending" ? (
                              <Clock1 className="text-gray-400" size={20} />
                            ) : (
                              <Ban className="text-gray-400" size={20} />
                            )}
                          </td>
                        </tr>
                        {expanded === a.id && (
                          <tr className="bg-gray-800/50 border-b border-gray-800">
                            <td colSpan={6} className="px-6 py-4">
                              <div className="space-y-2 text-gray-300">
                                <div>
                                  <span className="font-semibold text-green-400">Teacher:</span> {a.teacher}
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
                                  <span className="capitalize">{a.status}</span>
                                </div>
                                <div>
                                  <span className="font-semibold text-green-400">Approval:</span>{" "}
                                  <span
                                    className={`capitalize ${a.approvalStatus === "accepted" ? "text-green-400" : a.approvalStatus === "pending" ? "text-gray-400" : "text-gray-400"}`}
                                  >
                                    {a.approvalStatus}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between pt-2">
                                  <div className="flex-1 text-sm text-gray-300">
                                    {a.message ? (
                                      <>
                                        <span className="font-semibold text-green-400 mr-2">Message:</span>
                                        <span>{a.message}</span>
                                      </>
                                    ) : (
                                      <span className="text-gray-500 italic">No message</span>
                                    )}
                                  </div>
                                  <button
                                    className="bg-gray-700 hover:bg-gray-600 text-gray-100 px-3 py-1.5 rounded text-sm ml-4 transition-colors"
                                    onClick={() => handleCancel(a.id)}
                                  >
                                    Cancel
                                  </button>
                                </div>
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

          <div className="flex-1 h-full bg-gray-900 border border-gray-800 rounded-xl shadow-2xl p-6 md:p-10 flex flex-col min-w-0 overflow-y-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                <h2 className="text-2xl font-semibold text-gray-100">Upcoming Appointments</h2>
              </div>
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-sm lg:text-base text-gray-200">
                  <thead className="border-b border-gray-700 bg-gray-800/80">
                    <tr>
                      <th className="px-3 py-3 text-left">Teacher</th>
                      <th className="px-3 py-3 text-left">Subject</th>
                      <th className="px-3 py-3 text-left">Date</th>
                      <th className="px-3 py-3 text-center">Approval</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.filter((a) => a.status === "upcoming").length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-gray-500 text-center">
                          No upcoming appointments.
                        </td>
                      </tr>
                    ) : (
                      appointments
                        .filter((a) => a.status === "upcoming")
                        .map((a) => (
                          <React.Fragment key={a.id}>
                            <tr
                              className="border-b border-gray-800/50 hover:bg-gray-800/50 transition cursor-pointer"
                              onClick={() => setExpandedUpcoming(expandedUpcoming === a.id ? null : a.id)}
                            >
                              <td className="px-3 py-3 font-medium text-gray-100">{a.teacher}</td>
                              <td className="px-3 py-3 text-gray-300">{a.subject}</td>
                              <td className="px-3 py-3 text-gray-400">{a.date}</td>
                              <td className="flex justify-center px-3 py-3">
                                {a.approvalStatus === "accepted" ? (
                                  <BookCheck className="text-green-400" size={20} />
                                ) : (
                                  <Clock1 className="text-gray-400" size={20} />
                                )}
                              </td>
                            </tr>
                            {expandedUpcoming === a.id && (
                              <tr className="bg-gray-800/50 border-b border-gray-800">
                                <td colSpan={4} className="px-6 py-4">
                                  <div className="space-y-2 text-gray-300">
                                    <div>
                                      <span className="font-semibold text-green-400">Teacher:</span> {a.teacher}
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
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                <h2 className="text-2xl font-semibold text-gray-100">Appointment History</h2>
              </div>
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-sm lg:text-base text-gray-200">
                  <thead className="border-b border-gray-700 bg-gray-800/80">
                    <tr>
                      <th className="px-3 py-3 text-left">Teacher</th>
                      <th className="px-3 py-3 text-left">Subject</th>
                      <th className="px-3 py-3 text-left">Date</th>
                      <th className="px-3 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.filter((a) => a.status === "completed" || a.status === "cancelled").length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-gray-500 text-center">
                          No past appointments.
                        </td>
                      </tr>
                    ) : (
                      appointments
                        .filter((a) => a.status === "completed" || a.status === "cancelled")
                        .map((a) => (
                          <React.Fragment key={a.id}>
                            <tr
                              className="border-b border-gray-800/50 hover:bg-gray-800/50 transition cursor-pointer"
                              onClick={() => setExpandedHistory(expandedHistory === a.id ? null : a.id)}
                            >
                              <td className="px-3 py-3 font-medium text-gray-100">{a.teacher}</td>
                              <td className="px-3 py-3 text-gray-300">{a.subject}</td>
                              <td className="px-3 py-3 text-gray-400">{a.date}</td>
                              <td className="px-3 py-3 text-center text-gray-400 capitalize">{a.status}</td>
                            </tr>
                            {expandedHistory === a.id && (
                              <tr className="bg-gray-800/50 border-b border-gray-800">
                                <td colSpan={4} className="px-6 py-4">
                                  <div className="space-y-2 text-gray-300">
                                    <div>
                                      <span className="font-semibold text-green-400">Teacher:</span> {a.teacher}
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
                                      <span className="capitalize">{a.status}</span>
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

          {modalOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={closeAddModal}
            >
              <div
                className="bg-gray-900 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-800"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="h-1 bg-green-500 rounded-full mb-6"></div>
                <h2 className="text-2xl font-semibold mb-6 text-gray-100">Add Appointment</h2>
                <form className="space-y-4" onSubmit={handleFormSubmit}>
                  <div>
                    <label htmlFor="teacher" className="block text-sm font-medium text-gray-200 mb-2">
                      Teacher
                    </label>
                    <div className="relative" ref={dropdownRef}>
                      <input
                        id="teacher"
                        type="text"
                        placeholder="Search by name, department, or subject..."
                        value={teacherSearch}
                        onChange={handleTeacherSearchChange}
                        onFocus={() => setShowDropdown(true)}
                        className="p-2.5 w-full bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all"
                        required
                      />
                      {showDropdown && filteredTeachers.length > 0 && (
                        <div className="absolute z-10 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {filteredTeachers.map((teacher) => (
                            <div
                              key={teacher.id}
                              onClick={() => selectTeacher(teacher.id, teacher.name)}
                              className="p-2.5 hover:bg-gray-700 cursor-pointer text-gray-100 transition-colors border-b border-gray-700/50 last:border-b-0"
                            >
                              <div className="font-medium">{teacher.name}</div>
                              <div className="text-sm text-gray-400">{teacher.department}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-200 mb-2">
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={form.subject}
                      onChange={handleFormChange}
                      className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all"
                      required
                    >
                      <option value="" disabled>
                        {form.teacher ? "Select a subject" : "Select a teacher first"}
                      </option>
                      {(form.teacher
                        ? teachers.find((t) => t.id === form.teacher)?.subjects || []
                        : Array.from(new Set(teachers.flatMap((t) => t.subjects || [])))
                      ).map((subj) => (
                        <option key={subj} value={subj}>
                          {subj}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-200 mb-2">
                      Date
                    </label>
                    <input
                      id="date"
                      name="date"
                      type="date"
                      value={form.date}
                      onChange={handleFormChange}
                      className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-200 mb-2">
                      Time
                    </label>
                    <input
                      id="time"
                      name="time"
                      type="time"
                      value={form.time}
                      onChange={handleFormChange}
                      className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-200 mb-2">
                      Message / Description
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={form.message}
                      onChange={handleFormChange}
                      className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all resize-none"
                      required
                      rows={3}
                    />
                  </div>
                  <button
                    type="submit"
                    className={`w-full bg-green-500 hover:bg-green-600 text-black font-semibold p-2.5 rounded-lg transition-all shadow-lg shadow-green-500/30 ${submitting ? "opacity-60 cursor-not-allowed" : ""}`}
                    disabled={submitting}
                  >
                    {submitting ? "Adding..." : "Add Appointment"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
