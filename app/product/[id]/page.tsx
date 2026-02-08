'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Desktop_pro from './desktop_pro';
import Header from '@/components/Header';
import { motion } from 'framer-motion';
export const runtime = 'edge';
export default function ProductPage() {
  const params = useParams();
  const handle = params.id as string; // The URL contains the shopify handle
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchProductDetails() {
      try {
        setLoading(true);
        // We call our internal API with the handle from the URL
        const res = await fetch(`/api/shopify/products?handle=${handle}`);
        
        if (!res.ok) throw new Error('Product not found');
        
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error("Error loading product:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    if (handle) {
      fetchProductDetails();
    }
  }, [handle]);

  if (loading) {
    return (
      <div className="bg-[#F6D8AB] min-h-screen">
        <Header />
        <div className="bg-[#F6D8AB] min-h-screen flex items-center justify-center">
          <div className="relative flex items-center justify-center w-48 h-48">
            <motion.div animate={{ scale: [0.8, 1.2, 0.8], opacity: [1, 0, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="absolute w-32 h-32">
              <img src="/assets/images/Logo.svg" alt="Loading" className="w-full h-full object-contain" />
            </motion.div>
            <motion.div animate={{ scale: [1.2, 0.8, 1.2], opacity: [0, 1, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="absolute w-24 h-24">
              <img src="/assets/images/Logo.svg" alt="Loading" className="w-full h-full object-contain opacity-50" />
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-[#F6D8AB] min-h-screen">
        <Header />
        <div className="flex flex-col items-center justify-center h-[60vh] text-[#280F0B]">
          <h2 className="font-lora text-3xl mb-4">Product Not Found</h2>
          <p className="opacity-70">We couldn't find the crystal you're looking for.</p>
        </div>
      </div>
    );
  }

  // Pass the real Shopify data into your existing UI component
  return <Desktop_pro product={product} />;
}