'use client';

import ProtectedRoute from "@/app/components/ProtectedRoute";
import SelectCourse from '@/app/components/SelectCourse';
import Searchbar from "@/app/components/Searchbar";
import LoadingScreen from "@/app/components/LoadingScreen";
import ListLabel from '@/app/components/ListLabel';
import { useEffect, useState } from "react";
import { useAuth } from '@/app/auth/useAuth';
import { SERVER_URL, getAuthHeaders } from '@/lib/config';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'

export default function ViewCourses({ method, endpoint, mode = "enroll" }) {
    const isMyCoursesMode = mode === "my_courses";
    const { signed_in_user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    // State to hold the list of courses fetched from the server
    const [courses, setCourses] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const course_ids = formData.getAll('course_id');
        // The body will be contained with the user_id of the user
        // and an array of course_ids that the user wants to enroll in
        const body = {
            user_id: signed_in_user?.user_id,
            course_ids,
        };
        try {
            setIsLoading(true);
            // The server is currently running on localhost:3005, but in production this would be the actual domain of the server
            const res = await fetch(`${SERVER_URL}${endpoint}`, {
                method: method,
                headers: getAuthHeaders(),
                body: JSON.stringify(body)
            })
            setIsLoading(false);
            // Await the response from the server . This will contain the newly created user data
            const data = await res.json()
            if (!res.ok) {
                setError(data.message || 'Enrollment failed')
                toast.error(data.message || 'Failed to enroll in courses');
            } else {
                const inserted = data.insertedCount ?? 0;
                if (inserted > 0) {
                    setSuccess('Courses Added successfully');
                    window.location='/My_Courses';
                } else {
                    setSuccess('');
                }
                const duplicates = Array.isArray(data.alreadyEnrolledIds) ? data.alreadyEnrolledIds : [];
                if (duplicates.length > 0) {
                    duplicates.forEach(id => {
                        const matched = courses.find(c => c.course_id === id);
                        const title = matched?.course_title || 'this course';
                        toast.info(`User already has ${title} enrolled`);
                    });
                }
            }
        } catch (err) {
            setError('Network error: ' + err.message)
            toast.error('Network error: ' + err.message);
            setIsLoading(false);
        }
    }
    //  Use useEffect to fetch the courses from the server when the component mounts
    useEffect(() => {
        const userId = signed_in_user?.user_id;
        if (!userId) return; // wait until user context is ready
        setIsLoading(true);
        const fetchCourses = async () => {
            try {
                // Fetch all courses enriched with this user's enrollment status
                const url = `${SERVER_URL}${endpoint}?student_id=${encodeURIComponent(userId)}`;
                const res = await fetch(url, { headers: getAuthHeaders() });
                if (!res.ok) {
                    throw new Error('Failed to fetch courses');
                }
                const data = await res.json();
                setCourses(data);
                setIsLoading(false);
            } catch (err) {
                console.error('Error fetching courses:', err);
                setIsLoading(false);
            }
        };
        fetchCourses();
    }, [signed_in_user]);
//  Only show courses that include the search term in the course code, title, or description
    const filteredCourses = courses.filter(course => {
        if (!searchTerm) return true;

        const search_input = searchTerm.toLowerCase();
        return (
            course.course_code.toLowerCase().includes(search_input) ||
            course.course_title.toLowerCase().includes(search_input) ||
            course.course_desc.toLowerCase().includes(search_input)
        );
    });

    // Totals for My Courses view (computed from currently filtered courses)
    const totalCredits = filteredCourses.reduce((sum, course) => sum + (course.credits || 0), 0);
    const totalTuition = filteredCourses.reduce((sum, course) => sum + (Number(course.tuition_cost) || 0), 0);

    return (
        // Only users with the role "student" can access this page
        <ProtectedRoute
            isLoggedIn={!!signed_in_user}
            userRole={signed_in_user?.user_role}
            requiredRole="student"
        >
            {isLoading && <LoadingScreen />}
            <div className="headerSpace"></div>
            <main className="flex justify-center mt-4">
            <div className="h-[calc(100vh-10em)] rounded-2xl text-slate-700 bg-white overflow-hidden flex flex-col p-4 mb-4 justify-center">
                <h1 className="text-2xl font-bold mb-4">{isMyCoursesMode ? 'My Courses' : 'Enroll Page'}</h1>
                <form className="flex flex-col flex-1 min-h-0"
                 onSubmit={isMyCoursesMode ? (e) => e.preventDefault() : handleSubmit}>
                    {isMyCoursesMode && filteredCourses.length > 0 && (
                        <div className="mb-4 flex justify-end gap-8 text-sm font-semibold">
                            <div className="flex text-yellow-500 gap-2">
                                <span className="font-extrabold mx-1">Total Credits:</span>
                                <span>{totalCredits}</span>
                            </div>

                            <div className="flex text-green-700 gap-2">
                                <span className="font-extrabold mx-1">Total Tuition:</span>
                                <span>${totalTuition.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    )}
                    <Searchbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder="Search courses..." />
                    {/* Courses List Labels, I am sure there is a better way to do this dynamically 
                    It is functional though
                    */}
                    <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2">
                        <div className="flex items-start gap-4 overflow-hidden px-2">
                            {!isMyCoursesMode && <div className="w-8" />}
                            <div className="flex flex-1 items-start gap-4 overflow-hidden">
                                <ListLabel width={28} value="Course Code" />
                                <ListLabel width={56} value="Course Title" />
                                <ListLabel width={104} value="Course Description" />
                                <ListLabel width={28} value="Room Number" center />
                                <ListLabel width={16} value="Capacity" center />
                                <ListLabel width={16} value="Credits" center />
                                <ListLabel width={36} value="Tuition Cost (USD)" center nowrap />
                                <ListLabel width={28} value="Created At" />
                                <ListLabel width={28} value="Updated At" />
                                <ListLabel width={44} value="Instructor" />
                            </div>
                        </div>
                        {/* Filtered Courses List, when search term is applied */}
                        {filteredCourses.length > 0 ? (
                            // Map through the courses array and display a SelectCourse component for each course in the database
                            // For every course in the course table in the PostgreSQL database
                            filteredCourses.map((course, index) => (
                                <SelectCourse
                                    key={index}
                                    course_id={course.course_id}
                                    // Display the correlating course info in the DB.
                                    // Technically, the only ones needed for enrollment are course_id and course_code,
                                    // but it improves the UX to show all the course info
                                    course_code={course.course_code}
                                    course_title={course.course_title}
                                    course_desc={course.course_desc || 'No description given'}
                                    room_number={course.room_number || 'TBA'}
                                    capacity={course.capacity || 0}
                                    credits={course.credits || 0}
                                    tuition_cost={course.tuition_cost ? `$${course.tuition_cost}` : 'TBA'}
                                    created_at={course.created_at || 'N/A'}
                                    updated_at={course.updated_at || 'N/A'}
                                    instructor={course.instructor || 'TBA'}
                                    // Use enriched response flag if present
                                    is_enrolled={isMyCoursesMode || !!(course.is_enrolled ?? course.enrolled ?? course.already_enrolled)}
                                    signed_in_user={signed_in_user}
                                    setCourses={setCourses}
                                    SERVER_URL={SERVER_URL}
                                    mode={mode}
                                />
                            ))
                        ) : (
                            <p className="text-gray-500">{isMyCoursesMode ? 'You are not enrolled in any courses' : 'No courses available'}</p>
                        )}
                    </div>
                    {!isMyCoursesMode && (
                        <button type="submit" className="mt-4 bg-emerald-500 text-white px-4 py-2 rounded">
                            Add Courses
                        </button>
                    )}
                </form>
                <ToastContainer />
            </div>
            </main>
        </ProtectedRoute>
    );
}