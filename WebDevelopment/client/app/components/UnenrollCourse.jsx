import { FaTrashAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useState } from 'react';
import LoadingScreen from '@/app/components/LoadingScreen';
import { getAuthHeaders } from '@/lib/config';

export default function UnenrollCourse({
    course_id,
    disabled,
    signed_in_user,
    setCourses,
    SERVER_URL
}) {
    const [isLoading, setIsLoading] = useState(false);

    // Only show the unenroll button for courses the student is already enrolled in
    if (!disabled) return null;

    async function handleUnenroll(course_id) {
        const ok = window.confirm('Are you sure you want to remove enrollment for this course?');
        if (!ok) return;

        try {
            setIsLoading(true);

            const res = await fetch(`${SERVER_URL}/api/Enroll_Course`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    course_id,
                    user_id: signed_in_user.user_id
                })
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.message || 'Failed to remove enrollment');
                return;
            }
            // Update local list to reflect unenrolled status
            setCourses(prev => {
                // Check if courses have is_enrolled property (Enroll page) or not (My_Courses page)
                // it checks if at least one course has the is_enrolled property to determine how to update the state
                const enrollStatus = prev.some(c => 'is_enrolled' in c);
                    if (enrollStatus) {
                    return prev.map(c => (
                        // Map through courses and update the is_enrolled status for the unenrolled course
                        c.course_id === course_id ? { ...c, is_enrolled: false } : c
                    ));
                } else {
                    // Filter out all courses except the ones that do not match the unenrolled course_id, 
                    // essentially removing it from the list
                    return prev.filter(c => c.course_id !== course_id);
                }
            });
            toast.success('Successfully removed course!');
        } catch (error) {
            console.error('Error occurred while trying to unenroll:', error);
            toast.error('Failed to unenroll from course.');
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            {isLoading && <LoadingScreen />}
            <button 
                type="button"
                onClick={() => handleUnenroll(course_id)}
                title="Remove from My Courses"
                aria-label='Remove Enrollment'
                className="text-red-500 hover:text-red-700">
                <FaTrashAlt />
            </button>
        </>
    );
}