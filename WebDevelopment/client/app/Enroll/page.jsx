'use client';
import ViewCourses from "@/app/components/ViewCourses";
export default function Enroll() {
    return <ViewCourses method="POST" endpoint="/api/Enroll_Course" />;
}