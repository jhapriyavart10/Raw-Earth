'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { z } from 'zod';

// 1. Define strict Card Schema
const CardSchema = z.object({
  cardNumber: z.string()
    .regex(/^\d{16}$/, "Card number must be exactly 16 digits"),
  
  expiry: z.string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Expiry must be MM/YY (e.g., 12/25)"),
  
  cvc: z.string()
    .regex(/^\d{3,4}$/, "CVC must be 3 or 4 digits"),
    
  country: z.string().min(1, "Country is required")
});

const AddCard = ({ onCancel, onSave }: { onCancel: () => void, onSave: (card: any) => void }) => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiry: '',
    cvc: '',
    country: 'Australia'
  });

  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [warning, setWarning] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error for this field immediately when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: false });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setWarning('');

    const dataToValidate = {
      cardNumber: formData.cardNumber.replace(/\s/g, ''),
      expiry: formData.expiry,
      cvc: formData.cvc,
      country: formData.country
    };

    // 3. Run Zod Validation
    const validation = CardSchema.safeParse(dataToValidate);

    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      
      // Update errors state to highlight invalid fields in red
      const newErrors: Record<string, boolean> = {};
      if (fieldErrors.cardNumber) newErrors.cardNumber = true;
      if (fieldErrors.expiry) newErrors.expiry = true;
      if (fieldErrors.cvc) newErrors.cvc = true;
      if (fieldErrors.country) newErrors.country = true;
      
      setErrors(newErrors);
      
      // Show the first human-readable error message
      const firstErrorMessage = Object.values(fieldErrors)[0]?.[0];
      setWarning(firstErrorMessage || 'Please fill in all card details correctly.');
      return;
    }

    // 4. If valid, proceed to API
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/shopify/save-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          last4: dataToValidate.cardNumber.slice(-4), // Use the validated, clean data
          brand: 'Card', 
          expiry: dataToValidate.expiry
        }),
      });

      if (response.ok) {
        // Pass the original formData (or validated data) back to parent
        onSave(formData);
      } else {
        const errorData = await response.json();
        setWarning(errorData.error || 'Failed to save card to Shopify.');
      }
    } catch (err) {
      setWarning('Server error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Styling logic
  const getInputClass = (fieldName: string) => `
    w-full bg-transparent border p-4 outline-none transition-colors text-sm
    ${errors[fieldName] 
      ? 'border-red-600 placeholder-red-600' 
      : 'border-[#280F0B66] focus:border-[#280F0B] placeholder-[#280F0B80]'
    }
  `;

  // Specific style for Select to include custom arrow
  const getSelectClass = (fieldName: string) => `
    ${getInputClass(fieldName)}
    appearance-none
    bg-no-repeat
    bg-[length:16px]
    bg-[right_16px_center]
  `;
  
  const arrowIcon = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23280F0B'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`;
  return (
    <div className="w-full max-w-2xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left font-manrope">
      <div className="flex justify-between items-center mb-8 border-b border-[#280F0B]/10 pb-4">
        <h2 className="text-3xl font-bold font-manrope text-[#280F0B]">Add Payment Method</h2>
      </div>

      {warning && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 text-xs font-bold tracking-widest">
          {warning}
        </div>
      )}

      <form onSubmit={handleSave} className="border border-[#280F0B33] rounded-sm p-6 space-y-6 bg-white/30">
        {/* Top Header Row */}
        <div className="flex justify-between items-center border-b border-[#280F0B1A] pb-4 mb-4">
          <div className="flex items-center gap-3">
            <input type="radio" checked readOnly className="accent-[#7F3E2F] w-4 h-4" />
            <label className="font-bold text-[#280F0B] uppercase tracking-widest text-sm">Card</label>
          </div>
          <Image src="/assets/images/card.svg" alt="Card" width={24} height={24} className="opacity-60" />
        </div>

        {/* Row 1 — Card details row (three columns) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-[#280F0B] mb-2 block">Card number</label>
            <div className="relative">
              <input 
                name="cardNumber" 
                placeholder="1234 5678 1234 5678" 
                className={getInputClass('cardNumber')} 
                onChange={handleChange} 
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11 5.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-1z"/><path d="M2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H2zm13 2v5H1V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1zm-1 9H2a1 1 0 0 1-1-1v-1h14v1a1 1 0 0 1-1 1z"/></svg>
              </div>
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold tracking-widest text-[#280F0B] mb-2 block">Expiration date</label>
            <input 
              name="expiry" 
              placeholder="MM / YY" 
              className={getInputClass('expiry')} 
              onChange={handleChange} 
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold tracking-widest text-[#280F0B] mb-2 block">Security code</label>
            <div className="relative">
              <input 
                name="cvc" 
                placeholder="CVC" 
                className={getInputClass('cvc')} 
                onChange={handleChange} 
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 text-[10px] font-bold">123</div>
            </div>
          </div>
        </div>

        {/* Row 2 — Country selector */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-bold tracking-widest text-[#280F0B]">Country</label>
          <div className="relative">
            <select 
              name="country" 
              className={getSelectClass('country')} 
              onChange={handleChange} 
              value={formData.country}
              style={{ backgroundImage: arrowIcon }}
            >
              <option value="Australia">Australia</option>
            </select>
          </div>
        </div>

        {/* Informational Text */}
        <p className="text-[11px] text-[#280F0B80] leading-relaxed italic">
          By providing your card information, you allow Raw Earth Crystals to charge your card for future payments in accordance with their terms.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-[#280F0B1A]">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-[#7F3E2F] text-[#FCF3E5] px-12 py-5 font-bold tracking-[1.12px] hover:brightness-110 transition-all uppercase text-sm disabled:opacity-50"
          >
            {isSubmitting ? 'SAVING...' : 'ADD CARD'}
          </button>
          <button 
            type="button" 
            onClick={onCancel} 
            className="text-[#280F0B] px-12 py-5 font-bold tracking-[1.12px] uppercase text-sm hover:underline"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCard;