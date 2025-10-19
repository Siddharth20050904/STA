"use client";
import React, { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { fetchAllTeachers } from "@/app/api/teacher_manager/teacher_manager";
import { addAppointment, fetchAppointments } from "@/app/api/appointment_manager/appointment_manager";

type Appointment = {
    id: string;
    teacher: string;
    subject: string;
    date: string;
    time: string;
    message?: string;
    status: "upcoming" | "completed" | "cancelled";
};

type Teacher = {
    id: string;
    name: string;
    subjects : string[];
    department : string;
};

export default function StudentDashboard() {
    const router = useRouter();
    const {data: session, status} = useSession();
    const [appointments, setAppointments] = useState<Appointment[]>([]);

    // Left panel: interactive appointment list (search/filter/expand/add)
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "upcoming" | "completed" | "cancelled">("upcoming");
    const [expanded, setExpanded] = useState<string | null>(null);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    // Add appointment modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState<{ teacher: string; subject: string; date: string; time: string; message: string }>({ teacher: "", subject: "", date: "", time: "", message: "" });
    
    // Teacher filter state
    const [teacherSearch, setTeacherSearch] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value);
    const filteredAppointments = appointments.filter(a =>
        a.teacher.toLowerCase().includes(search.toLowerCase()) || (a.subject || "").toLowerCase().includes(search.toLowerCase())
    );
    let displayedAppointments = filteredAppointments;
    if (filter !== "all") displayedAppointments = filteredAppointments.filter(a => a.status === filter);

    // Filtered teachers based on search
    const filteredTeachers = teachers.filter(teacher =>
        teacher.name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
        teacher.department.toLowerCase().includes(teacherSearch.toLowerCase()) ||
        teacher.subjects.some(subject => subject.toLowerCase().includes(teacherSearch.toLowerCase()))
    );

    useEffect(()=>{
        if(status === 'unauthenticated') router.push('/signin');
        else if(session?.user.type === 'STUDENT' && !session?.user.isVerified) router.push('/verification-request');
        else if(session?.user.type === 'ADMIN') router.push('/admin/dashboard');
        else if(session?.user.type === 'TEACHER') router.push('/teacher/dashboard');
    }, [session, router, status]);

    //Fetch all Teachers
    useEffect(()=>{
        const fetchAllTeachersFunc = async()=>{
            const fetchedTeachers = await fetchAllTeachers();
            if(fetchedTeachers)
                setTeachers(fetchedTeachers.map((teacher)=>({
                    name: teacher.name, id: teacher.id, department: teacher.department, subjects: teacher.subjects
                })));
        }

        fetchAllTeachersFunc();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch All Meetings from This student
    useEffect(()=>{
      if (status !== "authenticated" || !session?.user?.id) return;
      const fetchAllAppointments = async()=>{
        const fetchedAppointments = await fetchAppointments(session.user.id);
        if(fetchedAppointments)
          setAppointments(
            fetchedAppointments.map((appointment) => ({
              id: appointment.id,
              teacher: appointment.teacher.name,
              subject: appointment.subject,
              date: new Date(appointment.time).toLocaleDateString(),
              time: new Date(appointment.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              message: appointment.message,
              status: appointment.status,
            }))
          );
      }
      fetchAllAppointments();
    }, [session, status]);

    const openAddModal = () => {
        setForm({ teacher: "", subject: "", date: "", time: "", message: "" });
        setTeacherSearch("");
        setModalOpen(true);
    };
    const closeAddModal = () => {
        setModalOpen(false);
        setTeacherSearch("");
        setShowDropdown(false);
    };
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [e.target.name]: e.target.value });
    const handleTeacherSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTeacherSearch(e.target.value);
        setShowDropdown(true);
    };
    
    const selectTeacher = (teacherId: string, teacherName: string) => {
        setForm({ ...form, teacher: teacherId });
        setTeacherSearch(teacherName);
        setShowDropdown(false);
    };

    const handleFormSubmit = async(e: React.FormEvent) => {
        e.preventDefault();
        const combinedTimeString = `${form.date}T${form.time}:00`;
        const combinedTime = new Date(combinedTimeString).toISOString();

        const addedAppointment = await addAppointment({teacherId: form.teacher, studentId: session!.user.id, time: combinedTime, subject: form.subject});
        if(!addedAppointment){
          alert("Error in Adding Appointment");
          return;
        }
        setAppointments([
            ...appointments,
            { id: addedAppointment.id, teacher: form.teacher, subject: form.subject, date: form.date, time: form.time, message: form.message, status: "upcoming" },
        ]);
        setModalOpen(false);
        setForm({ teacher: "", subject: "", date: "", time: "", message: "" });
        setTeacherSearch("");
    };

   return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 flex flex-col text-gray-100">
      <h1 className="text-3xl font-bold text-center p-4 bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100">
        Student Dashboard
      </h1>
      <div className="flex flex-1 items-start justify-center">
        <div className="flex flex-col md:flex-row gap-8 p-4 md:p-12 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg w-full h-[calc(100vh-0.5rem)]">
          <div className="flex-1 h-full bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg p-6 md:p-10 flex flex-col min-w-0 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-100">Appointments</h2>
              <button
                className="bg-emerald-400 text-gray-950 px-3 py-1 rounded-md text-sm hover:bg-emerald-300 font-semibold transition-colors"
                onClick={openAddModal}
              >
                Add
              </button>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
              <input
                type="text"
                placeholder="Search appointments..."
                value={search}
                onChange={handleSearch}
                className="p-2 bg-gray-700/50 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 flex-1 transition-colors"
              />
              <div className="flex flex-wrap flex-row gap-2 mt-2 md:mt-0 md:ml-4">
                <button
                  className={`px-3 py-1 rounded-md text-sm border transition-colors ${filter === "all" ? "bg-emerald-400 text-gray-950 border-emerald-400 font-semibold" : "bg-gray-700/50 text-gray-100 border-gray-600 hover:border-gray-500"}`}
                  onClick={() => setFilter("all")}
                >
                  All
                </button>
                <button
                  className={`px-3 py-1 rounded-md text-sm border transition-colors ${filter === "upcoming" ? "bg-yellow-500 text-gray-950 border-yellow-500 font-semibold" : "bg-gray-700/50 text-gray-100 border-gray-600 hover:border-gray-500"}`}
                  onClick={() => setFilter("upcoming")}
                >
                  Upcoming
                </button>
                <button
                  className={`px-3 py-1 rounded-md text-sm border transition-colors ${filter === "completed" ? "bg-emerald-500 text-gray-950 border-emerald-500 font-semibold" : "bg-gray-700/50 text-gray-100 border-gray-600 hover:border-gray-500"}`}
                  onClick={() => setFilter("completed")}
                >
                  Completed
                </button>
                <button
                  className={`px-3 py-1 rounded-md text-sm border transition-colors ${filter === "cancelled" ? "bg-red-500 text-gray-950 border-red-500 font-semibold" : "bg-gray-700/50 text-gray-100 border-gray-600 hover:border-gray-500"}`}
                  onClick={() => setFilter("cancelled")}
                >
                  Cancelled
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-sm lg:text-lg">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-2 py-2 text-left text-gray-100 font-semibold">Teacher</th>
                    <th className="px-2 py-2 text-left text-gray-100 font-semibold">Subject</th>
                    <th className="px-2 py-2 text-left text-gray-100 font-semibold">Date</th>
                    <th className="px-2 py-2 text-left text-gray-100 font-semibold">Time</th>
                    <th className="px-2 py-2 text-center text-gray-100 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-gray-400 text-center">
                        No appointments.
                      </td>
                    </tr>
                  ) : (
                    displayedAppointments.map((a, idx) => (
                      <React.Fragment key={a.id}>
                        <tr
                          className={idx % 2 === 0 ? "bg-gray-800" : "bg-gray-700/50"}
                          style={{ cursor: "pointer" }}
                          onClick={() => setExpanded(expanded === a.id ? null : a.id)}
                        >
                          <td className="px-2 py-2 font-medium text-gray-100">{a.teacher}</td>
                          <td className="px-2 py-2 text-gray-300">{a.subject}</td>
                          <td className="px-2 py-2 text-gray-400 text-sm">{a.date}</td>
                          <td className="px-2 py-2 text-gray-400 text-sm">{a.time}</td>
                          <td className="px-2 py-2 text-center capitalize text-gray-100">{a.status}</td>
                        </tr>
                        {expanded === a.id && (
                          <tr className="bg-gray-700/30 border-t border-gray-700">
                            <td colSpan={5} className="text-left px-6 py-4">
                              <div className="text-gray-100">
                                <span className="font-semibold">Teacher:</span> {a.teacher}
                              </div>
                              <div className="text-gray-100">
                                <span className="font-semibold">Subject:</span> {a.subject}
                              </div>
                              <div className="text-gray-100">
                                <span className="font-semibold">Date:</span> {a.date}
                              </div>
                              <div className="text-gray-100">
                                <span className="font-semibold">Time:</span> {a.time}
                              </div>
                              <div className="text-gray-100">
                                <span className="font-semibold">Status:</span> {a.status}
                              </div>
                              {a.message && (
                                <div className="text-gray-100">
                                  <span className="font-semibold">Message:</span> {a.message}
                                </div>
                              )}
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
          <div className="flex-1 h-full bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg sm:p-10 p-6 flex flex-col min-w-0 overflow-y-auto border border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-100 mb-4">Upcoming Appointments</h2>
            <div className="flex-1 mb-8">
              <table className="w-full text-sm lg:text-lg text-center">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="py-2 text-gray-100 font-semibold">Teacher</th>
                    <th className="py-2 text-gray-100 font-semibold">Date</th>
                    <th className="py-2 text-gray-100 font-semibold">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.filter((a) => a.status === "upcoming").length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-6 text-gray-400">
                        No upcoming appointments.
                      </td>
                    </tr>
                  ) : (
                    appointments
                      .filter((a) => a.status === "upcoming")
                      .map((a, idx) => (
                        <tr key={a.id} className={idx % 2 === 0 ? "bg-gray-800" : "bg-gray-700/50"}>
                          <td className="px-2 py-2 font-medium text-gray-100">{a.teacher}</td>
                          <td className="px-2 py-2 text-gray-300">{a.date}</td>
                          <td className="px-2 py-2 text-gray-300">{a.time}</td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
            <h2 className="text-2xl font-semibold text-gray-100 mb-4">Appointment History</h2>
            <div className="flex-1">
              <table className="w-full text-sm lg:text-lg text-center">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="py-2 text-gray-100 font-semibold">Teacher</th>
                    <th className="py-2 text-gray-100 font-semibold">Date</th>
                    <th className="py-2 text-gray-100 font-semibold">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.filter((a) => a.status === "completed").length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-6 text-gray-400">
                        No past appointments.
                      </td>
                    </tr>
                  ) : (
                    appointments
                      .filter((a) => a.status === "completed")
                      .map((a, idx) => (
                        <tr key={a.id} className={idx % 2 === 0 ? "bg-gray-800" : "bg-gray-700/50"}>
                          <td className="px-2 py-2 font-medium text-gray-100">{a.teacher}</td>
                          <td className="px-2 py-2 text-gray-300">{a.date}</td>
                          <td className="px-2 py-2 text-gray-300">{a.time}</td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {modalOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
              onClick={closeAddModal}
            >
              <div
                className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md relative border border-gray-700"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-semibold mb-4 text-center text-gray-100">Add Appointment</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="teacher" className="block text-sm font-medium text-gray-100 mb-1">
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
                        className="p-2 w-full bg-gray-700/50 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-colors"
                        required
                      />
                      {showDropdown && filteredTeachers.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
                          {filteredTeachers.map((teacher) => (
                            <div
                              key={teacher.id}
                              onClick={() => selectTeacher(teacher.id, teacher.name)}
                              className="p-2 hover:bg-gray-600 cursor-pointer text-gray-100 transition-colors"
                            >
                              <div className="font-medium">{teacher.name} | {teacher.department}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-100">
                      Subject
                    </label>
                    <input
                      id="subject"
                      name="subject"
                      value={form.subject}
                      onChange={handleFormChange}
                      className="mt-1 p-2 w-full bg-gray-700/50 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-100">
                      Date
                    </label>
                    <input
                      id="date"
                      name="date"
                      type="date"
                      value={form.date}
                      onChange={handleFormChange}
                      className="mt-1 p-2 w-full bg-gray-700/50 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-100">
                      Time
                    </label>
                    <input
                      id="time"
                      name="time"
                      type="time"
                      value={form.time}
                      onChange={handleFormChange}
                      className="mt-1 p-2 w-full bg-gray-700/50 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-100">
                      Message / Description
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={form.message}
                      onChange={handleFormChange}
                      className="mt-1 p-2 w-full bg-gray-700/50 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-colors"
                      required
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleFormSubmit}
                      className="w-full bg-emerald-400 text-gray-950 font-semibold p-2 rounded-md hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-colors duration-300"
                    >
                      Add Appointment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}