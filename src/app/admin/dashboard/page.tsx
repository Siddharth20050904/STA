'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { fetchAllTeachers, addTeacher } from '@/app/api/teacher_manager/teacher_manager';

type Teacher = {
    id: string;
    name: string;
    department: string;
    subject: string[];
    email: string;
};

type Student = {
    id: number;
    name: string;
    email: string;
    approved: boolean;
};

// interface InputField{
//     id: string,
//     value: string
// }

const initialTeachers: Teacher[] = [];

const initialStudents: Student[] = [
    { id: 1, name: 'Alice', email: 'alice@email.com', approved: false },
    { id: 2, name: 'Bob', email: 'bob@email.com', approved: false },
];

export default function AdminDashboard() {
    // Teacher management state
    const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
    const [teacherSearch, setTeacherSearch] = useState('');
    const [teacherForm, setTeacherForm] = useState<{ name: string; department: string; email: string }>({ name: '', department: '' , email: '' });
    const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
    const [teacherModalOpen, setTeacherModalOpen] = useState(false)
    const [inputSubjectField, setInputSubjectField] = useState<string[]>(['']);

    // Student approval state
    const [students, setStudents] = useState<Student[]>(initialStudents);
    const [studentSearch, setStudentSearch] = useState('');
    const [studentFilter, setStudentFilter] = useState<'all' | 'pending' | 'approved'>('all');

    // Auth and routing
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

    useEffect(()=>{
        const fetchAllTeachersFunc = async()=>{
            const fetchedTeachers = await fetchAllTeachers();
            setTeachers(prevTeachers => [...prevTeachers, ...fetchedTeachers!.map(ele=>({
                name: ele.name, email: ele.email, subject: ele.subjects, department:ele.department, id: ele.id
            }))]);
        }

        fetchAllTeachersFunc()
    }, [])

    // Teacher functions
    const handleTeacherSearch = (e: React.ChangeEvent<HTMLInputElement>) => setTeacherSearch(e.target.value);
    const filteredTeachers = teachers.filter(t => t.name.toLowerCase().includes(teacherSearch.toLowerCase()) || t.department.toLowerCase().includes(teacherSearch.toLowerCase()));
    const openAddTeacher = () => {
        setTeacherForm({ name: '', department: '', email: '' });
        setEditingTeacherId(null);
        setTeacherModalOpen(true);
    };
    const openEditTeacher = (t: Teacher) => {
        setTeacherForm({ name: t.name, department: t.department, email: t.email });
        setEditingTeacherId(t.id);
        setTeacherModalOpen(true);
    };
    const handleTeacherFormChange = (e: React.ChangeEvent<HTMLInputElement>) => setTeacherForm({ ...teacherForm, [e.target.name]: e.target.value });
    const handleTeacherFormSubmit = async(e: React.FormEvent) => {
        e.preventDefault();
        if (editingTeacherId !== null) {
            setTeachers(teachers.map(t => t.id === editingTeacherId ? { ...t, name: teacherForm.name, email: teacherForm.email, department: teacherForm.department, subject: inputSubjectField } : t));
        } else {
            const newTeacher = await addTeacher({name: teacherForm.name, email: teacherForm.email, department: teacherForm.department, subjects: inputSubjectField})
            setTeachers([...teachers, { id:newTeacher!.id , name: teacherForm.name, email: teacherForm.email, department: teacherForm.department, subject: inputSubjectField}]);
        }
        setTeacherModalOpen(false);
        setTeacherForm({ name: '', department: '', email: '' });
    };

    // Expandable row state
    const [expandedTeacher, setExpandedTeacher] = useState<string | null>(null);
    const [expandedStudent, setExpandedStudent] = useState<number | null>(null);
    const handleDeleteTeacher = (id: string) => {
        if (window.confirm('Are you sure you want to delete this teacher?')) {
            setTeachers(teachers.filter(t => t.id !== id));
        }
    };

    // Student functions
    const handleStudentSearch = (e: React.ChangeEvent<HTMLInputElement>) => setStudentSearch(e.target.value);
    const filteredStudents = students.filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.email.toLowerCase().includes(studentSearch.toLowerCase()));
    let displayedStudents = filteredStudents;
    if (studentFilter === 'pending') {
        displayedStudents = filteredStudents.filter(s => !s.approved);
    } else if (studentFilter === 'approved') {
        displayedStudents = filteredStudents.filter(s => s.approved);
    }
    const approvedCount = students.filter(s => s.approved).length;

    // Student approval/removal modal state
    const [studentActionModal, setStudentActionModal] = useState<{ open: boolean; student: Student | null; action: 'approve' | 'remove' | null }>({ open: false, student: null, action: null });
    const openStudentActionModal = (student: Student, action: 'approve' | 'remove') => setStudentActionModal({ open: true, student, action });
    const closeStudentActionModal = () => setStudentActionModal({ open: false, student: null, action: null });
    const confirmStudentAction = () => {
        if (studentActionModal.student && studentActionModal.action) {
            if (studentActionModal.action === 'approve') {
                setStudents(students.map(s => s.id === studentActionModal.student!.id ? { ...s, approved: true } : s));
            } else if (studentActionModal.action === 'remove') {
                setStudents(students.filter(s => s.id !== studentActionModal.student!.id));
            }
        }
        closeStudentActionModal();
    };

    //Adding Field
    const handleAddInput = ()=> setInputSubjectField(prevItems => [...prevItems, '']);
    const handleSubInput = (indexToDelete: number)=> setInputSubjectField(prevItems => prevItems.filter((_, index)=> index !== indexToDelete))

    //Changing Field
    const handleChangeSubjectsInputField = (id: number, value: string)=>{
        setInputSubjectField(prevItems=>{
            const updated = prevItems.map((item, idx)=> idx===id ? value : item);
            return updated
        });
    }

    return (
        <div className="min-h-screen bg-white flex flex-col text-black">
            <h1 className='text-3xl font-bold text-center p-4'>Admin Dashboard</h1>
            <div className="flex flex-1 mt-4 items-start justify-center">
                <div className="flex flex-col md:flex-row gap-8 p-4 md:p-12 bg-gray-100 rounded-lg w-full h-[calc(100vh-0.5rem)]">
                    {/* Teacher Management (Left) */}
                    <div className="flex-1 h-full bg-white rounded-none shadow-md p-6 md:p-10 flex flex-col min-w-0 overflow-y-auto border-r border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-semibold text-black">Manage Teachers</h2>
                            <button className="bg-black text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800" onClick={openAddTeacher}>Add</button>
                        </div>
                        {/* Search bar for teachers */}
                        <input type="text" placeholder="Search teachers..." value={teacherSearch} onChange={handleTeacherSearch} className="mb-4 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300" />
                        {/* Teacher list */}
                        <div className="flex-1">
                            <table className="w-full text-sm lg:text-lg text-center">
                                <thead>
                                    <tr>
                                        <th className="px-2 py-2 text-black">Name</th>
                                        <th className="px-2 py-2 text-black">Department</th>
                                        <th className="px-2 py-2 text-black">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTeachers.length === 0 ? (
                                        <tr><td colSpan={3} className="py-6 text-gray-500">No teachers found.</td></tr>
                                    ) : filteredTeachers.map((t, idx) => [
                                        <tr
                                            key={t.id}
                                            className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-100'}
                                            onClick={e => {
                                                if ((e.target as HTMLElement).tagName !== 'BUTTON') {
                                                    setExpandedTeacher(expandedTeacher === t.id ? null : t.id);
                                                };
                                            }}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <td className="px-2 py-2">{t.name}</td>
                                            <td className="px-2 py-2">{t.department}</td>
                                            <td className="px-2 py-2" onClick={e => e.stopPropagation()}>
                                                <button className="text-blue-600 hover:underline mr-2" onClick={() => openEditTeacher(t)}>Edit</button>
                                                <button className="text-red-600 hover:underline" onClick={() => handleDeleteTeacher(t.id)}>Delete</button>
                                            </td>
                                        </tr>,
                                        expandedTeacher === t.id && (
                                            <tr key={t.id + '-expand'}>
                                                <td colSpan={4} className="bg-gray-50 text-left px-6 py-4 border-t">
                                                    <div>
                                                        <div><span className="font-semibold">Email:</span> {t.email}</div>
                                                        <div>Subjects:{" "}
                                                            {
                                                                t.subject.map((subject, subIdx)=>{
                                                                        return (
                                                                            <div key={subIdx} className='inline'>{subject}
                                                                            {t.subject.length-1===subIdx ? '': ', '}
                                                                            </div>
                                                                        )  
                                                                    }
                                                                )
                                                            }
                                                        </div>
                                                    </div>
                                                    
                                                </td>
                                            </tr>
                                        )
                                    ])}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/* Student Approval (Right) */}
                    <div className="flex-1 h-full bg-white rounded-none shadow-md sm:p-10 p-6 flex flex-col min-w-0 overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-semibold text-black">Approve Students</h2>
                            <span className="text-sm text-gray-700">Pending: <span className="font-bold">{students.filter(s => !s.approved).length}</span> | Approved: <span className="font-bold">{approvedCount}</span></span>
                        </div>
                        {/* Search bar and filter for students */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
                            <input type="text" placeholder="Search students..." value={studentSearch} onChange={handleStudentSearch} className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 flex-1" />
                            <div className="flex gap-2 mt-2 sm:mt-0">
                                <button
                                    className={`px-3 py-1 rounded-md text-sm border ${studentFilter === 'all' ? 'bg-black text-white' : 'bg-white text-black border-gray-300'}`}
                                    onClick={() => setStudentFilter('all')}
                                >All</button>
                                <button
                                    className={`px-3 py-1 rounded-md text-sm border ${studentFilter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-white text-black border-gray-300'}`}
                                    onClick={() => setStudentFilter('pending')}
                                >Pending</button>
                                <button
                                    className={`px-3 py-1 rounded-md text-sm border ${studentFilter === 'approved' ? 'bg-green-700 text-white' : 'bg-white text-black border-gray-300'}`}
                                    onClick={() => setStudentFilter('approved')}
                                >Approved</button>
                            </div>
                        </div>
                        {/* Student Table (filtered by toggle) */}
                        <div className="flex-1">
                            <table className="w-full text-sm lg:text-lg text-center">
                                <thead>
                                    <tr>
                                        <th className="py-2 text-black">Name</th>
                                        <th className="py-2 text-black">Email</th>
                                        <th className="py-2 text-black">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedStudents.length === 0 ? (
                                        <tr><td colSpan={3} className="py-6 text-gray-500">No students found.</td></tr>
                                    ) : displayedStudents.map((s, idx) => [
                                        <tr
                                            key={s.id}
                                            className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-100'}
                                            onClick={e => {
                                                if ((e.target as HTMLElement).tagName !== 'BUTTON') setExpandedStudent(expandedStudent === s.id ? null : s.id);
                                            }}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <td className="px-2 py-2">{s.name}</td>
                                            <td className="px-2 py-2">{s.email}</td>
                                            <td className="px-2 py-2" onClick={e => e.stopPropagation()}>
                                                {!s.approved ? (
                                                    <>
                                                        <button className="text-green-600 hover:underline mr-2" onClick={() => openStudentActionModal(s, 'approve')}>Approve</button>
                                                        <button className="text-red-600 hover:underline" onClick={() => openStudentActionModal(s, 'remove')}>Reject</button>
                                                    </>
                                                ) : (
                                                    <button className="text-red-600 hover:underline" onClick={() => openStudentActionModal(s, 'remove')}>Remove</button>
                                                )}
                                            </td>
                                        </tr>,
                                        expandedStudent === s.id && (
                                            <tr key={s.id + '-expand'}>
                                                <td colSpan={3} className="bg-gray-50 text-left px-6 py-4 border-t">
                                                    <div><span className="font-semibold">Email:</span> {s.email}</div>
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
            {/* Modal for Add/Edit Teacher */}
            {teacherModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-blur bg-opacity-40 backdrop-blur-sm min-height-screen" onClick={() => setTeacherModalOpen(false)}>
                    <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md relative max-h-160 overflow-y-auto border border-16 border-white" onClick={e => e.stopPropagation()}>
                        <h2 className="text-2xl font-semibold mb-4 text-center text-black">{editingTeacherId !== null ? 'Edit Teacher' : 'Add Teacher'}</h2>
                        <form onSubmit={handleTeacherFormSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-black">Name</label>
                                <input id="name" name="name" value={teacherForm.name} onChange={handleTeacherFormChange} className="mt-1 p-2 w-full border rounded-md focus:border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300" required />
                            </div>
                            <div>
                                <label htmlFor="department" className="block text-sm font-medium text-black">Department</label>
                                <input id="department" name="department" value={teacherForm.department} onChange={handleTeacherFormChange} className="mt-1 p-2 w-full border rounded-md focus:border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300" required />
                            </div>
                            <div>
                                <div className='flex flex-row justify-between m-1'>
                                    <label htmlFor="subject" className="block text-sm font-medium text-black">Subject</label>
                                    <button className='hover:bg-gray-300 rounded' onClick={handleAddInput}> <Image src={'/plus.svg'} width={20} height={10} alt='add'></Image> </button>
                                </div>
                                {/* <input id="subject" name="subject" value={teacherForm.subject} onChange={handleTeacherFormChange} className="mt-1 p-2 w-full border rounded-md focus:border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300" required /> */}
                                
                                {
                                    inputSubjectField.map((field, index)=>{
                                        return (
                                            <div key={index} className='flex flex-row justify-between my-1'>
                                                <input name={index.toString()} value={field} onChange={(e)=>handleChangeSubjectsInputField(index, e.target.value)} className="mt-1 p-2 w-full border rounded-md focus:border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300" required />
                                                {index>0 &&
                                                    <button className='border border-transparent hover:border-black rounded m-1 mt-3 h-5' onClick={() => handleSubInput(index)}> <Image src={'/minus.svg'} width={20} height={0} alt='add'></Image> </button>
                                                }                                                
                                            </div>
                                        )
                                    })
                                }
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-black">Email</label>
                                <input id="email" name="email" value={teacherForm.email} onChange={handleTeacherFormChange} className="mt-1 p-2 w-full border rounded-md focus:border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300" required />
                            </div>
                            <div className="flex items-center space-x-2">
                                <button type="submit" className="w-full bg-black text-white p-2 rounded-md hover:bg-gray-800 focus:outline-none focus:bg-black focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors duration-300">
                                    {editingTeacherId !== null ? 'Update Teacher' : 'Add Teacher'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Student Approve/Remove Modal */}
            {studentActionModal.open && studentActionModal.student && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-blur bg-opacity-40 backdrop-blur-sm" onClick={closeStudentActionModal}>
                    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md relative" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-semibold mb-4 text-center text-black">
                            {studentActionModal.action === 'approve' ? 'Approve Student' : 'Remove Student'}
                        </h2>
                        <div className="mb-4 text-black">
                            <div><span className="font-semibold">Name:</span> {studentActionModal.student.name}</div>
                            <div><span className="font-semibold">Email:</span> {studentActionModal.student.email}</div>
                            <div><span className="font-semibold">Status:</span> {studentActionModal.student.approved ? 'Approved' : 'Pending'}</div>
                        </div>
                        <div className="flex justify-end gap-4 mt-6">
                            <button className="px-4 py-2 rounded-md bg-gray-300 text-black hover:bg-gray-400" onClick={closeStudentActionModal}>Cancel</button>
                            <button className="px-4 py-2 rounded-md bg-black text-white hover:bg-gray-800" onClick={confirmStudentAction}>OK</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}