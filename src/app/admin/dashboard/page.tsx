'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { fetchAllTeachers, addTeacher, removeTeacher, updateTeacherFields } from '@/app/api/teacher_manager/teacher_manager';
import { fetchUnverifiedStudents, verifyStudent, removeStudent } from '@/app/api/student_manager/student_manager';
import { LogOut, PlusSquare, MinusIcon, Edit, Delete, UserCheck } from 'lucide-react';

type Teacher = {
    id: string;
    name: string;
    department: string;
    subject: string[];
    email: string;
};

type Student = {
    id: string;
    name: string;
    email: string;
    approved: boolean;
};


export default function AdminDashboard() {
    // Teacher management state
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [teacherSearch, setTeacherSearch] = useState('');
    const [teacherForm, setTeacherForm] = useState<{ name: string; department: string; email: string }>({ name: '', department: '' , email: '' });
    const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
    const [teacherModalOpen, setTeacherModalOpen] = useState(false)
    const [inputSubjectField, setInputSubjectField] = useState<string[]>(['']);

    // Student approval state
    const [students, setStudents] = useState<Student[]>([]);
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
        else if(session?.user.type === 'TEACHER') router.push('/teacher/dashboard');
    }, [session, router, status]);
	
	//Fetch Teacher
    useEffect(()=>{
        const fetchAllTeachersFunc = async()=>{
            const fetchedTeachers = await fetchAllTeachers();
            setTeachers(fetchedTeachers!.map(ele=>({
                name: ele.name, email: ele.email, subject: ele.subjects, department:ele.department, id: ele.id
            })));
        }

        fetchAllTeachersFunc();
    },[]);

	//Fetch Student
	useEffect(()=>{
		const fetchUnverifiedStudentsFunc = async()=>{
			const fetchedStudents = await fetchUnverifiedStudents();
			setStudents(fetchedStudents!.map(student => ({
				name: student.name, email: student.email, approved: false, id: student.id
			})));
		}

		fetchUnverifiedStudentsFunc();
	},[])

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
		setInputSubjectField(t.subject);
        setEditingTeacherId(t.id);
        setTeacherModalOpen(true);
    };
    const handleTeacherFormChange = (e: React.ChangeEvent<HTMLInputElement>) => setTeacherForm({ ...teacherForm, [e.target.name]: e.target.value });
    const handleTeacherFormSubmit = async(e: React.FormEvent) => {
        e.preventDefault();
        if (editingTeacherId !== null) {
			const updatedTeacher = await updateTeacherFields({name: teacherForm.name, email: teacherForm.email, subjects: inputSubjectField, department: teacherForm.department, id: editingTeacherId});
			if(!updatedTeacher){
				alert("Error in updating teacher, please try later!");
				setTeacherModalOpen(false);
				setTeacherForm({ name: '', department: '', email: '' });
				return;
			}
			setTeachers(teachers.filter((teacher) => teacher.id!==editingTeacherId));
			setTeachers(prevItem => [...prevItem, {id: updatedTeacher.id, email: updatedTeacher.email, subject: updatedTeacher.subjects, department: updatedTeacher.department, name: updatedTeacher.name}]);
        } else {
            const newTeacher = await addTeacher({name: teacherForm.name, email: teacherForm.email, department: teacherForm.department, subjects: inputSubjectField})
            setTeachers([...teachers, { id:newTeacher!.id , name: teacherForm.name, email: teacherForm.email, department: teacherForm.department, subject: inputSubjectField}]);
        }
        setTeacherModalOpen(false);
        setTeacherForm({ name: '', department: '', email: '' });
    };

    // Expandable row state
    const [expandedTeacher, setExpandedTeacher] = useState<string | null>(null);
    const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
    const handleDeleteTeacher = async(id: string) => {
        if (window.confirm('Are you sure you want to delete this teacher?')) {
			const removedTeacher = await removeTeacher(id);
            setTeachers(teachers.filter(t => t.id !== removedTeacher?.id));
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

    // Student approval/removal modal state
    const [studentActionModal, setStudentActionModal] = useState<{ open: boolean; student: Student | null; action: 'approve' | 'remove' | null }>({ open: false, student: null, action: null });
    const openStudentActionModal = (student: Student, action: 'approve' | 'remove') => setStudentActionModal({ open: true, student, action });
    const closeStudentActionModal = () => setStudentActionModal({ open: false, student: null, action: null });
    const confirmStudentAction = async() => {
        if (studentActionModal.student && studentActionModal.action) {
            if (studentActionModal.action === 'approve') {
				const student = await verifyStudent(studentActionModal.student.id);
				if(student){
                	setStudents(students.filter(s => s.id !== studentActionModal.student!.id));
				}
            } else if (studentActionModal.action === 'remove') {
				const student = await removeStudent(studentActionModal.student.id);
				if(student){
                	setStudents(students.filter(s => s.id !== studentActionModal.student!.id));
				}
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
		<div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-gray-100 flex flex-col">
			<div className='flex flex-row justify-between items-center border-b border-gray-700 bg-gradient-to-r from-gray-900 to-gray-800 shadow-md'>
				<div></div>
				<h1 className='text-3xl font-bold text-center p-6 text-white'>Admin Dashboard</h1>
				<LogOut className='m-4 mr-8 hover:bg-gray-700 rounded cursor-pointer transition-colors text-gray-300' onClick={async()=>{ await signOut(); router.push('/signin') }}></LogOut>
			</div>
			
			<div className="flex flex-1 items-start justify-center">
				<div className="flex flex-col md:flex-row gap-8 p-6 md:p-12 w-full h-[calc(100vh-0.5rem)]">
					
					{/* Teacher Management (Left) */}
					<div className="flex-1 h-full bg-gradient-to-br from-gray-800 to-gray-750 border border-gray-700/70 rounded-xl shadow-2xl shadow-black/40 p-6 md:p-10 flex flex-col min-w-0 overflow-y-auto backdrop-blur-sm">
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-2xl font-semibold text-emerald-400">Manage Teachers</h2>
							<button className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-all" onClick={openAddTeacher}>Add</button>
						</div>
						
						{/* Search bar for teachers */}
						<input 
							type="text" 
							placeholder="Search teachers..." 
							value={teacherSearch} 
							onChange={handleTeacherSearch} 
							className="mb-4 p-2 bg-gray-700/70 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
						/>
						
						{/* Teacher list */}
						<div className="flex-1 overflow-y-auto">
							<table className="w-full text-sm lg:text-base text-gray-200">
								<thead className="border-b border-gray-700 bg-gray-800/60">
									<tr>
										<th className="px-2 py-3 text-left">Name</th>
										<th className="px-2 py-3 text-left">Department</th>
										<th className="px-2 py-3 text-center">Actions</th>
									</tr>
								</thead>
								<tbody>
									{filteredTeachers.length === 0 ? (
										<tr><td colSpan={3} className="py-6 text-gray-500 text-center">No teachers found.</td></tr>
									) : filteredTeachers.map((t, idx) => [
										<tr
											key={t.id}
											className={`${idx % 2 === 0 ? 'bg-gray-800/60' : 'bg-gray-700/50'} hover:bg-gray-600/60 transition cursor-pointer`}
											onClick={e => {
												if ((e.target as HTMLElement).tagName !== 'BUTTON') {
													setExpandedTeacher(expandedTeacher === t.id ? null : t.id);
												};
											}}
										>
											<td className="px-2 py-3 font-medium">{t.name}</td>
											<td className="px-2 py-3 text-gray-300">{t.department}</td>
											<td className="px-2 py-3 text-center" onClick={e => e.stopPropagation()}>
												<button className="text-blue-400 hover:text-blue-300 mr-3 font-medium transition-colors" onClick={() => openEditTeacher(t)}><Edit className='cursor-pointer'/></button>
												<button className="text-red-400 hover:text-red-300 font-medium transition-colors" onClick={() => handleDeleteTeacher(t.id)}><Delete className='cursor-pointer'/> </button>
											</td>
										</tr>,
										expandedTeacher === t.id && (
											<tr key={t.id + '-expand'}>
												<td colSpan={3} className="bg-gray-800/80 border-t border-gray-700 px-6 py-4">
													<div className="space-y-1 text-gray-300">
														<div><span className="font-semibold text-white">Email:</span> {t.email}</div>
														<div><span className="font-semibold text-white">Subjects:</span>{" "}
															{
																t.subject.map((subject, subIdx)=>{
																		return (
																			<span key={subIdx} className='inline'>{subject}
																			{t.subject.length-1===subIdx ? '': ', '}
																			</span>
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
					<div className="flex-1 h-full bg-gradient-to-br from-gray-800 to-gray-750 border border-gray-700/70 rounded-xl shadow-2xl shadow-black/40 sm:p-10 p-6 flex flex-col min-w-0 overflow-y-auto backdrop-blur-sm">
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-2xl font-semibold text-blue-400">Approve Students</h2>
							<span className="text-sm text-gray-300">Pending: <span className="font-bold text-yellow-400">{students.filter(s => !s.approved).length}</span></span>
						</div>
						
						{/* Search bar and filter for students */}
						<div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
							<input 
								type="text" 
								placeholder="Search students..." 
								value={studentSearch} 
								onChange={handleStudentSearch} 
								className="p-2 bg-gray-700/70 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 flex-1" 
							/>
							<div className="flex gap-2 mt-2 sm:mt-0">
								<button
									className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${studentFilter === 'all' ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'}`}
									onClick={() => setStudentFilter('all')}
								>All</button>
								<button
									className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${studentFilter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'}`}
									onClick={() => setStudentFilter('pending')}
								>Pending</button>
								<button
									className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${studentFilter === 'approved' ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'}`}
									onClick={() => setStudentFilter('approved')}
								>Approved</button>
							</div>
						</div>
						
						{/* Student Table (filtered by toggle) */}
						<div className="flex-1 overflow-y-auto">
							<table className="w-full text-sm lg:text-base text-gray-200">
								<thead className="border-b border-gray-700 bg-gray-800/60">
									<tr>
										<th className="py-3 text-left px-2">Name</th>
										<th className="py-3 text-left px-2">Email</th>
										<th className="py-3 text-center">Actions</th>
									</tr>
								</thead>
								<tbody>
									{displayedStudents.length === 0 ? (
										<tr><td colSpan={3} className="py-6 text-gray-500 text-center">No students found.</td></tr>
									) : displayedStudents.map((s, idx) => [
										<tr
											key={s.id}
											className={`${idx % 2 === 0 ? 'bg-gray-800/60' : 'bg-gray-700/50'} hover:bg-gray-600/60 transition cursor-pointer`}
											onClick={e => {
												if ((e.target as HTMLElement).tagName !== 'BUTTON') setExpandedStudent(expandedStudent === s.id ? null : s.id);
											}}
										>
											<td className="px-2 py-3 font-medium">{s.name}</td>
											<td className="px-2 py-3 text-gray-300">{s.email}</td>
											<td className="px-2 py-3 text-center" onClick={e => e.stopPropagation()}>
												{!s.approved ? (
													<>
														<button className="text-emerald-400 hover:text-emerald-300 mr-3 font-medium transition-colors" onClick={() => openStudentActionModal(s, 'approve')}> <UserCheck className='cursor-pointer'/> </button>
														<button className="text-red-400 hover:text-red-300 font-medium transition-colors" onClick={() => openStudentActionModal(s, 'remove')}> <Delete className='cursor-pointer'/> </button>
													</>
												) : (
													<button className="text-red-400 hover:text-red-300 font-medium transition-colors" onClick={() => openStudentActionModal(s, 'remove')}>Remove</button>
												)}
											</td>
										</tr>,
										expandedStudent === s.id && (
											<tr key={s.id + '-expand'}>
												<td colSpan={3} className="bg-gray-800/80 border-t border-gray-700 px-6 py-4">
													<div className="space-y-1 text-gray-300">
														<div><span className="font-semibold text-white">Email:</span> {s.email}</div>
													</div>
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
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setTeacherModalOpen(false)}>
					<div className="bg-gradient-to-br from-gray-800 to-gray-750 border border-gray-700 p-6 rounded-xl shadow-2xl shadow-black/60 w-full max-w-md relative max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
						<h2 className="text-2xl font-semibold mb-6 text-center text-white">{editingTeacherId !== null ? 'Edit Teacher' : 'Add Teacher'}</h2>
						<form onSubmit={handleTeacherFormSubmit} className="space-y-4">
							<div>
								<label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Name</label>
								<input id="name" name="name" value={teacherForm.name} onChange={handleTeacherFormChange} className="p-2 w-full bg-gray-700/70 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500" required />
							</div>
							<div>
								<label htmlFor="department" className="block text-sm font-medium text-gray-300 mb-1">Department</label>
								<input id="department" name="department" value={teacherForm.department} onChange={handleTeacherFormChange} className="p-2 w-full bg-gray-700/70 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500" required />
							</div>
							<div>
								<div className='flex flex-row justify-between mb-2'>
									<label htmlFor="subject" className="block text-sm font-medium text-gray-300">Subject</label>
									<button className='hover:bg-gray-600 rounded p-1 transition-colors' onClick={handleAddInput}> <PlusSquare></PlusSquare> </button>
								</div>
								
								{
									inputSubjectField.map((field, index)=>{
										return (
											<div key={index} className='flex flex-row gap-2 my-2'>
												<input name={index.toString()} value={field} onChange={(e)=>handleChangeSubjectsInputField(index, e.target.value)} className="p-2 w-full bg-gray-700/70 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500" required />
												{index>0 &&
													<button className='hover:bg-gray-600 rounded p-1 transition-colors' onClick={() => handleSubInput(index)}> <MinusIcon></MinusIcon> </button>
												}                                                
											</div>
										)
									})
								}
							</div>
							<div>
								<label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
								<input id="email" name="email" value={teacherForm.email} onChange={handleTeacherFormChange} className="p-2 w-full bg-gray-700/70 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500" required />
							</div>
							<div className="flex items-center space-x-2 pt-2">
								<button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-md font-medium transition-all">
									{editingTeacherId !== null ? 'Update Teacher' : 'Add Teacher'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
			
			{/* Student Approve/Remove Modal */}
			{studentActionModal.open && studentActionModal.student && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={closeStudentActionModal}>
					<div className="bg-gradient-to-br from-gray-800 to-gray-750 border border-gray-700 p-8 rounded-xl shadow-2xl shadow-black/60 w-full max-w-md relative" onClick={e => e.stopPropagation()}>
						<h2 className="text-xl font-semibold mb-4 text-center text-white">
							{studentActionModal.action === 'approve' ? 'Approve Student' : 'Remove Student'}
						</h2>
						<div className="mb-6 text-gray-300 space-y-2">
							<div><span className="font-semibold text-white">Name:</span> {studentActionModal.student.name}</div>
							<div><span className="font-semibold text-white">Email:</span> {studentActionModal.student.email}</div>
							<div><span className="font-semibold text-white">Status:</span> <span className={studentActionModal.student.approved ? 'text-emerald-400' : 'text-yellow-400'}>{studentActionModal.student.approved ? 'Approved' : 'Pending'}</span></div>
						</div>
						<div className="flex justify-end gap-4 mt-6">
							<button className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium transition-all" onClick={closeStudentActionModal}>Cancel</button>
							<button className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all" onClick={confirmStudentAction}>OK</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}