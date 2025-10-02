
'use client';
import React, { useState } from 'react';

type Appointment = {
	id: number;
	teacher: string;
	subject: string;
	date: string;
	time: string;
	message: string;
	status: 'upcoming' | 'completed' | 'cancelled';
};

const initialAppointments: Appointment[] = [
    { id: 1, teacher: 'John Doe', subject: 'Algebra', date: '2025-10-05', time: '10:00', message: 'Discuss algebra homework', status: 'upcoming' },
    { id: 2, teacher: 'Jane Smith', subject: 'Physics', date: '2025-10-07', time: '14:00', message: 'Doubt clearing session', status: 'upcoming' },
];


export default function StudentAppointments() {
	const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
	const [search, setSearch] = useState('');
	const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('upcoming');
	const [expanded, setExpanded] = useState<number | null>(null);

	// Add appointment modal state
	const [modalOpen, setModalOpen] = useState(false);
	const [form, setForm] = useState<{ teacher: string; subject: string; date: string; time: string; message: string }>({ teacher: '', subject: '', date: '', time: '', message: '' });

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value);
	const filteredAppointments = appointments.filter(a =>
		(a.teacher.toLowerCase().includes(search.toLowerCase()) || a.subject.toLowerCase().includes(search.toLowerCase()))
	);
	let displayedAppointments = filteredAppointments;
	if (filter !== 'all') {
		displayedAppointments = filteredAppointments.filter(a => a.status === filter);
	}

	const openAddModal = () => {
		setForm({ teacher: '', subject: '', date: '', time: '', message: '' });
		setModalOpen(true);
	};
	const closeAddModal = () => setModalOpen(false);
	const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [e.target.name]: e.target.value });
	const handleFormSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setAppointments([
			...appointments,
			{
				id: Date.now(),
				teacher: form.teacher,
				subject: form.subject,
				date: form.date,
				time: form.time,
				message: form.message,
				status: 'upcoming',
			},
		]);
		setModalOpen(false);
		setForm({ teacher: '', subject: '', date: '', time: '', message: '' });
	};

	return (
		<div className="min-h-screen bg-white flex flex-col text-black">
			<h1 className="text-3xl font-bold text-center p-4">My Appointments</h1>
			<div className="flex flex-1 mt-4 items-start justify-center">
				<div className="flex flex-col md:flex-row gap-8 p-4 md:p-12 bg-gray-100 rounded-lg w-full h-[calc(100vh-0.5rem)]">
					{/* Appointment List (Left) */}
					<div className="flex-1 h-full bg-white rounded-none shadow-md p-6 md:p-10 flex flex-col min-w-0 overflow-y-auto border-r border-gray-200">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-2xl font-semibold text-black">Upcoming Appointments</h2>
							<button className="bg-black text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800" onClick={openAddModal}>Add</button>
						</div>
						{/* Search bar and filter */}
						<div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
							<input type="text" placeholder="Search appointments..." value={search} onChange={handleSearch} className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 flex-1" />
							<div className="flex gap-2 mt-2 sm:mt-0">
								<button
									className={`px-3 py-1 rounded-md text-sm border ${filter === 'all' ? 'bg-black text-white' : 'bg-white text-black border-gray-300'}`}
									onClick={() => setFilter('all')}
								>All</button>
								<button
									className={`px-3 py-1 rounded-md text-sm border ${filter === 'upcoming' ? 'bg-yellow-600 text-white' : 'bg-white text-black border-gray-300'}`}
									onClick={() => setFilter('upcoming')}
								>Upcoming</button>
								<button
									className={`px-3 py-1 rounded-md text-sm border ${filter === 'completed' ? 'bg-green-700 text-white' : 'bg-white text-black border-gray-300'}`}
									onClick={() => setFilter('completed')}
								>Completed</button>
								<button
									className={`px-3 py-1 rounded-md text-sm border ${filter === 'cancelled' ? 'bg-red-600 text-white' : 'bg-white text-black border-gray-300'}`}
									onClick={() => setFilter('cancelled')}
								>Cancelled</button>
							</div>
						</div>
						{/* Appointment Table */}
						<div className="flex-1">
							<table className="w-full text-sm lg:text-lg text-center">
								<thead>
									<tr>
										<th className="py-2 text-black">Teacher</th>
										<th className="py-2 text-black">Subject</th>
										<th className="py-2 text-black">Date</th>
										<th className="py-2 text-black">Time</th>
										<th className="py-2 text-black">Status</th>
									</tr>
								</thead>
								<tbody>
									{displayedAppointments.length === 0 ? (
										<tr><td colSpan={5} className="py-6 text-gray-500">No appointments found.</td></tr>
									) : displayedAppointments.map((a, idx) => [
										<tr
											key={a.id}
											className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-100'}
											onClick={e => {
												if ((e.target as HTMLElement).tagName !== 'BUTTON') setExpanded(expanded === a.id ? null : a.id);
											}}
											style={{ cursor: 'pointer' }}
										>
											<td className="px-2 py-2">{a.teacher}</td>
											<td className="px-2 py-2">{a.subject}</td>
											<td className="px-2 py-2">{a.date}</td>
											<td className="px-2 py-2">{a.time}</td>
											<td className="px-2 py-2 capitalize">{a.status}</td>
										</tr>,
										expanded === a.id && (
											<tr key={a.id + '-expand'}>
												<td colSpan={5} className="bg-gray-50 text-left px-6 py-4 border-t">
													<div><span className="font-semibold">Teacher:</span> {a.teacher}</div>
													<div><span className="font-semibold">Subject:</span> {a.subject}</div>
													<div><span className="font-semibold">Date:</span> {a.date}</div>
													<div><span className="font-semibold">Time:</span> {a.time}</div>
													<div><span className="font-semibold">Status:</span> {a.status}</div>
													<div><span className="font-semibold">Message:</span> {a.message}</div>
												</td>
											</tr>
										)
									])}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
			{/* Modal for Add Appointment */}
			{modalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-blur bg-opacity-40 backdrop-blur-sm" onClick={closeAddModal}>
					<div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md relative" onClick={e => e.stopPropagation()}>
						<h2 className="text-2xl font-semibold mb-4 text-center text-black">Add Appointment</h2>
						<form onSubmit={handleFormSubmit} className="space-y-4">
							<div>
								<label htmlFor="teacher" className="block text-sm font-medium text-black">Teacher</label>
								<input id="teacher" name="teacher" value={form.teacher} onChange={handleFormChange} className="mt-1 p-2 w-full border rounded-md focus:border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300" required />
							</div>
							<div>
								<label htmlFor="subject" className="block text-sm font-medium text-black">Subject</label>
								<input id="subject" name="subject" value={form.subject} onChange={handleFormChange} className="mt-1 p-2 w-full border rounded-md focus:border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300" required />
							</div>
							<div>
								<label htmlFor="date" className="block text-sm font-medium text-black">Date</label>
								<input id="date" name="date" type="date" value={form.date} onChange={handleFormChange} className="mt-1 p-2 w-full border rounded-md focus:border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300" required />
							</div>
							<div>
								<label htmlFor="time" className="block text-sm font-medium text-black">Time</label>
								<input id="time" name="time" type="time" value={form.time} onChange={handleFormChange} className="mt-1 p-2 w-full border rounded-md focus:border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300" required />
							</div>
							<div>
								<label htmlFor="message" className="block text-sm font-medium text-black">Message / Description</label>
								<textarea id="message" name="message" value={form.message} onChange={handleFormChange} className="mt-1 p-2 w-full border rounded-md focus:border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300" required rows={3} />
							</div>
							<div className="flex items-center space-x-2">
								<button type="submit" className="w-full bg-black text-white p-2 rounded-md hover:bg-gray-800 focus:outline-none focus:bg-black focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors duration-300">
									Add Appointment
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
