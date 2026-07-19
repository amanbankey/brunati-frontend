import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import toast from 'react-hot-toast';

const ForgotPasswordForm = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ mobile: '', newPassword: '' });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const validateField = (name, value) => {
        let errorMsg = '';
        if (name === 'mobile') {
            if (!value) errorMsg = "Please enter your mobile number";
            else if (value.length !== 10) errorMsg = "Mobile number must be exactly 10 digits";
        }
        if (name === 'newPassword') {
            if (!value) errorMsg = "Please enter your new password";
            else if (value.length < 6) errorMsg = "Password must be at least 6 characters";
        }
        
        setErrors(prev => {
            const newErrors = { ...prev };
            if (errorMsg) newErrors[name] = errorMsg;
            else delete newErrors[name];
            return newErrors;
        });
        return !errorMsg;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const isMobileValid = validateField('mobile', form.mobile);
        const isPasswordValid = validateField('newPassword', form.newPassword);
        
        if (isMobileValid && isPasswordValid) {
            try {
                setLoading(true);
                const response = await userService.forgotPassword({ phone: form.mobile, newPassword: form.newPassword });
                if (response.status) {
                    toast.success('Password reset successfully! You can now sign in.');
                    navigate('/signin');
                } else {
                    toast.error(response.message || 'Failed to reset password');
                    setErrors({ general: response.message });
                }
            } catch (err) {
                const errorMsg = err.response?.data?.message || 'Failed to reset password. Please try again.';
                toast.error(errorMsg);
                setErrors({ general: errorMsg });
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="w-full max-w-md mx-auto bg-white p-8 md:p-16 flex flex-col justify-center shadow-[0_0_40px_rgba(0,0,0,0.05)] md:shadow-2xl">
            <h2 className="text-center text-[24px] font-[300] tracking-[1px] uppercase text-black mb-8" style={{ fontFamily: 'Inter, Roboto, system-ui, sans-serif' }}>
                RESET PASSWORD
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4" style={{ fontFamily: 'Inter, Roboto, system-ui, sans-serif' }}>
                <div>
                    <input 
                        type="tel" 
                        placeholder="MOBILE NUMBER" 
                        value={form.mobile}
                        onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setForm({...form, mobile: val});
                            validateField('mobile', val);
                        }}
                        className={`w-full bg-white border ${errors.mobile ? 'border-red-500' : 'border-[#D1D5DB]'} rounded-none p-[16px] text-black text-sm placeholder:text-[#6B7280] placeholder:text-[12px] placeholder:tracking-[0.05em] placeholder:uppercase focus:outline-none focus:border-black transition-colors mb-1`}
                    />
                    {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
                </div>
                
                <div>
                    <div className="relative">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="NEW PASSWORD" 
                            value={form.newPassword}
                            onChange={(e) => {
                                const val = e.target.value;
                                setForm({...form, newPassword: val});
                                validateField('newPassword', val);
                            }}
                            className={`w-full bg-white border ${errors.newPassword ? 'border-red-500' : 'border-[#D1D5DB]'} rounded-none p-[16px] pr-[48px] text-black text-sm placeholder:text-[#6B7280] placeholder:text-[12px] placeholder:tracking-[0.05em] placeholder:uppercase focus:outline-none focus:border-black transition-colors mb-1`}
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>}
                </div>

                <div className="mt-4 flex justify-center">
                    <button type="submit" disabled={loading} className="bg-black text-white rounded-none py-[12px] px-[24px] uppercase font-[600] tracking-[1px] w-full max-w-[250px] hover:bg-gray-900 transition-colors disabled:opacity-50">
                        {loading ? 'RESETTING...' : 'RESET PASSWORD'}
                    </button>
                </div>

                <p className="text-center mt-6 text-[12px] text-[#6B7280]">
                    Remembered your password?{' '}
                    <Link to="/signin" className="text-black underline uppercase text-[12px] font-semibold tracking-wider ml-1">
                        Sign In
                    </Link>
                </p>
            </form>
        </div>
    );
};

export default ForgotPasswordForm;
