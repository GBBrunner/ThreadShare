'use client';

import ProtectedRoute from "@/app/components/ProtectedRoute";
import FormInput from "@/app/components/FormInput";
import LoadingScreen from "@/app/components/LoadingScreen";
import { useState } from "react";
import { useAuth } from '@/app/auth/useAuth'
import { SERVER_URL, getAuthHeaders } from '@/lib/config'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Add_Course() {
    const { signed_in_user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const body = Object.fromEntries(formData.entries());
        try {
            setIsLoading(true);
            // The server is currently running on localhost:3005, but in production this would be the actual domain of the server
            const res = await fetch(`${SERVER_URL}/api/Add_Course`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(body)
            })
            setIsLoading(false);
            // Await the response from the server . This will contain the newly created user data
            const data = await res.json()
            if (!res.ok) {
                setError(data.message || 'Signup failed')
                toast.error(data.message || 'Failed to add course');
            } else {
                setSuccess('Course added successfully');
                toast.success('Course added successfully');
            }
        } catch (err) {
            setError('Network error: ' + err.message)
            toast.error('Network error: ' + err.message);
            setIsLoading(false);
        }
    }

    return (
        <ProtectedRoute 
            isLoggedIn={!!signed_in_user}
            userRole={signed_in_user?.user_role}
            requiredRole={["Admin", "demo-admin"]}
        >
            {isLoading && <LoadingScreen />}
            <div className="flex justify-center items-center py-20">
                <ToastContainer />
                <form className="bg-slate-100 w-80 rounded-t-xs rounded-b-lg p-4 border-b-4 text-black border-black"
                    onSubmit={handleSubmit}
                >
                <h2 className="text-2xl font-bold mb-6">Add a New Course</h2>
                <FormInput inputName="*Course Code"         inputValue="course_code"    required={true} />
                <FormInput inputName="*Course Title"        inputValue="course_title"   required={true} />
                <FormInput inputName="Course Description"   inputValue="course_desc"/>
                <FormInput inputName="Room Number"          inputValue="room_number"/>
                <FormInput inputName="Capacity"             inputValue="capacity"       inputType="number"/>
                <FormInput inputName="Academic Credits"     inputValue="credits"        inputType="number" />
                <FormInput inputName="Tuition Cost $"       inputValue="tuition_cost"   inputType="number" />
                <button type="submit" className="w-full bg-content-1 text-white py-2 rounded hover:bg-emerald-700">Add Course</button>
            </form>
            </div>
        </ProtectedRoute>
    );
}