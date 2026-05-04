'use client';

import ViewCourses from "@/app/components/ViewCourses";

export default function My_Courses() {
    
    return (
        <div>
            <ViewCourses method="GET" endpoint="/api/My_Courses" mode="my_courses" />
        </div>
    )
}