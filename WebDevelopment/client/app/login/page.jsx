'use client'

import FormInput from '../components/FormInput';
import LoadingScreen from '../components/LoadingScreen';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from '@/app/auth/useAuth'
import { SERVER_URL } from '@/lib/config'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'

export default function LoginPage() {
    // AuthContext provides signIn function and current signed-in user
    const { signIn, signed_in_user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();

    // If user is already signed in, redirect away from login page
    useEffect(() => {
        if (signed_in_user) {
            router.replace('/dashboard');
        }
    }, [signed_in_user, router]);

    // Asynchronous submit handler to send login data to server and handle response
    async function handleSubmit(e, type = '') {
        e.preventDefault && e.preventDefault();
        setError('');
        setSuccess('');

        let body;
        if (type === "demo-stu") {
            body = { username: "demo-stu", password: "demo-stu" };
        } else if (type === "demo-admin") {
            body = { username: "demo-admin", password: "demo-admin" };
        } else {
            // Only use FormData for the main login form
            const formData = new FormData(e.target);
            body = Object.fromEntries(formData.entries());
        }

        try {
            setIsLoading(true);
            const res = await fetch(`${SERVER_URL}/api/login/${type}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
            setIsLoading(false);

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                let message = data?.message || 'Login failed';
                if (res.status === 401) {
                    message = 'Username or password incorrect';
                }
                setError(message);
                toast.error(message);
                return;
            }

            if (data?.user) {
                const userWithRole = {
                    ...data.user,
                    user_role: data.user.user_role || 'user'
                };
                signIn(userWithRole, data.token);
            } else {
                signIn({ username: body.username, user_role: 'user' });
            }
            router.push('/dashboard');
        } catch (err) {
            setError(err.message || 'An unexpected error occurred');
            toast.error(err.message || 'An unexpected error occurred');
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-center gap-4 py-20">
            {isLoading && <LoadingScreen />}
            <ToastContainer />
            <div className="flex justify-center items-center gap-10">
                <form
                    className="bg-slate-100 w-64 rounded-t-xs rounded-b-lg p-4 border-b-4 text-black border-emerald-500"
                    onSubmit={handleSubmit}
                >
                    <h1>Login Page</h1>
                    <FormInput inputValue="username" inputName="Username" />
                    <FormInput inputValue="password" inputType="password" inputName="Password" />
                    {success && <p className="text-green-600 text-sm mt-2">{success}</p>}
                    <button className="bg-emerald-600 text-white border-b-4 border-emerald-900 px-4 py-2 rounded hover:bg-emerald-500 hover:border-emerald-800"
                        type="submit">Login
                    </button>
                </form>
                <div className="flex flex-col gap-4 justify-center bg-slate-100 w-64 rounded-t-xs rounded-b-lg p-4 border-b-4 text-black border-emerald-500">
                    <button 
                        className="bg-emerald-600 text-white border-b-4 border-emerald-900 px-4 py-2 rounded hover:bg-emerald-500 hover:border-emerald-800 mb-2 w-full"
                        onClick={(e) => handleSubmit(e, "demo-stu")}
                    >
                        Login as Demo Student
                    </button>
                    <button 
                        className="bg-rose-600 text-white border-b-4 border-rose-900 px-4 py-2 rounded hover:bg-rose-500 hover:border-rose-800 w-full"
                        onClick={(e) => handleSubmit(e, "demo-admin")}
                    >
                        Login as Demo Admin
                    </button>
                </div>
            </div>

            <a href="/signup">Don't have an account? Sign Up instead</a>
        </div>
    );
}
