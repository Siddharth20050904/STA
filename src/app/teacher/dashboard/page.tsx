"use client";
import React, { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BookCheck, Clock1, LogOut } from "lucide-react";
import { fetchAppointmentsByTeacher } from "@/app/api/appointment_manager/appointment_manager";

type Appointment = {
	id: string;
	student: string;
	subject: string;
	date: string;
	time: string;
	message?: string;
	status: "pending" | "upcoming" | "completed" | "cancelled";
	approvalStatus: boolean
};

const initialAppointments: Appointment[] = [];

export default function TeacherDashboard() {
	const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
	const [search, setSearch] = useState("");
	const [expanded, setExpanded] = useState<string | null>(null);

	const { data: session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === "unauthenticated") router.push("/signin");
		else if (session?.user.type === "STUDENT") {
			if (!session.user.isVerified) router.push("/request-verification");
			else router.push("/student/dashboard");
		} else if (session?.user.type === "ADMIN") router.push("/admin/dashboard");
	}, [session, router, status]);

	// Fetch the Appointments
	useEffect(()=>{
		if (status !== "authenticated" || !session?.user?.id) return;
		const fetchAppointmentFunc = async()=>{
			const fetchedAppointments = await fetchAppointmentsByTeacher(session.user.id);
			if(!fetchedAppointments) return
			setAppointments(fetchedAppointments.map((appointment)=>({
				id: appointment.id,
				student: appointment.studentName,
				subject: appointment.subject,
				date: new Date(appointment.time).toLocaleDateString(),
				time: new Date(appointment.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
				message: appointment.message,
				status: appointment.status,
				approvalStatus: appointment.approval
			})));
		}

		fetchAppointmentFunc();
	},[session, status]);

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value);

	const filteredAppointments = appointments.filter(
		(a) =>
			a.student.toLowerCase().includes(search.toLowerCase()) ||
			(a.subject || "").toLowerCase().includes(search.toLowerCase())
	);

	const updateStatus = (id: string, status: Appointment["status"]) => {
		setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
	};

	const approve = (id: string) => updateStatus(id, "upcoming");
	const cancel = (id: string) => updateStatus(id, "cancelled");
	const markComplete = (id: string) => updateStatus(id, "completed");

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-gray-100 flex flex-col">
			
			{/* Header */}
			<h1 className="flex flex-row justify-between items-center text-3xl font-bold text-center p-6 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 text-white shadow-md">
				<div></div>
				Teacher Dashboard
				<LogOut className='m-4 mr-8 hover:bg-gray-700 rounded cursor-pointer transition-colors text-gray-300' onClick={async()=>{ await signOut(); router.push('/signin') }}></LogOut>
			</h1>

			<div className="flex flex-1 justify-center items-start">
				<div className="flex flex-col md:flex-row gap-8 p-6 md:p-12 w-full h-[calc(100vh-0.5rem)]">
					
					{/* LEFT PANEL — Pending Requests */}
					<div className="flex-1 h-full bg-gradient-to-br from-gray-800 to-gray-750 border border-gray-700/70 rounded-xl shadow-2xl shadow-black/40 p-6 md:p-10 flex flex-col min-w-0 backdrop-blur-sm">
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-2xl font-semibold text-emerald-400">
								Appointments & Requests
							</h2>
						</div>

						<div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
							<input
								type="text"
								placeholder="Search pending requests..."
								value={search}
								onChange={handleSearch}
								className="p-2 bg-gray-700/70 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 flex-1"
							/>
						</div>

						<div className="flex-1 overflow-y-auto">
							<table className="w-full text-sm lg:text-base text-gray-200">
								<thead className="border-b border-gray-700 bg-gray-800/60">
									<tr>
										<th className="px-2 py-3 text-left">Student</th>
										<th className="px-2 py-3 text-left">Subject</th>
										<th className="px-2 py-3 text-left">Date</th>
										<th className="px-2 py-3 text-left">Time</th>
										<th className="px-2 py-3 text-center">Status</th>
									</tr>
								</thead>
								<tbody>
									{filteredAppointments.filter((a) => !a.approvalStatus).length === 0 ? (
										<tr>
											<td colSpan={5} className="py-6 text-gray-500 text-center">
												No pending requests.
											</td>
										</tr>
									) : (
										filteredAppointments
											.filter((a) => !a.approvalStatus)
											.map((a, idx) => (
												<React.Fragment key={a.id}>
													<tr
														className={`${
															idx % 2 === 0 ? "bg-gray-800/60" : "bg-gray-700/50"
														} hover:bg-gray-600/60 transition cursor-pointer`}
														onClick={() => setExpanded(expanded === a.id ? null : a.id)}
													>
														<td className="px-2 py-3 font-medium">{a.student}</td>
														<td className="px-2 py-3 text-gray-300">{a.subject}</td>
														<td className="px-2 py-3 text-gray-400">{a.date}</td>
														<td className="px-2 py-3 text-gray-400">{a.time}</td>
														<td title={a.approvalStatus? 'Approved': "Pending"} className={`flex justify-center px-2 py-2 text-center capitalize ${a.approvalStatus ? 'text-green-300': 'text-yellow-300'}`}>{a.approvalStatus? (<BookCheck/>):(<Clock1/>)}</td>
													</tr>
													{expanded === a.id && (
														<tr>
															<td colSpan={5} className="bg-gray-800/80 border-t border-gray-700 px-6 py-4 rounded-b-lg">
																<div className="space-y-1 text-gray-300">
																	<div><span className="font-semibold text-white">Student:</span> {a.student}</div>
																	<div><span className="font-semibold text-white">Subject:</span> {a.subject}</div>
																	<div><span className="font-semibold text-white">Date:</span> {a.date}</div>
																	<div><span className="font-semibold text-white">Time:</span> {a.time}</div>
																	{a.message && (
																		<div className="mt-2"><span className="font-semibold text-white">Message:</span> {a.message}</div>
																	)}
																</div>
																<div className="mt-4 flex gap-3">
																	{a.status === "pending" && (
																		<>
																			<button
																				onClick={() => approve(a.id)}
																				className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-all"
																			>
																				Approve
																			</button>
																			<button
																				onClick={() => cancel(a.id)}
																				className="bg-red-600 hover:bg-red-500 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-all"
																			>
																				Cancel
																			</button>
																		</>
																	)}
																	{a.status === "upcoming" && (
																		<button
																			onClick={() => markComplete(a.id)}
																			className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-all"
																		>
																			Mark Completed
																		</button>
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

					{/* RIGHT PANEL — Upcoming & Past */}
					<div className="flex-1 h-full bg-gradient-to-br from-gray-800 to-gray-750 border border-gray-700/70 rounded-xl shadow-2xl shadow-black/40 sm:p-10 p-6 flex flex-col min-w-0 overflow-y-auto backdrop-blur-sm">
						<h2 className="text-2xl font-semibold text-blue-400 mb-4">
							Upcoming Appointments
						</h2>
						<div className="flex-1 mb-8">
							<table className="w-full text-sm lg:text-base text-center text-gray-200">
								<thead className="border-b border-gray-700 bg-gray-800/60">
									<tr>
										<th className="py-3">Student</th>
										<th className="py-3">Date</th>
										<th className="py-3">Time</th>
									</tr>
								</thead>
								<tbody>
									{appointments.filter((a) => a.status === "upcoming").length === 0 ? (
										<tr>
											<td colSpan={3} className="py-6 text-gray-500">
												No upcoming appointments.
											</td>
										</tr>
									) : (
										appointments
											.filter((a) => a.status === "upcoming")
											.map((a, idx) => (
												<tr
													key={a.id}
													className={`${
														idx % 2 === 0 ? "bg-gray-800/60" : "bg-gray-700/50"
													}`}
												>
													<td className="px-2 py-3 font-medium">{a.student}</td>
													<td className="px-2 py-3">{a.date}</td>
													<td className="px-2 py-3">{a.time}</td>
												</tr>
											))
									)}
								</tbody>
							</table>
						</div>

						<h2 className="text-2xl font-semibold text-gray-200 mb-4">
							Past Appointments
						</h2>
						<div className="flex-1">
							<table className="w-full text-sm lg:text-base text-center text-gray-200">
								<thead className="border-b border-gray-700 bg-gray-800/60">
									<tr>
										<th className="py-3">Student</th>
										<th className="py-3">Date</th>
										<th className="py-3">Time</th>
										<th className="py-3">Status</th>
									</tr>
								</thead>
								<tbody>
									{appointments.filter((a) => a.status === "completed" || a.status === "cancelled")
										.length === 0 ? (
										<tr>
											<td colSpan={4} className="py-6 text-gray-500">
												No past appointments.
											</td>
										</tr>
									) : (
										appointments
											.filter((a) => a.status === "completed" || a.status === "cancelled")
											.map((a, idx) => (
												<tr
													key={a.id}
													className={`${
														idx % 2 === 0 ? "bg-gray-800/60" : "bg-gray-700/50"
													}`}
												>
													<td className="px-2 py-3 font-medium">{a.student}</td>
													<td className="px-2 py-3">{a.date}</td>
													<td className="px-2 py-3">{a.time}</td>
													<td
														className={`px-2 py-3 capitalize ${
															a.status === "completed"
																? "text-emerald-400"
																: "text-red-400"
														}`}
													>
														{a.status}
													</td>
												</tr>
											))
									)}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
