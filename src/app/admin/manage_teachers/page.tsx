'use client';
import React, { useState, useEffect } from 'react';
import AdminNav from '../../components/admin_nav';


type Teacher = {
    id: string;
    name: string;
    email: string;
    subject: string;
};

const initialForm: Omit<Teacher, 'id'> = {
    name: '',
    email: '',
    subject: '',
};

export default function ManageTeachersPage() {
    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this teacher?')) {
            setTeachers(teachers.filter(t => t.id !== id));
        }
    };
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [form, setForm] = useState(initialForm);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    // Simulate fetching teachers
    useEffect(() => {
        setTeachers([
            { id: '1', name: 'Alice', email: 'alice@example.com', subject: 'Math' },
            { id: '2', name: 'Bob', email: 'bob@example.com', subject: 'Science' },
        ]);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            setTeachers(teachers.map(t => t.id === editingId ? { ...t, ...form } : t));
        } else {
            setTeachers([
                ...teachers,
                { id: Date.now().toString(), ...form },
            ]);
        }
        setForm(initialForm);
        setEditingId(null);
        setModalOpen(false);
    };

    const handleEdit = (teacher: Teacher) => {
        setForm({ name: teacher.name, email: teacher.email, subject: teacher.subject });
        setEditingId(teacher.id);
        setModalOpen(true);
    };

    const handleAdd = () => {
        setForm(initialForm);
        setEditingId(null);
        setModalOpen(true);
    };

    const handleModalClose = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            setModalOpen(false);
            setForm(initialForm);
            setEditingId(null);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-0">
            <AdminNav />
            <div className="w-full h-[90vh] max-w-[96vw] bg-gray-50 p-4 md:p-8 rounded-lg shadow-md text-black relative flex flex-col" style={{minHeight:'80vh'}}>
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-4xl font-semibold text-black">Teachers</h1>
                    <button
                        className="bg-black text-white px-6 py-3 rounded-md text-lg hover:bg-gray-800 focus:outline-none focus:bg-black focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors duration-300"
                        onClick={handleAdd}
                    >
                        Add Teacher
                    </button>
                </div>
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-lg text-center">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 text-black">Name</th>
                                <th className="px-6 py-3 text-black">Email</th>
                                <th className="px-6 py-3 text-black">Subject</th>
                                <th className="px-6 py-3 text-black">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teachers.map((teacher, idx) => (
                                <tr
                                    key={teacher.id}
                                    className={
                                        `border-b last:border-b-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-200'}`
                                    }
                                >
                                    <td className="px-6 py-3">{teacher.name}</td>
                                    <td className="px-6 py-3">{teacher.email}</td>
                                    <td className="px-6 py-3">{teacher.subject}</td>
                                    <td className="px-6 py-3">
                                        <div className="flex gap-4 justify-center">
                                            <button
                                                className="text-blue-600 hover:underline text-base"
                                                onClick={() => handleEdit(teacher)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="text-red-600 hover:underline text-base"
                                                onClick={() => handleDelete(teacher.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {teachers.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-8 text-lg">No teachers found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Modal for Add/Edit Teacher */}
            {modalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-blur bg-opacity-40 backdrop-blur-sm text-black"
                    onClick={handleModalClose}
                >
                    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md relative" onClick={e => e.stopPropagation()}>
                        <h2 className="text-2xl font-semibold mb-4 text-center text-black">{editingId ? 'Edit Teacher' : 'Add Teacher'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-black">Name</label>
                                <input
                                    id="name"
                                    name="name"
                                    placeholder="Name"
                                    value={form.name}
                                    onChange={handleChange}
                                    className="mt-1 p-2 w-full border rounded-md focus:border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-colors duration-300"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-black">Email</label>
                                <input
                                    id="email"
                                    name="email"
                                    placeholder="Email"
                                    value={form.email}
                                    onChange={handleChange}
                                    className="mt-1 p-2 w-full border rounded-md focus:border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-colors duration-300"
                                    required
                                    type="email"
                                />
                            </div>
                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-black">Subject</label>
                                <input
                                    id="subject"
                                    name="subject"
                                    placeholder="Subject"
                                    value={form.subject}
                                    onChange={handleChange}
                                    className="mt-1 p-2 w-full border rounded-md focus:border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-colors duration-300"
                                    required
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    type="submit"
                                    className="w-full bg-black text-white p-2 rounded-md hover:bg-gray-800 focus:outline-none focus:bg-black focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors duration-300"
                                >
                                    {editingId ? 'Update Teacher' : 'Add Teacher'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}