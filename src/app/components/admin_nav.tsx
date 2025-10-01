'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState, useRef, useEffect } from 'react';

const navLinks = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/manage_teachers', label: 'Manage Teachers' },
    { href: '/admin/manage_students', label: 'Student Approvals' },
];

export default function AdminNav() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (open && menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);

    return (
        <div className="z-50 w-full">
            {/* Sidebar toggle always on the left, not full width */}
            <div className="top-0 left-0 z-40 flex items-center h-16 bg-white border-b border-gray-300 w-full mb-4">
                <button
                    aria-label="Open Menu"
                    className="inline-flex items-center justify-center p-2 ml-2 rounded-md text-gray-700 hover:text-black hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-900"
                    onClick={() => setOpen((v) => !v)}
                >
                    <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    </svg>
                </button>
                <span className="ml-4 text-xl font-bold text-gray-900 hidden md:block">Admin Panel</span>
            </div>
            {/* Full-width navbar overlay, sidebar content left-aligned */}
            {open && (
                <div className="fixed inset-0 z-50 flex" style={{height: '100vh'}}>
                    {/* Sidebar content */}
                    <div
                        className="w-64 bg-white border-r border-gray-200 shadow-lg h-full flex flex-col" 
                        style={{marginBottom: '2rem', marginTop: '0.5rem', borderRadius: '0 0 1rem 0'}}
                        ref={menuRef}
                    >
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <span className="text-lg font-bold text-gray-900">Menu</span>
                            <button
                                aria-label="Close Menu"
                                className="p-2 rounded-md text-gray-700 hover:text-black hover:bg-gray-200 focus:outline-none"
                                onClick={() => setOpen(false)}
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <ul className="flex flex-col py-2">
                            {navLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className={`block px-6 py-3 text-base font-medium rounded-md transition-colors duration-200 ${
                                            pathname === link.href
                                                ? 'bg-gray-200 text-black shadow'
                                                : 'text-gray-700 hover:bg-gray-200 hover:text-black'
                                        }`}
                                        onClick={() => setOpen(false)}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    {/* Overlay area (click to close) */}
                    <div className="flex-1 h-full bg-blur bg-opacity-40 backdrop-blur-sm " onClick={() => setOpen(false)} />
                </div>
            )}
        </div>
    );
}