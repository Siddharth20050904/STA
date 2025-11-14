"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import {
  fetchAllTeachers,
  addTeacher,
  removeTeacher,
  updateTeacherFields,
} from "@/app/api/teacher_manager/teacher_manager"
import { fetchUnverifiedStudents, verifyStudent, removeStudent } from "@/app/api/student_manager/student_manager"
import { LogOut, Plus, Minus, Edit2, Trash2, CheckCircle2, Search, User } from "lucide-react"

type Teacher = {
  id: string
  name: string
  department: string
  subject: string[]
  email: string
}

type Student = {
  id: string
  name: string
  email: string
  approved: boolean
}

export default function AdminDashboard() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [teacherSearch, setTeacherSearch] = useState("")
  const [teacherForm, setTeacherForm] = useState<{ name: string; department: string; email: string }>({
    name: "",
    department: "",
    email: "",
  })
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null)
  const [teacherModalOpen, setTeacherModalOpen] = useState(false)
  const [inputSubjectField, setInputSubjectField] = useState<string[]>([""])

  const [students, setStudents] = useState<Student[]>([])
  const [studentSearch, setStudentSearch] = useState("")
  const [studentFilter, setStudentFilter] = useState<"all" | "pending" | "approved">("all")

  const { data: session, status } = useSession()
  const router = useRouter()
  const [showProfile, setShowProfile] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/signin")
    else if (session?.user.type === "STUDENT") {
      if (!session.user.isVerified) router.push("/request-verification")
      else router.push("/student/dashboard")
    } else if (session?.user.type === "TEACHER") router.push("/teacher/dashboard")
  }, [session, router, status])

  useEffect(() => {
    const fetchAllTeachersFunc = async () => {
      const fetchedTeachers = await fetchAllTeachers()
      setTeachers(
        fetchedTeachers!.map((ele) => ({
          name: ele.name,
          email: ele.email,
          subject: ele.subjects,
          department: ele.department,
          id: ele.id,
        })),
      )
    }
    fetchAllTeachersFunc()
  }, [])

  useEffect(() => {
    const fetchUnverifiedStudentsFunc = async () => {
      const fetchedStudents = await fetchUnverifiedStudents()
      setStudents(
        fetchedStudents!.map((student) => ({
          name: student.name,
          email: student.email,
          approved: false,
          id: student.id,
        })),
      )
    }
    fetchUnverifiedStudentsFunc()
  }, [])

  const handleTeacherSearch = (e: React.ChangeEvent<HTMLInputElement>) => setTeacherSearch(e.target.value)
  const filteredTeachers = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      t.department.toLowerCase().includes(teacherSearch.toLowerCase()),
  )
  const openAddTeacher = () => {
    setTeacherForm({ name: "", department: "", email: "" })
    setEditingTeacherId(null)
    setTeacherModalOpen(true)
  }
  const openEditTeacher = (t: Teacher) => {
    setTeacherForm({ name: t.name, department: t.department, email: t.email })
    setInputSubjectField(t.subject)
    setEditingTeacherId(t.id)
    setTeacherModalOpen(true)
  }
  const handleTeacherFormChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setTeacherForm({ ...teacherForm, [e.target.name]: e.target.value })
  const handleTeacherFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingTeacherId !== null) {
      const updatedTeacher = await updateTeacherFields({
        name: teacherForm.name,
        email: teacherForm.email,
        subjects: inputSubjectField,
        department: teacherForm.department,
        id: editingTeacherId,
      })
      if (!updatedTeacher) {
        alert("Error in updating teacher, please try later!")
        setTeacherModalOpen(false)
        setTeacherForm({ name: "", department: "", email: "" })
        return
      }
      setTeachers(teachers.filter((teacher) => teacher.id !== editingTeacherId))
      setTeachers((prevItem) => [
        ...prevItem,
        {
          id: updatedTeacher.id,
          email: updatedTeacher.email,
          subject: updatedTeacher.subjects,
          department: updatedTeacher.department,
          name: updatedTeacher.name,
        },
      ])
    } else {
      const newTeacher = await addTeacher({
        name: teacherForm.name,
        email: teacherForm.email,
        department: teacherForm.department,
        subjects: inputSubjectField,
      })
      setTeachers([
        ...teachers,
        {
          id: newTeacher!.id,
          name: teacherForm.name,
          email: teacherForm.email,
          department: teacherForm.department,
          subject: inputSubjectField,
        },
      ])
    }
    setTeacherModalOpen(false)
    setTeacherForm({ name: "", department: "", email: "" })
  }

  const [expandedTeacher, setExpandedTeacher] = useState<string | null>(null)
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null)
  const handleDeleteTeacher = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this teacher?")) {
      const removedTeacher = await removeTeacher(id)
      setTeachers(teachers.filter((t) => t.id !== removedTeacher?.id))
    }
  }

  const handleStudentSearch = (e: React.ChangeEvent<HTMLInputElement>) => setStudentSearch(e.target.value)
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase()),
  )
  let displayedStudents = filteredStudents
  if (studentFilter === "pending") {
    displayedStudents = filteredStudents.filter((s) => !s.approved)
  } else if (studentFilter === "approved") {
    displayedStudents = filteredStudents.filter((s) => s.approved)
  }

  const [studentActionModal, setStudentActionModal] = useState<{
    open: boolean
    student: Student | null
    action: "approve" | "remove" | null
  }>({ open: false, student: null, action: null })
  const openStudentActionModal = (student: Student, action: "approve" | "remove") =>
    setStudentActionModal({ open: true, student, action })
  const closeStudentActionModal = () => setStudentActionModal({ open: false, student: null, action: null })
  const confirmStudentAction = async () => {
    if (studentActionModal.student && studentActionModal.action) {
      if (studentActionModal.action === "approve") {
        const student = await verifyStudent(studentActionModal.student.id)
        if (student) {
          setStudents(students.filter((s) => s.id !== studentActionModal.student!.id))
        }
      } else if (studentActionModal.action === "remove") {
        const student = await removeStudent(studentActionModal.student.id)
        if (student) {
          setStudents(students.filter((s) => s.id !== studentActionModal.student!.id))
        }
      }
    }
    closeStudentActionModal()
  }

  const handleAddInput = () => setInputSubjectField((prevItems) => [...prevItems, ""])
  const handleSubInput = (indexToDelete: number) =>
    setInputSubjectField((prevItems) => prevItems.filter((_, index) => index !== indexToDelete))
  const handleChangeSubjectsInputField = (id: number, value: string) => {
    setInputSubjectField((prevItems) => {
      const updated = prevItems.map((item, idx) => (idx === id ? value : item))
      return updated
    })
  }

  return (
    <div className="min-h-screen bg-black text-gray-100 flex flex-col">
      <div className="flex flex-row justify-between items-center border-b border-gray-800 bg-gradient-to-r from-black to-gray-900 shadow-lg">
        <div className="h-12 w-1 bg-gradient-to-b from-green-500 to-green-600"></div>
        <h1 className="text-3xl font-bold text-center p-6 text-white flex-1">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setShowProfile((s) => !s)}
              className="m-4 mr-2 hover:bg-green-500/10 rounded-lg p-2 transition-colors text-gray-400 hover:text-green-400 flex items-center gap-2"
              aria-haspopup="true"
              aria-expanded={showProfile}
            >
              <User size={20} />
              <span className="hidden sm:inline">Profile</span>
            </button>
            {showProfile && (
              <div className="absolute right-0 mt-2 w-64 bg-gray-950 border border-gray-800 rounded-md shadow-lg p-4 text-sm text-gray-100 z-50">
                <div className="font-semibold text-white">{session?.user?.name ?? '—'}</div>
                <div className="text-gray-300 truncate">{session?.user?.email ?? '—'}</div>
                <div className="mt-2 text-xs text-gray-400">Role: {session?.user?.type ?? '—'}</div>
                <div className="mt-3">
                  <button
                    onClick={async () => {
                      setShowProfile(false)
                      await signOut()
                      router.push('/signin')
                    }}
                    className="w-full text-left bg-green-600 hover:bg-green-500 text-black px-3 py-1.5 rounded-md text-sm"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={async () => {
              await signOut()
              router.push("/signin")
            }}
            className="m-4 mr-8 hover:bg-green-500/10 rounded-lg p-2 transition-colors text-gray-400 hover:text-green-400"
            aria-label="Logout"
          >
            <LogOut size={24} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 items-start justify-center">
        <div className="flex flex-col md:flex-row gap-8 p-6 md:p-12 w-full">
          <div className="flex-1 h-full bg-gray-950 border border-gray-800 rounded-lg shadow-xl p-6 md:p-10 flex flex-col min-w-0 overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
              <h2 className="text-2xl font-semibold text-green-400 flex items-center gap-2">
                <div className="w-1 h-6 bg-green-500"></div>
                Manage Teachers
              </h2>
              <button
                className="bg-green-600 hover:bg-green-500 text-black px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 shadow-md hover:shadow-lg hover:shadow-green-500/30"
                onClick={openAddTeacher}
              >
                <Plus size={18} />
                Add
              </button>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Search teachers..."
                value={teacherSearch}
                onChange={handleTeacherSearch}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-sm lg:text-base text-gray-200">
                <thead className="sticky top-0 border-b border-gray-700 bg-gray-900/80 backdrop-blur">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-300">Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-300">Department</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-gray-500 text-center">
                        No teachers found.
                      </td>
                    </tr>
                  ) : (
                    filteredTeachers.map((t) => [
                      <tr
                        key={t.id}
                        className={`border-b border-gray-800 hover:bg-gray-900/60 transition cursor-pointer`}
                        onClick={(e) => {
                          if ((e.target as HTMLElement).tagName !== "BUTTON") {
                            setExpandedTeacher(expandedTeacher === t.id ? null : t.id)
                          }
                        }}
                      >
                        <td className="px-4 py-3 font-medium">{t.name}</td>
                        <td className="px-4 py-3 text-gray-400">{t.department}</td>
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-center gap-2">
                            <button
                              className="text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded p-1.5 transition-colors"
                              onClick={() => openEditTeacher(t)}
                              aria-label="Edit teacher"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              className="text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded p-1.5 transition-colors"
                              onClick={() => handleDeleteTeacher(t.id)}
                              aria-label="Delete teacher"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>,
                      expandedTeacher === t.id && (
                        <tr key={t.id + "-expand"}>
                          <td colSpan={3} className="bg-gray-900/50 border-t border-gray-800 px-6 py-4">
                            <div className="space-y-2 text-gray-300">
                              <div>
                                <span className="font-semibold text-green-400">Email:</span>{" "}
                                <span className="text-gray-400">{t.email}</span>
                              </div>
                              <div>
                                <span className="font-semibold text-green-400">Subjects:</span>
                                <span className="text-gray-400">
                                  {" "}
                                  {t.subject.map((subject, subIdx) => (
                                    <span key={subIdx}>
                                      {subject}
                                      {t.subject.length - 1 === subIdx ? "" : ", "}
                                    </span>
                                  ))}
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ),
                    ])
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex-1 h-full bg-gray-950 border border-gray-800 rounded-lg shadow-xl p-6 md:p-10 flex flex-col min-w-0 overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
              <h2 className="text-2xl font-semibold text-green-400 flex items-center gap-2">
                <div className="w-1 h-6 bg-green-500"></div>
                Approve Students
              </h2>
              <span className="text-sm text-gray-400">
                Pending: <span className="font-bold text-green-400">{students.filter((s) => !s.approved).length}</span>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={studentSearch}
                  onChange={handleStudentSearch}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="flex gap-2">
                <button
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${studentFilter === "all" ? "bg-green-600 text-black" : "bg-gray-900 text-gray-300 hover:bg-gray-800 border border-gray-700"}`}
                  onClick={() => setStudentFilter("all")}
                >
                  All
                </button>
                <button
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${studentFilter === "pending" ? "bg-green-600 text-black" : "bg-gray-900 text-gray-300 hover:bg-gray-800 border border-gray-700"}`}
                  onClick={() => setStudentFilter("pending")}
                >
                  Pending
                </button>
                <button
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${studentFilter === "approved" ? "bg-green-600 text-black" : "bg-gray-900 text-gray-300 hover:bg-gray-800 border border-gray-700"}`}
                  onClick={() => setStudentFilter("approved")}
                >
                  Approved
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-sm lg:text-base text-gray-200">
                <thead className="sticky top-0 border-b border-gray-700 bg-gray-900/80 backdrop-blur">
                  <tr>
                    <th className="py-3 px-4 text-left font-semibold text-gray-300">Name</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-300">Email</th>
                    <th className="py-3 px-4 text-center font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedStudents.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-gray-500 text-center">
                        No students found.
                      </td>
                    </tr>
                  ) : (
                    displayedStudents.map((s) => [
                      <tr
                        key={s.id}
                        className={`border-b border-gray-800 hover:bg-gray-900/60 transition cursor-pointer`}
                        onClick={(e) => {
                          if ((e.target as HTMLElement).tagName !== "BUTTON")
                            setExpandedStudent(expandedStudent === s.id ? null : s.id)
                        }}
                      >
                        <td className="px-4 py-3 font-medium">{s.name}</td>
                        <td className="px-4 py-3 text-gray-400">{s.email}</td>
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-center gap-2">
                            {!s.approved ? (
                              <>
                                <button
                                  className="text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded p-1.5 transition-colors"
                                  onClick={() => openStudentActionModal(s, "approve")}
                                  aria-label="Approve student"
                                >
                                  <CheckCircle2 size={18} />
                                </button>
                                <button
                                  className="text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded p-1.5 transition-colors"
                                  onClick={() => openStudentActionModal(s, "remove")}
                                  aria-label="Remove student"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </>
                            ) : (
                              <button
                                className="text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded p-1.5 transition-colors"
                                onClick={() => openStudentActionModal(s, "remove")}
                                aria-label="Remove student"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>,
                      expandedStudent === s.id && (
                        <tr key={s.id + "-expand"}>
                          <td colSpan={3} className="bg-gray-900/50 border-t border-gray-800 px-6 py-4">
                            <div className="space-y-2 text-gray-300">
                              <div>
                                <span className="font-semibold text-green-400">Email:</span>{" "}
                                <span className="text-gray-400">{s.email}</span>
                              </div>
                              <div>
                                <span className="font-semibold text-green-400">Status:</span>{" "}
                                <span className={s.approved ? "text-green-400" : "text-gray-400"}>
                                  {s.approved ? "Approved" : "Pending"}
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ),
                    ])
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {teacherModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setTeacherModalOpen(false)}
        >
          <div
            className="bg-gray-950 border border-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md relative max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1 w-full bg-gradient-to-r from-green-500 to-green-600 -m-8 mb-0 rounded-t-lg"></div>
            <h2 className="text-2xl font-semibold mb-6 mt-6 text-center text-green-400">
              {editingTeacherId !== null ? "Edit Teacher" : "Add Teacher"}
            </h2>
            <form onSubmit={handleTeacherFormSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-300 mb-2">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  value={teacherForm.name}
                  onChange={handleTeacherFormChange}
                  className="p-2.5 w-full bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="department" className="block text-sm font-semibold text-gray-300 mb-2">
                  Department
                </label>
                <input
                  id="department"
                  name="department"
                  value={teacherForm.department}
                  onChange={handleTeacherFormChange}
                  className="p-2.5 w-full bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <div className="flex flex-row justify-between mb-2">
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-300">
                    Subjects
                  </label>
                  <button
                    type="button"
                    className="hover:bg-green-500/10 rounded p-1 transition-colors text-green-400"
                    onClick={handleAddInput}
                  >
                    <Plus size={18}></Plus>
                  </button>
                </div>

                {inputSubjectField.map((field, index) => {
                  return (
                    <div key={index} className="flex flex-row gap-2 my-2">
                      <input
                        name={index.toString()}
                        value={field}
                        onChange={(e) => handleChangeSubjectsInputField(index, e.target.value)}
                        className="p-2.5 w-full bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                      {index > 0 && (
                        <button
                          type="button"
                          className="hover:bg-red-500/10 rounded p-1 transition-colors text-red-500"
                          onClick={() => handleSubInput(index)}
                        >
                          <Minus size={18}></Minus>
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  value={teacherForm.email}
                  onChange={handleTeacherFormChange}
                  className="p-2.5 w-full bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex items-center space-x-2 pt-4">
                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-500 text-black p-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg hover:shadow-green-500/30"
                >
                  {editingTeacherId !== null ? "Update Teacher" : "Add Teacher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {studentActionModal.open && studentActionModal.student && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={closeStudentActionModal}
        >
          <div
            className="bg-gray-950 border border-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1 w-full bg-gradient-to-r from-green-500 to-green-600 -m-8 mb-0 rounded-t-lg"></div>
            <h2 className="text-xl font-semibold mb-6 mt-6 text-center text-green-400">
              {studentActionModal.action === "approve" ? "Approve Student" : "Remove Student"}
            </h2>
            <div className="mb-6 text-gray-300 space-y-3">
              <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                <span className="font-semibold text-green-400">Name:</span>{" "}
                <span className="text-gray-400">{studentActionModal.student.name}</span>
              </div>
              <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                <span className="font-semibold text-green-400">Email:</span>{" "}
                <span className="text-gray-400">{studentActionModal.student.email}</span>
              </div>
              <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                <span className="font-semibold text-green-400">Status:</span>{" "}
                <span className={studentActionModal.student.approved ? "text-green-400" : "text-gray-400"}>
                  {studentActionModal.student.approved ? "Approved" : "Pending"}
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-4 py-2.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-200 font-medium transition-all border border-gray-700"
                onClick={closeStudentActionModal}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-500 text-black font-medium transition-all shadow-md hover:shadow-lg hover:shadow-green-500/30"
                onClick={confirmStudentAction}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
