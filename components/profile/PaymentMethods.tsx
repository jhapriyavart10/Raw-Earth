'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import AddCard from './AddCard';

const PaymentMethods = () => {
  const [showForm, setShowForm] = useState(false);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch cards from Backend (Shopify) instead of localStorage
  const fetchCards = async () => {
    try {
      const res = await fetch('/api/auth/customer');
      if (res.ok) {
        const data = await res.json();
        if (data.cards?.value) {
          setCards(JSON.parse(data.cards.value));
        }
      }
    } catch (error) {
      console.error('Failed to load cards', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const deleteCard = async (id: number) => {
    const previousCards = [...cards];
    setCards(cards.filter(card => card.id !== id));

    try {
      // 2. Call the API
      const response = await fetch('/api/shopify/delete-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: id }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      // 3. Revert changes if API fails
      setCards(previousCards);
      alert("Failed to remove card. Please try again.");
    }
  };

  if (showForm) {
    return (
      <AddCard 
        onCancel={() => setShowForm(false)} 
        onSave={() => {
          // Refresh list from server after saving
          fetchCards();
          setShowForm(false);
        }} 
      />
    );
  }

  // Loading state prevents "No cards found" flash
  if (loading) {
    return <div className="w-full py-8 text-[#280F0B] opacity-50">Loading saved cards...</div>;
  }

  return (
    <div className="w-full py-8 animate-in fade-in duration-500">
      {cards.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center text-center py-12">
          <h2 className="text-3xl font-bold font-manrope text-[#280F0B] mb-2">No saved cards found.</h2>
          <p className="text-[#280F0B] mb-8 opacity-70">You don't have a credit card setup yet.</p>
          <button 
            onClick={() => setShowForm(true)}
            className="group relative flex items-center justify-center gap-3 border border-[#4A2419] bg-transparent text-[#4A2419] px-10 py-4 rounded-sm font-medium tracking-widest uppercase text-sm w-full md:w-[349px] overflow-hidden transition-colors duration-300 hover:text-[#F6D8AB] hover:border-[#592B1E] z-10 before:absolute before:inset-0 before:bg-[#592B1E] before:translate-y-full hover:before:translate-y-0 before:transition-transform before:duration-300 before:-z-10"
          >
            <Image 
                src="/assets/images/card.svg" 
                alt="Card Icon"
                width={24} 
                height={24}
                className="w-5 h-5 transition-all duration-300 brightness-0 group-hover:invert" 
            />
            Add a Card
          </button>
        </div>
      ) : (
        /* Card List View */
        <>
          <div className="flex justify-between items-center mb-8 border-b border-[#280F0B1A] pb-4">
            <h2 className="text-3xl font-bold font-manrope text-[#280F0B]">Payment Methods</h2>
            <button 
              onClick={() => setShowForm(true)}
              className="text-sm font-bold text-[#7F3E2F] uppercase tracking-widest hover:underline"
            >
              + Add New Card
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cards.map((card) => (
              <div key={card.id} className="border border-[#280F0B1A] p-6 rounded-sm bg-white/50 relative group flex flex-col justify-between min-h-[160px]">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                     <div className="bg-[#280F0B] p-2 rounded-sm">
                        <Image src="/assets/images/card.svg" alt="Card" width={20} height={20} className="brightness-0 invert" />
                     </div>
                     <span className="text-xs font-bold uppercase tracking-widest text-[#280F0B]">
                       {/* Handle optional chaining in case format varies */}
                       •••• {card.cardNumber ? card.cardNumber.slice(-4) : card.last4 || '0000'}
                     </span>
                  </div>
                  <button 
                    onClick={() => deleteCard(card.id)}
                    className="text-[10px] text-red-600 font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Remove
                  </button>
                </div>
                
                <div className="mt-4">
                  <p className="text-[10px] uppercase font-bold text-[#280F0B80] tracking-tighter">Expires</p>
                  <p className="text-sm font-bold text-[#280F0B]">{card.expiry}</p>
                </div>

                <div className="absolute bottom-6 right-6 opacity-10">
                   <Image src="/assets/images/Logo(REC).svg" alt="Logo" width={60} height={20} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentMethods;