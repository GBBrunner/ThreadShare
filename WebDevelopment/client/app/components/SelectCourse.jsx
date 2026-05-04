import { useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import UnenrollCourse from "./UnenrollCourse";
export default function SelectCourse({
  course_id,
  course_code,
  course_title,
  course_desc = "No description given",
  room_number = "TBA",
  capacity = 0,
  credits = 0,
  tuition_cost = 0,
  created_at = "N/A",
  updated_at = "N/A",
  instructor = "TBA",
        is_enrolled = false,
        signed_in_user,
        setCourses,
        SERVER_URL,
        mode = "enroll",
}) {
const isMyCoursesMode = mode === "my_courses";
const [expandedDesc, setExpandedDesc] = useState(false);

return (
    <div className="flex items-start gap-4 py-2 px-2 border-b border-slate-200">
        {!isMyCoursesMode && (
            <div className="w-8 flex items-center gap-2">
                {is_enrolled ? (
                    <input
                        id={`enrolled-${course_id}`}
                        type="checkbox"
                        disabled
                        checked
                        aria-label="Already enrolled"
                        className="bg-slate-100 border text-slate-400 border-slate-300 rounded-md px-2 py-1 opacity-50"
                    />
                ) : (
                    <input
                        id={course_id}
                        type="checkbox"
                        name="course_id"
                        value={course_id}
                        className="bg-slate-100 border text-emerald-950 border-slate-300 rounded-md px-2 py-1 accent-emerald-900"
                    />
                )}
            </div>
        )}

        <div className="flex flex-1 items-start gap-4 overflow-hidden">
            <p className="w-28 text-sm truncate">{course_code}</p>
            <div className="w-56 text-sm truncate flex flex-col">
                {!isMyCoursesMode && is_enrolled && (
                    <span className="flex items-center gap-1 text-green-700 font-bold text-xs mb-1">
                        <FaCheckCircle className="text-green-600" aria-label="Already enrolled" />
                        Already enrolled
                    </span>
                )}
                <p className="truncate">{course_title}</p>
            </div>
            <div 
            // Generated with AI,
            // This is to handle long course descriptions, clicking on the box will expand the description, 
            // clicking away will collapse it again. This is to prevent the course description from taking up too much space in the UI, while still allowing the user to read the full description if they want to.
                className="w-104 text-sm cursor-pointer relative"
                onClick={() => setExpandedDesc(!expandedDesc)}
                onBlur={() => setExpandedDesc(false)}
                tabIndex={0}
            >
                <p className={expandedDesc ? "" : "line-clamp-2"}>{course_desc}</p>
            </div>
            <p className="w-28 text-sm text-center truncate">{room_number}</p>
            <p className="w-16 text-sm text-center">{capacity}</p>
            <p className="w-16 text-sm text-center">{credits}</p>
            <p className="w-36 text-sm text-center">{tuition_cost}</p>
            <p className="w-28 text-sm truncate">{created_at}</p>
            <p className="w-28 text-sm truncate">{updated_at}</p>
            <p className="w-44 text-sm truncate">{instructor}</p>
            <div className="ml-auto w-8 flex justify-center">
                {is_enrolled && signed_in_user && setCourses && SERVER_URL && (
                    <UnenrollCourse
                        course_id={course_id}
                        disabled={true}
                        signed_in_user={signed_in_user}
                        setCourses={setCourses}
                        SERVER_URL={SERVER_URL}
                    />
                )}
            </div>
        </div>
    </div>
);
}