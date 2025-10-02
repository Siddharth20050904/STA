"use client";
import React, { useState } from "react";

type Teacher = {
    id: string;
    name: string;
    subject: string;
};

type ChatMessage = {
    id: string;
    teacherId: string;
    teacherName: string;
    lastMessage: string;
    timestamp: string;
    unread: boolean;
};

type Appointment = {
    id: string;
    teacherName: string;
    date: string;
    time: string;
    status: "upcoming" | "completed";
};

const mockTeachers: Teacher[] = [
    {
        id: "1",
        name: "Mr. John Doe",
        subject: "Mathematics",
    },
    {
        id: "2",
        name: "Ms. Jane Smith",
        subject: "Physics",
    },
    {
        id: "3",
        name: "Ms. Jane Smith",
        subject: "Physics",
    },

    {
        id: "4",
        name: "Ms. Jane Smith",
        subject: "Physics",
    },
];

const mockChatHistory: ChatMessage[] = [
    {
        id: "c1",
        teacherId: "2",
        teacherName: "Ms. Jane Smith",
        lastMessage: "Please review chapter 5 before our next meeting.",
        timestamp: "2024-06-10 15:30",
        unread: true,
    },
    {
        id: "c2",
        teacherId: "1",
        teacherName: "Mr. John Doe",
        lastMessage: "Great work on your assignment!",
        timestamp: "2024-06-09 11:20",
        unread: false,
    },
    {
        id: "c3",
        teacherId: "2",
        teacherName: "Ms. Jane Smith",
        lastMessage: "Please review chapter 5 before our next meeting.",
        timestamp: "2024-06-10 15:30",
        unread: true,
    },
    {
        id: "c4",
        teacherId: "1",
        teacherName: "Mr. John Doe",
        lastMessage: "Great work on your assignment!",
        timestamp: "2024-06-09 11:20",
        unread: false,
    },
    {
        id: "c5",
        teacherId: "2",
        teacherName: "Ms. Jane Smith",
        lastMessage: "Please review chapter 5 before our next meeting.",
        timestamp: "2024-06-10 15:30",
        unread: true,
    },
    {
        id: "c6",
        teacherId: "1",
        teacherName: "Mr. John Doe",
        lastMessage: "Great work on your assignment!",
        timestamp: "2024-06-09 11:20",
        unread: false,
    },
];

const mockAppointments: Appointment[] = [
    {
        id: "a1",
        teacherName: "Mr. John Doe",
        date: "2024-06-10",
        time: "10:00",
        status: "upcoming",
    },
    {
        id: "a2",
        teacherName: "Ms. Jane Smith",
        date: "2024-06-01",
        time: "09:00",
        status: "completed",
    },
];

export default function StudentDashboard() {
    const [teachers] = useState<Teacher[]>(mockTeachers);
    const [appointments] = useState<Appointment[]>(mockAppointments);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>(mockChatHistory);
    const [message, setMessage] = useState<string>("");

    // Sort chat history to show unread messages at top
    const sortedChatHistory = [...chatHistory].sort((a, b) => {
        if (a.unread && !b.unread) return -1;
        if (!a.unread && b.unread) return 1;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    const handleMarkAsRead = (chatId: string) => {
        setChatHistory(chatHistory.map(chat => 
            chat.id === chatId ? { ...chat, unread: false } : chat
        ));
    };

    return (
        <div className="min-h-screen bg-white flex flex-col text-black">
            <h1 className="text-3xl font-bold text-center p-4">Student Dashboard</h1>
            <div className="flex flex-1 mt-4 items-start justify-center">
                <div className="flex flex-col md:flex-row gap-8 p-4 md:p-12 bg-gray-100 rounded-lg w-full h-[calc(100vh-0.5rem)]">
                    {/* Chat Section (Left) */}
                    <div className="flex-1 h-full bg-white rounded-none shadow-md p-6 md:p-10 flex flex-col min-w-0 border-r border-gray-200">
                        <h2 className="text-2xl font-semibold text-black mb-4">Messages</h2>
                        
                        {/* Chat History */}
                        <div className="flex-1 mb-6 overflow-y-auto">
                            <h3 className="text-xl font-semibold text-black mb-3">Chat History</h3>
                            <table className="w-full text-sm lg:text-lg">
                                <thead>
                                    <tr>
                                        <th className="px-2 py-2 text-left text-black">Teacher</th>
                                        <th className="px-2 py-2 text-left text-black">Last Message</th>
                                        <th className="px-2 py-2 text-left text-black">Time</th>
                                        <th className="px-2 py-2 text-center text-black">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedChatHistory.length === 0 ? (
                                        <tr><td colSpan={4} className="py-6 text-gray-500 text-center">No messages yet.</td></tr>
                                    ) : sortedChatHistory.map((chat, idx) => (
                                        <tr key={chat.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-100'}>
                                            <td className="px-2 py-2 font-medium">{chat.teacherName}</td>
                                            <td className="px-2 py-2 text-gray-600 truncate max-w-xs">{chat.lastMessage}</td>
                                            <td className="px-2 py-2 text-gray-500 text-sm">{chat.timestamp}</td>
                                            <td className="px-2 py-2 text-center">
                                                {chat.unread ? (
                                                    <span className="inline-flex items-center">
                                                        <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">Unread</span>
                                                        <button
                                                            onClick={() => handleMarkAsRead(chat.id)}
                                                            className="ml-2 text-blue-600 text-xs underline"
                                                        >
                                                            Mark as read
                                                        </button>
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">Read</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/* Appointments (Right) */}
                    <div className="flex-1 h-full bg-white rounded-none shadow-md sm:p-10 p-6 flex flex-col min-w-0 overflow-y-auto">
                        <h2 className="text-2xl font-semibold text-black mb-4">Upcoming Appointments</h2>
                        <div className="flex-1 mb-8">
                            <table className="w-full text-sm lg:text-lg text-center">
                                <thead>
                                    <tr>
                                        <th className="py-2 text-black">Teacher</th>
                                        <th className="py-2 text-black">Date</th>
                                        <th className="py-2 text-black">Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.filter(a => a.status === "upcoming").length === 0 ? (
                                        <tr><td colSpan={3} className="py-6 text-gray-500">No upcoming appointments.</td></tr>
                                    ) : appointments.filter(a => a.status === "upcoming").map((a, idx) => (
                                        <tr key={a.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-100'}>
                                            <td className="px-2 py-2 font-medium">{a.teacherName}</td>
                                            <td className="px-2 py-2">{a.date}</td>
                                            <td className="px-2 py-2">{a.time}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <h2 className="text-2xl font-semibold text-black mb-4">Appointment History</h2>
                        <div className="flex-1">
                            <table className="w-full text-sm lg:text-lg text-center">
                                <thead>
                                    <tr>
                                        <th className="py-2 text-black">Teacher</th>
                                        <th className="py-2 text-black">Date</th>
                                        <th className="py-2 text-black">Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.filter(a => a.status === "completed").length === 0 ? (
                                        <tr><td colSpan={3} className="py-6 text-gray-500">No past appointments.</td></tr>
                                    ) : appointments.filter(a => a.status === "completed").map((a, idx) => (
                                        <tr key={a.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-100'}>
                                            <td className="px-2 py-2 font-medium">{a.teacherName}</td>
                                            <td className="px-2 py-2">{a.date}</td>
                                            <td className="px-2 py-2">{a.time}</td>
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