'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Header from '@/components/Header';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/app/context/CartContext';
import CartDrawer from '@/components/CartDrawer';

type Product = {
  id: string; title: string; handle: string; price: number;
  category: string; gender: string; material: string | string[]; image: string;
};

function SearchContent({ setIsCartOpen }: { setIsCartOpen: (open: boolean) => void }) {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const { addToCart } = useCart();
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Trigger fetch whenever query changes
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        // Pass the query param to the API
        const url = query 
          ? `/api/shopify/products?q=${encodeURIComponent(query)}` 
          : '/api/shopify/products';
          
        const res = await fetch(url);
        const data = await res.json();
        
        if (data && Array.isArray(data)) {
          setSearchResults(data);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Search fetch failed", error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }
    
    if (query) {
      loadProducts();
    } else {
      setLoading(false);
    }
  }, [query]);

  if (loading) return <div className="py-20 text-center font-lora text-[#280F0B]">Searching for &quot;{query}&quot;...</div>;

  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="mb-10 text-left">
        <h1 className="font-lora text-3xl sm:text-4xl md:text-5xl text-[#280F0B] font-medium mb-4">Search Results</h1>
        <p className="font-manrope text-[#280F0B]/60 text-sm sm:text-base font-medium">
          {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} for &quot;{query}&quot;
        </p>
      </div>

      {searchResults.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl opacity-50 font-manrope">No products found matching your search.</p>
          <Link href="/product-analogue" className="underline font-bold mt-4 inline-block text-[#280F0B]">Browse all products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {searchResults.map((p) => (
            <div key={p.id} className="group cursor-pointer">
              <Link href={`/product/${p.handle}`}>
                <div className="aspect-square relative bg-[#F2EFEA] mb-4 overflow-hidden">
                  <Image 
                    src={p.image || '/assets/images/necklace-img.png'} 
                    alt={p.title} 
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                </div>
              </Link>
              
              <Link href={`/product/${p.handle}`}>
                <h4 className="text-[#280F0B] text-[14px] font-semibold mb-1 truncate font-manrope">{p.title}</h4>
              </Link>

              <div className="relative h-8 overflow-hidden group/btn flex items-center justify-between">
                <p className="text-[#280F0B] text-[13px] opacity-70 font-medium transition-all duration-300 transform translate-y-0 lg:group-hover:translate-y-[-100%] lg:group-hover:opacity-0 flex items-center h-full font-manrope">
                  ${p.price.toFixed(2)} AUD
                </p>

                <button 
                  onClick={() => {
                    addToCart({ 
                      id: p.id, title: p.title, variant: "Default", 
                      price: p.price, image: p.image 
                    }, 1);
                    setIsCartOpen(true);
                  }}
                  className="lg:hidden text-[14px] opacity-70 font-medium text-[#7F3E2F] active:opacity-100 transition-opacity font-manrope"
                >
                  + Add to Cart
                </button>

                <button 
                  onClick={() => {
                    addToCart({ 
                      id: p.id, title: p.title, variant: "Default", 
                      price: p.price, image: p.image 
                    }, 1);
                    setIsCartOpen(true);
                  }}
                  className="hidden lg:flex absolute top-0 left-0 w-full h-full text-[#280F0B] text-[14px] opacity-70 font-medium text-left transition-all duration-300 transform translate-y-[100%] group-hover:translate-y-0 items-center hover:text-black font-manrope"
                >
                  + Add to Cart 
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchResultsPage() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <Header />
      <main className="bg-[#F6D8AB] text-[#280F0B] font-manrope min-h-screen pt-20 lg:pt-24 pb-20 overflow-x-hidden">
        <div className="max-w-[85vw] mx-auto px-[20px]">
          <Suspense fallback={<div className="text-center py-20 font-lora">Loading search parameters...</div>}>
            <SearchContent setIsCartOpen={setIsCartOpen} />
          </Suspense>
        </div>
      </main>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}