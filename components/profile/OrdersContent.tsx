// components/OrdersContent.tsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
const OrdersContent = () => {
  return (
    <div className="flex flex-col items-center text-center">
      {/* Box Icon Placeholder - You can replace with an actual SVG/Image */}
      <div className="relative w-48 h-48 mb-4">
        <Image 
            src="/assets/images/no_order.svg" 
            alt="No orders found"
            width={192} 
            height={192}
            className="object-contain"
            priority
        />
      </div>

      <h2 className="font-manrope font-bold text-[20px] md:text-[24px] leading-[100%] tracking-[-0.5px] text-[#280F0B] mb-6">
        You don't have any orders yet.
      </h2>
      <Link href="/product-analogue" className="w-full md:w-auto">
        <button className="flex items-center justify-center gap-3 bg-[#7F3E2F] text-[#FCF3E5] px-10 py-4 rounded-sm font-medium tracking-widest hover:bg-[#6D3A2D] transition-colors uppercase text-sm w-full md:w-[349px] group">
          Start Shopping
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </Link>
    </div>
  );
};

export default OrdersContent;