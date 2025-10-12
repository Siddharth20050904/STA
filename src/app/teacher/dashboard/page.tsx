"use client";
import React, { useEffect, useState } from "react";
import StudentsNavbar from "@/app/components/students_navbar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Appointment = {
	id: number;
	student: string;
	subject: string;
	date: string;
	time: string;
	message?: string;
	status: "pending" | "upcoming" | "completed" | "cancelled";
};

const initialAppointments: Appointment[] = [
	{ id: 1, student: "Alice Brown", subject: "Calculus", date: "2025-10-05", time: "10:00", message: "Need help with integrals", status: "pending" },
	{ id: 2, student: "Bob Green", subject: "Physics", date: "2025-09-28", time: "09:00", message: "Discuss lab report", status: "completed" },
	{ id: 3, student: "Charlie Blue", subject: "Chemistry", date: "2025-10-10", time: "11:30", message: "Clarify titration procedure", status: "upcoming" },
];

export default function TeacherDashboard() {
	const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);

	const [search, setSearch] = useState("");
	// left panel now only shows pending requests; no filter state needed here
	const [expanded, setExpanded] = useState<number | null>(null);

	const { data: session, status } = useSession();
	const router = useRouter();

	useEffect(()=>{
		if(status === 'unauthenticated') router.push('/signin');
		else if(session?.user.type === 'STUDENT'){
			if(!session.user.isVerified) router.push('/request-verification');
			else router.push('/student/dashboard');
		}
		else if(session?.user.type === 'ADMIN') router.push('/admin/dashboard');
	}, [session, router, status]);

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value);

	const filteredAppointments = appointments.filter(a =>
		a.student.toLowerCase().includes(search.toLowerCase()) || (a.subject || "").toLowerCase().includes(search.toLowerCase())
	);
	const displayedAppointments = filteredAppointments; // left panel shows pending requests filtered below

	const updateStatus = (id: number, status: Appointment["status"]) => {
		setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
	};

	const approve = (id: number) => updateStatus(id, "upcoming");
	const cancel = (id: number) => updateStatus(id, "cancelled");
	const markComplete = (id: number) => updateStatus(id, "completed");

	return (
		<div className="min-h-screen bg-blue-300 flex flex-col text-black">
			<StudentsNavbar />
			<h1 className="text-3xl font-bold text-center p-4 bg-blue-300">Teacher Dashboard</h1>
			<div className="flex flex-1 items-start justify-center">
				<div className="flex flex-col md:flex-row gap-8 p-4 md:p-12 bg-blue-300 rounded-lg w-full h-[calc(100vh-0.5rem)]">
					<div className="flex-1 h-full bg-blue-50 rounded-xl shadow-md p-6 md:p-10 flex flex-col min-w-0 border-r border-gray-200">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-2xl font-semibold text-black">Appointments (Requests & All)</h2>
						</div>

						<div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
							<input type="text" placeholder="Search pending requests by student or subject..." value={search} onChange={handleSearch} className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 flex-1" />
						</div>

						<div className="flex-1 overflow-y-auto">
							<table className="w-full text-sm lg:text-lg">
								<thead>
									<tr>
										<th className="px-2 py-2 text-left text-black">Student</th>
										<th className="px-2 py-2 text-left text-black">Subject</th>
										<th className="px-2 py-2 text-left text-black">Date</th>
										<th className="px-2 py-2 text-left text-black">Time</th>
										<th className="px-2 py-2 text-center text-black">Status</th>
									</tr>
								</thead>
								<tbody>
									{displayedAppointments.filter(a => a.status === 'pending').length === 0 ? (
											<tr><td colSpan={5} className="py-6 text-gray-500 text-center">No pending requests.</td></tr>
										) : displayedAppointments.filter(a => a.status === 'pending').map((a, idx) => (
										<React.Fragment key={a.id}>
											<tr className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-100'} style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === a.id ? null : a.id)}>
												<td className="px-2 py-2 font-medium">{a.student}</td>
												<td className="px-2 py-2 text-gray-600">{a.subject}</td>
												<td className="px-2 py-2 text-gray-500 text-sm">{a.date}</td>
												<td className="px-2 py-2 text-gray-500 text-sm">{a.time}</td>
												<td className="px-2 py-2 text-center capitalize">{a.status}</td>
											</tr>
											{expanded === a.id && (
												<tr>
													<td colSpan={5} className="bg-gray-50 text-left px-6 py-4 border-t">
														<div><span className="font-semibold">Student:</span> {a.student}</div>
														<div><span className="font-semibold">Subject:</span> {a.subject}</div>
														<div><span className="font-semibold">Date:</span> {a.date}</div>
														<div><span className="font-semibold">Time:</span> {a.time}</div>
														<div><span className="font-semibold">Status:</span> {a.status}</div>
														{a.message && <div className="mt-2"><span className="font-semibold">Message:</span> {a.message}</div>}
														<div className="mt-3 flex gap-2">
															{a.status === 'pending' && (
																<>
																	<button onClick={() => approve(a.id)} className="bg-green-600 text-white px-3 py-1 rounded-md text-sm">Approve</button>
																	<button onClick={() => cancel(a.id)} className="bg-red-600 text-white px-3 py-1 rounded-md text-sm">Cancel</button>
																</>
															)}
															{a.status === 'upcoming' && (
																<button onClick={() => markComplete(a.id)} className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm">Mark Completed</button>
															)}
														</div>
													</td>
												</tr>
											)}
										</React.Fragment>
									))}
								</tbody>
							</table>
						</div>
					</div>

					<div className="flex-1 h-full bg-white rounded-xl shadow-md sm:p-10 p-6 flex flex-col min-w-0 overflow-y-auto">
						<h2 className="text-2xl font-semibold text-black mb-4">Upcoming Appointments</h2>
						<div className="flex-1 mb-8">
							<table className="w-full text-sm lg:text-lg text-center">
								<thead>
									<tr>
										<th className="py-2 text-black">Student</th>
										<th className="py-2 text-black">Date</th>
										<th className="py-2 text-black">Time</th>
									</tr>
								</thead>
								<tbody>
									{appointments.filter(a => a.status === "upcoming").length === 0 ? (
										<tr><td colSpan={3} className="py-6 text-gray-500">No upcoming appointments.</td></tr>
									) : appointments.filter(a => a.status === "upcoming").map((a, idx) => (
										<tr key={a.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-100'}>
											<td className="px-2 py-2 font-medium">{a.student}</td>
											<td className="px-2 py-2">{a.date}</td>
											<td className="px-2 py-2">{a.time}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						<h2 className="text-2xl font-semibold text-black mb-4">Past Appointments</h2>
						<div className="flex-1">
							<table className="w-full text-sm lg:text-lg text-center">
								<thead>
									<tr>
										<th className="py-2 text-black">Student</th>
										<th className="py-2 text-black">Date</th>
										<th className="py-2 text-black">Time</th>
										<th className="py-2 text-black">Status</th>
									</tr>
								</thead>
								<tbody>
									{appointments.filter(a => a.status === "completed" || a.status === "cancelled").length === 0 ? (
										<tr><td colSpan={4} className="py-6 text-gray-500">No past appointments.</td></tr>
									) : appointments.filter(a => a.status === "completed" || a.status === "cancelled").map((a, idx) => (
										<tr key={a.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-100'}>
											<td className="px-2 py-2 font-medium">{a.student}</td>
											<td className="px-2 py-2">{a.date}</td>
											<td className="px-2 py-2">{a.time}</td>
											<td className="px-2 py-2 capitalize">{a.status}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

