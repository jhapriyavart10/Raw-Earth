import React from 'react';

const Subscriptions = () => {
  return (
    <div className="flex flex-col items-center text-center py-12 animate-in fade-in duration-500">
      <h2 className="text-3xl font-serif text-[#3D1F16] mb-2">Subscriptions</h2>
      <p className="text-[#3D1F16]/70 mb-8">You don't have any active subscriptions.</p>
      <button className="relative border border-[#4A2419] bg-transparent text-[#4A2419] px-10 py-4 rounded-sm font-medium tracking-widest uppercase text-sm w-full md:w-[349px] overflow-hidden transition-colors duration-300 hover:text-[#F6D8AB] hover:border-[#592B1E] z-10 before:absolute before:inset-0 before:bg-[#592B1E] before:translate-y-full hover:before:translate-y-0 before:transition-transform before:duration-300 before:-z-10">
        Browse Plans
      </button>
    </div>
  );
};

export default Subscriptions;