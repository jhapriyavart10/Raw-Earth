'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// 1. Fixed Interface: Removed the trailing "| null" syntax error
interface FormState {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  currentPass: string;
  newPass: string;
  confirmPass: string;
}

interface AccountDetailsProps {
  user: any; // Accept the user prop passed from the parent page
}

const InputField = ({ 
  label, 
  field, 
  type = "text", 
  value, 
  error, 
  onChange 
}: { 
  label: string, 
  field: keyof FormState, 
  type?: string, 
  value: string, 
  error?: string, 
  onChange: (field: keyof FormState, value: string) => void 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === "password";

  return (
    <div className="w-full flex flex-col gap-1 min-h-[82px]">
      <div className="relative w-full">
        <input
          type={isPasswordField ? (showPassword ? "text" : "password") : type}
          placeholder={label}
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
          className={`w-full bg-transparent border p-4 pr-12 outline-none transition-all duration-300
            placeholder:text-[#280F0B80]
            ${error ? 'border-red-500' : 'border-[#280F0B33] focus:border-[#280F0B]'} 
            text-[#280F0B] font-manrope`}
        />
        
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#280F0B] opacity-50 hover:opacity-100 transition-opacity"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      <div className="h-5 relative">
        {error && <span className="text-red-500 text-[10px] absolute top-0 left-0 animate-in fade-in slide-in-from-top-1">{error}</span>}
      </div>
    </div>
  );
};

// 2. Accept 'user' as a prop
const AccountDetails = ({ user }: AccountDetailsProps) => {
  const [formData, setFormData] = useState<FormState>({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    currentPass: '',
    newPass: '',
    confirmPass: '',
  });

  const [errors, setErrors] = useState<Partial<FormState>>({});
  const isPasswordSectionFilled = formData.currentPass.trim().length > 0 && formData.newPass.length > 0 && formData.confirmPass.length > 0;

  // 3. Sync form data with the user prop when it loads
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        username: user.email ? user.email.split('@')[0] : '',
      }));
    }
  }, [user]);

  const validate = () => {
    const newErrors: Partial<FormState> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Only validate password fields if the user is trying to change them
    const fieldsToValidate: Array<keyof FormState> = ['firstName', 'lastName', 'username', 'email'];
    
    fieldsToValidate.forEach((key) => {
      if (!formData[key].trim()) {
        newErrors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} is required`;
      }
    });

    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    // Password validation (only if a new password is being entered)
    if (formData.newPass || formData.currentPass) {
      if (!formData.currentPass) newErrors.currentPass = 'Current password required to make changes';
      if (formData.newPass.length < 8) newErrors.newPass = 'New password must be at least 8 characters';
      if (formData.newPass !== formData.confirmPass) newErrors.confirmPass = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormState, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      try {
        const res = await fetch('/api/auth/update-customer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            password: formData.newPass || undefined, 
          }),
        });

        if (res.ok) {
          alert('Changes saved successfully!');
        } else {
          const errorData = await res.json();
          alert(errorData.message || 'Update failed');
        }
      } catch (err) {
        alert('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <section className="mb-6">
        <h2 className="font-manrope font-bold text-[20px] md:text-[24px] leading-[100%] tracking-[-0.5px] text-[#280F0B] mb-6">
          Primary Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <InputField label="First name" field="firstName" value={formData.firstName} error={errors.firstName} onChange={handleInputChange} />
          <InputField label="Last name" field="lastName" value={formData.lastName} error={errors.lastName} onChange={handleInputChange} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <InputField label="Username" field="username" value={formData.username} error={errors.username} onChange={handleInputChange} />
          <InputField label="Email Address" field="email" type="email" value={formData.email} error={errors.email} onChange={handleInputChange} />
        </div>
      </section>

      <section className="mb-6">
        <h2 className="font-manrope font-bold text-[20px] md:text-[24px] leading-[100%] tracking-[-0.5px] text-[#280F0B] mb-6">
          Change Password
        </h2>
        <div className="flex flex-col">
          <InputField label="Current password" field="currentPass" type="password" value={formData.currentPass} error={errors.currentPass} onChange={handleInputChange} />
          <InputField label="New password" field="newPass" type="password" value={formData.newPass} error={errors.newPass} onChange={handleInputChange} />
          <InputField label="Confirm new password" field="confirmPass" type="password" value={formData.confirmPass} error={errors.confirmPass} onChange={handleInputChange} />
        </div>
      </section>

      <button 
        type="submit"
        disabled={!isPasswordSectionFilled}
        className={`text-white px-12 py-3 font-medium tracking-[0.1em] transition-all duration-300 uppercase text-sm w-full md:w-auto mt-4
          ${isPasswordSectionFilled 
            ? 'bg-[#7F3E2F] cursor-pointer' 
            : 'bg-[#B68D73] cursor-not-allowed opacity-80'}`}
      >
        Save Changes
      </button>
    </form>
  );
};

export default AccountDetails;