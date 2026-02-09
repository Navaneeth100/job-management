'use client';
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { url } from '../../mainurl';
import { Lock, Unlock } from "lucide-react";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const initialValues = { email: '', password: '' };

    const validationSchema = Yup.object({
        email: Yup.string().email('Invalid email format').required('Email is required'),
        password: Yup.string().min(4, 'Password must be at least 4 characters').required('Password is required'),
    });

    const handleSubmit = async (values) => {
        try {
            const formData = new FormData();
            formData.append("email", values.email);
            formData.append("password", values.password);

            const res = await axios.post(`${url}/login`, formData, {
                headers: {
                    Accept: "application/json",
                },
            });

            if (res.data.access_token) {
                toast.success("Login successful");
                console.log(res.data.companies);

                localStorage.setItem("token", res.data.access_token);
                localStorage.setItem("refresh_token", res.data.refresh_token);
                localStorage.setItem(
                    "user",
                    JSON.stringify({
                        id: res.data.id,
                        name: res.data.first_name,
                        email: res.data.email,
                        image: res.data.profile_image_url
                    })
                );

                if (Array.isArray(res.data.companies)) {
                    localStorage.setItem("company_id", "01kfashbm81jr195yza9wfhsna");
                } else {
                    localStorage.setItem("company_id", "01kfashbm81jr195yza9wfhsna");
                }

                setTimeout(() => {
                    navigate("/dashboard");
                }, 1000);
            }

        } catch (err) {
            console.log(err.response?.data);
            toast.error(err.response?.data?.message || "Login failed");
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">

            {/* Purple Wave Glow */}
            <div className="absolute inset-0">
                <div className="absolute w-[900px] h-[900px] bg-purple-600/40 blur-[180px] rounded-full left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2"></div>
            </div>

            <div className="relative w-full max-w-md px-6">

                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 text-white">
                    <div className="text-start mb-6">
                        <h2 className="text-2xl font-semibold">Sign in</h2>
                        <p className="text-sm text-gray-300">log in to manage your account</p>
                    </div>

                    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
                        {() => (
                            <Form className="space-y-5">
                                <div>
                                    <Field
                                        name="email"
                                        type="email"
                                        placeholder="Email"
                                        className="w-full bg-white/10 border border-white/20 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-300 text-white"
                                    />
                                    <ErrorMessage name="email" component="div" className="text-red-500 text-xs text-start italic mt-1" />
                                </div>

                                <div className="relative">
                                    <Field
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Password"
                                        className="w-full bg-white/10 border border-white/20 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-300 text-white"
                                    />
                                    <span
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 cursor-pointer"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <Unlock size={20} /> : <Lock size={20} />}
                                    </span>
                                    <ErrorMessage name="password" component="div" className="text-red-500 text-xs text-start italic mt-1" />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-90 text-white py-3 rounded-lg font-medium transition-all duration-300 shadow-lg shadow-purple-500/30"
                                >
                                    Login
                                </button>

                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
    );
}
