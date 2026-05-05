'use client';

import ProtectedRoute from "@/app/components/ProtectedRoute";
import { useEffect, useState } from "react";
import { useAuth } from '@/app/auth/useAuth';
import { SERVER_URL, getAuthHeaders } from '@/lib/config';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
// Components
import Searchbar from       "@/app/components/Searchbar";
import LoadingScreen from   "@/app/components/LoadingScreen";
import ListLabel from       "@/app/components/ListLabel";
import UnenrollCourse from "@/app/components/UnenrollCourse";
import EditInfo from        "./EditInfo";
import UserInfo from         "./UserInfo";
// React Icons
import { MdModeEditOutline } from "react-icons/md";

export default function View_Students() {
  const [EditStudentInfo,   setEditStudentInfo]   = useState(false);
  const [coursesLoading,    setCoursesLoading]    = useState(false);
  const [isLoading,         setIsLoading]         = useState(false);
  const [editingStudentId,  setEditingStudentId]  = useState(null);
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [editFormData,      setEditFormData]     = useState({});
  const [enrolledCourses,   setEnrolledCourses]  = useState({});
  const [searchTerm, setSearchTerm]   = useState('');
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState('');
  const  { signed_in_user } = useAuth();
  const [users, setUsers] = useState([]);

  const EditInfoField = (props) => (
    <EditInfo
      {...props}
      formData={editFormData}
      setFormData={setEditFormData}
    />
  );

  const HandleEdit = (e, student) => {
    e.stopPropagation();
    const nextEditing = editingStudentId !== student.user_id;
    setEditStudentInfo(nextEditing);
    setEditingStudentId(nextEditing ? student.user_id : null);
    if (nextEditing) {
      setEditFormData({
        first_name:   student.first_name,
        last_name:    student.last_name,
        username:     student.username,
        email:        student.email,
        student_id:   student.student_id ?? '',
        user_id:      student.user_id,
      });
    } else {
      setEditFormData({});
    }
  };
  async function handleStudentInfoChange(e, student) {
    e.preventDefault();
    setError(''); setSuccess('');
    const { user_id: _omit, ...updateFields } = editFormData;
    try{
      const res = await fetch(`${SERVER_URL}/api/Edit_Student/${student.user_id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateFields)
      });
      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Failed to update student info (${res.status}): ${errBody}`);
      }
      const updatedRow = await res.json();
      // Replace the student entry with the fresh row returned from the DB
      setUsers(prev =>
        prev.map(u => u.user_id === student.user_id ? { ...u, ...updatedRow } : u)
      );
      setEditStudentInfo(false);
      setEditingStudentId(null);
      setEditFormData({});
      toast.success('Student information updated successfully');
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error('Failed to update student information');
    }
  }
  const handleRowClick = async (student) => {
    const id = student.user_id;
    // Collapse if already expanded
    if (expandedStudentId === id) {
      setExpandedStudentId(null);
      return;
    }
    setExpandedStudentId(id);
    // Fetch courses only if not already cached
    if (!enrolledCourses[id]) {
      setCoursesLoading(true);
      try {
        const res = await fetch(`${SERVER_URL}/api/My_Courses?user_id=${id}`, {
          headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch courses');
        const data = await res.json();
        setEnrolledCourses(prev => ({ ...prev, [id]: data }));
      } catch {
        toast.error('Failed to load enrolled courses');
        setEnrolledCourses(prev => ({ ...prev, [id]: [] }));
      } finally {
        setCoursesLoading(false);
      }
    }
  };

  useEffect(() => {
    const userID = signed_in_user?.user_id;
    if (!userID) return;
    // Only admins (including demo-admin) can access this route; avoid noisy 401/403 requests during redirects.
    const role = signed_in_user?.user_role?.toString().trim().toLowerCase();
    if (!['admin', 'demo-admin'].includes(role)) return;

    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${SERVER_URL}/api/View_Students?user_id=${userID}`, {
          headers: getAuthHeaders()
        });
        if (!response.ok) {
          let details = '';
          try {
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
              const body = await response.json();
              details = body?.message ? ` - ${body.message}` : '';
            } else {
              const text = await response.text();
              details = text ? ` - ${text}` : '';
            }
          } catch (_) {
            // ignore parse errors
          }
          throw new Error(`Request failed (${response.status})${details}`);
        }
        const data = await response.json();
        setUsers(data || []);
      } catch (error) {
        console.error('Error fetching students:', error);
        setError(error?.message || 'Failed to fetch students');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [signed_in_user]);
  
  const filterStudents = users.filter((user) => {
    if (!searchTerm) return true;
    const search_input = searchTerm.toLowerCase();
    return (
        user.first_name.toLowerCase().includes(search_input) ||
        user.last_name.toLowerCase().includes(search_input) ||
        user.username.toLowerCase().includes(search_input) ||
        user.email.toLowerCase().includes(search_input) ||
        String(user.student_id ?? '').includes(search_input) ||
        String(user.user_id).toLowerCase().includes(search_input)
    );
  });

  return (
    <ProtectedRoute
        isLoggedIn={!!signed_in_user}
        userRole={signed_in_user?.user_role}
        requiredRole={["Admin", "demo-admin"]}
    >
      <div className="all-pages-style px-4 sm:px-6 md:px-8 pt-[7.5em] pb-16">
        <ToastContainer />
        {isLoading && <LoadingScreen />}
        <h1 className="text-2xl font-bold mb-4">View Students</h1>
        {error && (
          <p className="mb-3 text-sm text-red-700">
            {error}
          </p>
        )}
        <Searchbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder="Search students by name, username, email, or ID..." />

        <div className="hidden md:flex items-center px-4 py-2 mt-4 border-b bg-teal-700 rounded-t-lg">
          <p className="text-sm font-semibold md:flex-1">First Name</p>
          <p className="text-sm font-semibold md:flex-1">Last Name</p>
          <p className="text-sm font-semibold md:flex-1">Username</p>
          <p className="text-sm font-semibold md:flex-2">Email</p>
          <p className="text-sm font-semibold md:flex-[0.6]">Student ID</p>
          <p className="text-sm font-semibold md:flex-[0.6]">User ID</p>
          <div className="w-20" />
        </div>

        {filterStudents.length > 0 ? (
          filterStudents.map((student) => {
            const { first_name, last_name, username, email, student_id, user_id } = student;
            const isExpanded = expandedStudentId === user_id;
            const courses = enrolledCourses[user_id];
            const isEditing = EditStudentInfo && editingStudentId === user_id;
              return (
              <div key={user_id} className="border-b border-x odd:bg-(--background-2)">
                {isEditing ? (
                  <form className="px-4 py-3 w-full" onSubmit={(e) => handleStudentInfoChange(e, student)}>
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-0">
                      <EditInfoField label="First Name"   field="first_name"/>
                      <EditInfoField label="Last Name"    field="last_name"/>
                      <EditInfoField label="Username"     field="username"/>
                      <EditInfoField label="Email"        field="email"/>
                      <EditInfoField label="Student ID"   field="student_id"/>
                      <UserInfo label="User ID" value={user_id} valueClassName="text-gray-400 truncate" />
                      <div className="md:w-20 flex flex-row md:flex-col md:items-end gap-3 md:gap-1 pt-1">
                      <button type="submit" className="text-sm text-emerald-800 font-bold hover:underline">
                        Save
                      </button>
                      <button type="button" className="text-sm text-red-600 font-bold hover:underline"
                        onClick={() => { setEditStudentInfo(false); setEditingStudentId(null); setEditFormData({}); }}
                      >
                        Cancel
                      </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div
                    className="px-4 py-3 cursor-pointer hover:bg-cyan-100 dark:hover:bg-(--content-background-2) transition-colors"
                    onClick={() => handleRowClick(student)}
                  >
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-0">
                          <UserInfo className="md:flex-1" label="First Name"  value={first_name} />
                          <UserInfo className="md:flex-1" label="Last Name"   value={last_name} />
                          <UserInfo className="md:flex-1" label="Username"    value={username} />
                          <UserInfo className="md:flex-2" label="Email"       value={email} />
                          <UserInfo className="md:flex-[0.6]" label="Student ID"  value={student_id ?? '—'} />
                          <UserInfo className="md:flex-[0.6]" label="User ID"     value={user_id} />

                      <div className="md:w-20 flex items-center justify-end gap-3 pt-1">
                        <button
                          className="text-sm text-emerald-800 hover:underline"
                          onClick={(e) => HandleEdit(e, student)}
                          aria-label={`Edit ${first_name} ${last_name}`}
                        >
                          <MdModeEditOutline />
                        </button>
                        <span className="text-gray-400 text-xs">
                          {isExpanded ? '▲' : '▼'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {isExpanded && (
                  <div className="bg-gray-50 dark:bg-(--content-background-2) px-6 py-3 border-t text-sm">
                    <h3 className="font-semibold mb-2 text-gray-700">Enrolled Courses</h3>
                    {coursesLoading && !courses ? (
                      <p className="text-gray-400">Loading courses...</p>
                    ) : courses && courses.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="all-pages-style min-w-170 text-left border-collapse">
                          <thead>
                            <tr className="text-gray-500 text-xs uppercase border-b">
                              <th className="py-1 pr-4">Code</th>
                              <th className="py-1 pr-4">Title</th>
                              <th className="py-1 pr-4">Description</th>
                              <th className="py-1 pr-4">Credits</th>
                              <th className="py-1 pr-4">Room</th>
                              <th className="py-1 pr-4">Remove</th>
                            </tr>
                          </thead>
                          <tbody>
                            {courses.map((course) => (
                              <tr key={course.course_id} className="border-b last:border-0">
                                <td className="py-1 pr-4">{course.course_code}</td>
                                <td className="py-1 pr-4">{course.course_title}</td>
                                <td className="py-1 pr-4 text-gray-500">{course.course_desc || '—'}</td>
                                <td className="py-1 pr-4">{course.credits ?? '—'}</td>
                                <td className="py-1 pr-4">{course.room_number || 'TBA'}</td>
                                <td className="py-1 pr-4 text-right">
                                  <UnenrollCourse
                                    course_id={course.course_id}
                                    disabled={true}
                                    // For View_Students the unenroll action should target the student row,
                                    // so pass a lightweight signed_in_user object with that student's id.
                                    signed_in_user={{ user_id }}
                                    SERVER_URL={SERVER_URL}
                                    setCourses={(updater) => setEnrolledCourses(prev => ({
                                      ...prev,
                                      [user_id]: typeof updater === 'function' ? updater(prev[user_id] || []) : updater
                                    }))}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-400">Not enrolled in any courses.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p className="py-2">No students found.</p>
        )}
      </div>
    </ProtectedRoute>
  );
}