import React, { useState } from 'react';

const AddAddressForm = ({ onCancel, onSave }: { onCancel: () => void, onSave: (address: any) => void }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    country: 'Australia',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postcode: '',
    phone: ''
  });
  
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [warning, setWarning] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const digitOnlyValue = value.replace(/\D/g, '');
      setFormData({ ...formData, [name]: digitOnlyValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if (errors[name]) {
      setErrors({ ...errors, [name]: false });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, boolean> = {};
    const requiredFields = ['firstName', 'lastName', 'country', 'address1', 'city', 'state', 'postcode'];
    
    requiredFields.forEach(field => {
      if (!formData[field as keyof typeof formData]) {
        newErrors[field] = true;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setWarning('Please fill in all required details before saving.');
      return;
    }

    onSave(formData);
  };

  // UPDATED: Added 'pr-10' to ensure text doesn't overlap the custom arrow
  // Added 'appearance-none' to remove default browser arrows
  const getInputClass = (fieldName: string) => `
    w-full bg-transparent border p-4 outline-none transition-all duration-200 text-base font-normal
    ${errors[fieldName] 
      ? 'border-red-600 placeholder-red-600' 
      : 'border-[#280F0B66] focus:border-[#280F0B] placeholder-[#280F0B80]'
    }
  `;

  // NEW: Specific style for Select to include custom arrow with padding
  const getSelectClass = (fieldName: string) => `
    ${getInputClass(fieldName)}
    appearance-none
    bg-no-repeat
    bg-[length:16px]
    bg-[right_16px_center] 
  `;
  // Note: bg-[right_16px_center] creates that 16px gap from the border you wanted.

  return (
    <div className="w-full max-w-2xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
      <div className="flex justify-between items-baseline mb-8 border-b border-[#280F0B]/10 pb-4">
        <h2 className="text-3xl font-bold font-manrope text-[#280F0B]">Shipping address</h2>
      </div>

      {warning && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 text-sm font-bold tracking-widest">
          {warning}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* FIX: Use md:grid-cols-2 with gap-4 and ensure items-start to prevent layout shifts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <input name="firstName" placeholder="First name" value={formData.firstName} className={getInputClass('firstName')} onChange={handleChange} />
          <input name="lastName" placeholder="Last name" value={formData.lastName} className={getInputClass('lastName')} onChange={handleChange} />
        </div>

        {/* Updated select with custom arrow SVG */}
        <div className="relative">
          <select 
            name="country" 
            className={getSelectClass('country')} 
            onChange={handleChange} 
            value={formData.country}
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23280F0B'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")` }}
          >
            <option value="Australia">Australia</option>
          </select>
        </div>

        <input name="address1" placeholder="House number and street name" value={formData.address1} className={getInputClass('address1')} onChange={handleChange} />
        <input name="address2" placeholder="Apartment, suite, unit, etc. (optional)" value={formData.address2} className={getInputClass('address2')} onChange={handleChange} />

        {/* FIX: Town/City and State Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <input name="city" placeholder="Town / City" value={formData.city} className={getInputClass('city')} onChange={handleChange} />
          <div className="relative">
            <select 
              name="state" 
              className={getSelectClass('state')} 
              onChange={handleChange} 
              value={formData.state}
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23280F0B'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")` }}
            >
              <option value="">Choose a state</option>
              <option value="NSW">New South Wales</option>
              <option value="VIC">Victoria</option>
              <option value="SA">South Australia</option>
              <option value="WA">Western Australia</option>
              <option value="QLD">Queensland</option>
              <option value="TAS">Tasmania</option>
            </select>
          </div>
        </div>

        <input name="postcode" placeholder="Postcode" value={formData.postcode} className={getInputClass('postcode')} onChange={handleChange} />
        
        <input name="phone" placeholder="Phone (optional)" value={formData.phone} className={getInputClass('phone')} onChange={handleChange} inputMode="numeric" />

        <div className="flex flex-col md:flex-row gap-4 pt-4">
          <button type="submit" className="bg-[#7F3E2F] text-[#FCF3E5] px-12 py-5 font-bold tracking-[1.12px] hover:brightness-110 transition-all uppercase text-sm">
            SAVE ADDRESS
          </button>
          <button type="button" onClick={onCancel} className="text-[#280F0B] px-12 py-5 font-bold tracking-[1.12px] uppercase text-sm hover:underline">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAddressForm;