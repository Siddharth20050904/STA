'use client';
import React, { useState } from 'react';

import Image from 'next/image';
import AdminNav from '../../components/admin_nav';


type Teacher = {
    id: number;
    name: string;
    department: string;
    subject: string;
};

type Student = {
    id: number;
    name: string;
    email: string;
    approved: boolean;
};

const initialTeachers: Teacher[] = [
    { id: 1, name: 'John Doe', department: 'Math', subject: 'Algebra' },
    { id: 2, name: 'Jane Smith', department: 'Science', subject: 'Physics' },
];

const initialStudents: Student[] = [
    { id: 1, name: 'Alice', email: 'alice@email.com', approved: false },
    { id: 2, name: 'Bob', email: 'bob@email.com', approved: false },
];

export default function AdminDashboard() {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <AdminNav />
            <div className="flex flex-1">
                {/* Left SVG Pane */}
                <div className="hidden lg:flex items-center justify-center flex-1 bg-white text-black">
                                        <div className="max-w-md text-center">
                                                <Image src="/image.png" alt="Admin dashboard illustration" width={400} height={400} className="mx-auto" />
                                        </div>
                                </div>
                {/* Right Message Pane */}
                <div className="w-full bg-gray-100 lg:w-1/2 flex items-center justify-center">
                    <div className="max-w-md w-full p-6">
                        <h1 className="text-3xl font-semibold mb-6 text-black text-center">Admin Dashboard</h1>
                        <div className="space-y-4 bg-gray-50 p-6 rounded-lg shadow-md text-black text-center">
                            <p>Welcome to the Admin Dashboard.</p>
                            <p>Use the navigation to manage students and teachers.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}