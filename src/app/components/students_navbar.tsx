
'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function StudentsNavbar() {
	const [open, setOpen] = useState(false);
	const pathname = usePathname();

	// Navigation links
	const navLinks = [
		{ name: 'Dashboard', href: '/student/dashboard', icon: (
			<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" /></svg>
		) },
		{ name: 'Log Out', href: '/logout', icon: (
			<Image src="/logout.svg" alt="logout" width={18} height={18} className="mr-2" />
		) },
	];

	return (
		<>
			{/* Hamburger Button (always visible) */}
			<button
				className="fixed top-4 left-4 z-50 p-2 rounded-md bg-black text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
				onClick={() => setOpen(true)}
				aria-label="Open navigation menu"
			>
				<svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
			</button>

			{/* Overlay and Sidebar for all screens */}
			{open && (
				<>
					{/* Blurred overlay */}
					<div
						className="fixed inset-0 z-40 bg-blur bg-opacity-30 backdrop-blur transition-opacity duration-300"
						onClick={() => setOpen(false)}
					/>
					{/* Sidebar */}
					<nav className="fixed top-0 left-0 z-50 w-64 h-full bg-white shadow-lg flex flex-col animate-slide-in">
						<div className="flex items-center justify-between h-20 px-6 border-b border-gray-100">
							<span className="text-2xl font-bold text-black">Student</span>
							<button
								className="p-2 rounded-md text-black hover:bg-gray-200 focus:outline-none"
								onClick={() => setOpen(false)}
								aria-label="Close navigation menu"
							>
								<svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
							</button>
						</div>
						<ul className="flex-1 px-4 py-8 space-y-2">
							{navLinks.map(link => (
								<li key={link.href}>
									<Link
										href={link.href}
										className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${pathname === link.href ? 'bg-black text-white' : 'text-black hover:bg-gray-200'}`}
										onClick={() => setOpen(false)}
									>
										{link.icon}{link.name}
									</Link>
								</li>
							))}
						</ul>
					</nav>
				</>
			)}
		</>
	);
}

// Add slide-in animation for mobile sidebar
// You can add this to your global CSS (e.g., globals.css):
// @keyframes slide-in { from { transform: translateX(-100%); } to { transform: translateX(0); } }
// .animate-slide-in { animation: slide-in 0.2s ease-out; }
