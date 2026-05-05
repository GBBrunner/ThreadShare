'use client'

import { useState, useEffect, useRef } from "react";
import FormInput from '../components/FormInput';
import LoadingScreen from '../components/LoadingScreen';
import ProtectedRoute from  "@/app/components/ProtectedRoute";
import { useRouter } from "next/navigation";
import { useAuth } from '@/app/auth/useAuth'
import { SERVER_URL } from '@/lib/config'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'

export default function RegisterStudentPage() { 
    const { signed_in_user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const router = useRouter();
    const formRef = useRef(null);
  
  // Password validation for the client-side, 
  // this is redundant because it is also validated on the server side, this is mainly for UX feedback
  const ValidatePassword = (password) => {
    // Password must be at least 8 characters long and include uppercase, lowercase, number, and special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  // Asynchronous Submit handler to send signup data to server and handle response
  // It needs to be async because we are awaiting the fetch response from the server
  async function handleSubmit(e) {
    e.preventDefault()
    // Clear previous error/success messages on new submit
    setError(''); setSuccess('')
    // This form is made in a way that the input names match the expected keys in the server's req.body
    const formData = new FormData(e.target)
    const body = Object.fromEntries(formData.entries())
    // Validate password client-side before making the network request
    if (!ValidatePassword(body.user_password)) {
      setError('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.')
      toast.error('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.');
      return;
    }

    try {
      setIsLoading(true);
      // The server is currently running on localhost:3005, but in production this would be the actual domain of the server
      const res = await fetch(`${SERVER_URL}/api/signup`, {
        // Send a POST request to the /api/signup endpoint as a JSON
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        // Stringify the body object to send it as JSON in the request
        body: JSON.stringify(body)
      })
      // Await the response from the server . This will contain the newly created user data
      const data = await res.json()
      setIsLoading(false);
      if (!res.ok) {
        setError(data.message || 'Signup failed')
        toast.error(data.message || 'Signup failed');
      } else {
        setSuccess('Signup successful');
        toast.success('Student registered successfully!');
        // Server now returns { token, user } — store both
        // Clear the form inputs after successful signup
        if (formRef.current) formRef.current.reset();
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
    <div className="flex flex-col items-center gap-4 py-20">
      {isLoading && <LoadingScreen />}
      <ToastContainer />
      <form
        ref={formRef}
        className="bg-slate-100 w-64 rounded-t-xs rounded-b-lg p-4 border-b-4 text-black border-emerald-500"
        onSubmit={handleSubmit}
      >
        <h1>Register Student</h1>
        <FormInput inputValue="first_name"    inputName="First Name" />
        <FormInput inputValue="last_name"     inputName="Last Name" />
        <FormInput inputValue="username"      inputName="Username" />
        <FormInput inputValue="email"         inputType="email"    inputName="Email" />
        <FormInput inputValue="user_password" inputType="password" inputName="Password" />
        <br />
        <button className="bg-emerald-600 text-white border-b-4 border-emerald-900 px-4 py-2 rounded hover:bg-emerald-500 hover:border-emerald-800"
          type="submit">Sumbit
        </button>
        {/* {error && <p className="text-red-600 mt-2">{error}</p>}
        {success && <p className="text-green-600 mt-2">{success}</p>} */}
      </form>
    </div>
    </ProtectedRoute>
  )
}