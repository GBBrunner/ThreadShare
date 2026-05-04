'use client';

import ProtectedRoute from "@/app/components/ProtectedRoute";
import { useEffect, useState, useRef } from "react";
import { useAuth } from '@/app/auth/useAuth';
import { SERVER_URL, getAuthHeaders } from '@/lib/config';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
// Components
import Searchbar from       "@/app/components/Searchbar";
import LoadingScreen from   "@/app/components/LoadingScreen";
import ListLabel from       "@/app/components/ListLabel";
// React Icons
import { MdModeEditOutline } from "react-icons/md";

export default function View_Students() {
  const  { signed_in_user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState({});
  const [coursesLoading, setCoursesLoading] = useState(false);

  const HandleEdit = (e, student) => {
    e.stopPropagation();
    toast.info(`Editing details for ${student.first_name} ${student.last_name}`);
    // Implement the logic to edit student details
  };

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
      } catch (err) {
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

    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${SERVER_URL}/api/View_Students?user_id=${userID}`, {
          headers: getAuthHeaders()
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setUsers(data || []);
        setError(null);
      } catch (error) {
        console.error('Error fetching students:', error);
        setError('Failed to fetch students');
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
        requiredRole="admin"
    >
      <ToastContainer />
      <div className="all-pages-style px-8 pt-[7.5em] pb-16">
        {isLoading && <LoadingScreen />}
        <h1 className="text-2xl font-bold mb-4">View Students</h1>
        <Searchbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder="Search students by name, username, email, or ID..." />

        <div className="flex items-center px-4 py-2 mt-4 border-b bg-teal-700 rounded-t-lg">
          <ListLabel className="flex-1" value="First Name" />
          <ListLabel className="flex-1" value="Last Name" />
          <ListLabel className="flex-1" value="Username" />
          <ListLabel className="flex-1" value="Email" />
          <ListLabel className="flex-1" value="Student ID" />
          <ListLabel className="flex-1" value="User ID" />
          <div className="w-20" />
        </div>

        {filterStudents.length > 0 ? (
          filterStudents.map((student) => {
            const isExpanded = expandedStudentId === student.user_id;
            const courses = enrolledCourses[student.user_id];
            return (
              <div key={student.user_id} className="border-b border-x">
                <div
                  className="flex items-center px-4 py-3 cursor-pointer hover:bg-cyan-100 transition-colors"
                  onClick={() => handleRowClick(student)}
                >
                  <p className="flex-1 text-sm">{student.first_name}</p>
                  <p className="flex-1 text-sm">{student.last_name}</p>
                  <p className="flex-1 text-sm">{student.username}</p>
                  <p className="flex-1 text-sm">{student.email}</p>
                  <p className="flex-1 text-sm">{student.student_id ?? '—'}</p>
                  <p className="flex-1 text-sm">{student.user_id}</p>
                  <div className="w-20 flex items-center justify-end gap-2">
                    <button
                      className="text-sm text-emerald-800 hover:underline"
                      onClick={(e) => HandleEdit(e, student)}
                    >
                      <MdModeEditOutline/>
                    </button>
                    <span className="text-gray-400 text-xs">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>
                {isExpanded && (
                  <div className="bg-gray-50 px-6 py-3 border-t text-sm">
                    <h3 className="font-semibold mb-2 text-gray-700">Enrolled Courses</h3>
                    {coursesLoading && !courses ? (
                      <p className="text-gray-400">Loading courses...</p>
                    ) : courses && courses.length > 0 ? (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="text-gray-500 text-xs uppercase border-b">
                            <th className="py-1 pr-4">Code</th>
                            <th className="py-1 pr-4">Title</th>
                            <th className="py-1 pr-4">Description</th>
                            <th className="py-1 pr-4">Credits</th>
                            <th className="py-1 pr-4">Room</th>
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
                            </tr>
                          ))}
                        </tbody>
                      </table>
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