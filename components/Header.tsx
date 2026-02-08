'use client';

import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/app/context/CartContext' // Ensure this imports correctly
import CartDrawer from '@/components/CartDrawer'
import { Menu, X } from 'lucide-react' 

const BANNER_MESSAGES = [
  "Free Standard Domestic Shipping above $135",
  "New Collection: Rose Quartz Bracelets Now Available",
  "Join our community for 10% off your first order"
];

export default function Header() {
  const router = useRouter();
  // Destructure the new context values here:
  const { getTotalItems, isBannerVisible, hideBanner } = useCart();
  const totalItems = getTotalItems();

  // REMOVED: const [showBanner, setShowBanner] = useState(true);
  // Replaced local showBanner with isBannerVisible from Context

  const [messageIndex, setMessageIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const [isScrolled, setIsScrolled] = useState(false);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };
  
  useEffect(() => {
    async function checkUser() {
      try {
        const res = await fetch('/api/auth/customer');
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      }
    }
    checkUser();
  }, []);

  useEffect(() => {
    // Update dependency to use isBannerVisible
    if (paused || !isBannerVisible) return;
    const timer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % BANNER_MESSAGES.length);
    }, 5000); 
    return () => clearInterval(timer);
  }, [paused, isBannerVisible]);

  return (
    <>
      {/* 1. Dynamic Spacer - uses isBannerVisible */}
      <div 
        className="w-full transition-all duration-300 ease-in-out"
        style={{ 
           height: isBannerVisible ? '125px' : '80px', 
        }}
      >
        <style jsx>{`
          @media (min-width: 1024px) {
            div[style*="height"] {
              height: ${isBannerVisible ? '165px' : '120px'} !important; 
            }
          }
        `}</style>
      </div>

      {/* 2. Fixed Wrapper - uses isBannerVisible */}
      <div className={`fixed top-0 left-0 w-full z-[300] transition-transform duration-500 ease-in-out ${isScrolled && isBannerVisible ? '-translate-y-[45px]' : 'translate-y-0'}`}>
        
        {/* Banner */}
        <div 
          className={`bg-[#7F3E2F] text-white text-center w-full flex items-center justify-center relative overflow-hidden transition-all duration-300 ease-in-out ${isBannerVisible ? 'h-[45px]' : 'h-0'}`}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {isBannerVisible && (
            <>
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={messageIndex}
                  initial={{ y: 45, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -45, opacity: 0 }}
                  transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute text-[13px] font-manrope font-medium whitespace-nowrap px-10"
                >
                  {BANNER_MESSAGES[messageIndex]}
                </motion.span>
              </AnimatePresence>
              {/* Uses hideBanner from context */}
              <button onClick={hideBanner} className="absolute right-4 top-1/2 -translate-y-1/2">✕</button>
            </>
          )}
        </div>

        {/* Header - Height logic remains the same relative to scroll, but note top wrapper handles the banner shift */}
        <header 
          className={`bg-[#280F0B] text-white w-full shadow-md relative transition-all duration-500 ease-in-out
            ${isScrolled ? 'h-[60px] lg:h-[80px]' : 'h-[80px] lg:h-[120px]'}
          `}
        >
          <div className="w-full lg:max-w-[85vw] mx-auto h-full px-4 lg:px-5 flex items-center justify-between relative">
            
            {/* Mobile Hamburger */}
            <button 
              className="lg:hidden p-2" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-[40px]">
              <Link href="/product-analogue" className="hover:text-gray-300 transition-colors text-base font-manrope">Shop</Link>
              <Link href="/" className="hover:text-gray-300 transition-colors text-base font-manrope">Plans</Link>
              <Link href="https://azure-takeaways-956863.framer.app/blogs" className="text-base transition-colors hover:text-gray-300 font-manrope">
                Raw Earth Dojo
              </Link>
              <Link href="/about" className="hover:text-gray-300 transition-colors text-base font-manrope">About</Link>
            </nav>

            {/* Logo */}
            <div className="lg:absolute lg:left-1/2 lg:-translate-x-1/2">
              <Link href="/">
                <Image 
                  src="/assets/images/Logo(REC).svg" 
                  alt="Raw Earth Crystals" 
                  width={186} 
                  height={72} 
                  className={`object-contain transition-all duration-500 ease-in-out ${isScrolled ? 'w-[100px] lg:w-[130px]' : 'w-[120px] lg:w-[186px]'}`} 
                  priority 
                />
              </Link>
            </div>

            {/* Icons */}
            <div className="flex items-center gap-2 lg:gap-6">
              <button onClick={() => setIsSearchOpen(true)} className="p-2 hover:text-gray-300 transition-colors">
                <img src="/assets/images/search.svg" alt="Search" className="w-6 h-6" />
              </button>

              <Link href={user ? '/profile' : '/signup'} className="hidden lg:flex">
                <div className="flex flex-col items-center cursor-pointer group">
                  <Image src="/assets/images/profile.svg" alt="Profile" width={24} height={24} className="group-hover:opacity-70 transition-opacity" />
                </div>
              </Link>

              <button onClick={() => setIsCartOpen(true)} className="p-2 hover:opacity-70 transition-opacity relative flex items-center justify-center">
                <img src="/assets/images/cart.svg" alt="Cart" className="w-6 h-6" />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 bg-[#7F3E2F] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>

            {/* Search Overlay */}
            {isSearchOpen && (
              <div className="absolute inset-0 bg-[#280F0B] z-[70] flex items-center px-4 lg:px-[72px]">
                <form onSubmit={handleSearchSubmit} className="flex-1 relative flex items-center gap-4">
                  <div className="flex-1 relative">
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="Search products..."
                      className="bg-transparent w-full py-2 outline-none text-lg lg:text-xl font-manrope placeholder:text-white/40 text-white"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/10" />
                  </div>
                  <button type="submit" className="p-2 hover:scale-110 transition-transform">
                     <img src="/assets/images/search.svg" alt="Search" className="w-5 h-5 brightness-0 invert" />
                  </button>
                  <button type="button" onClick={() => setIsSearchOpen(false)} className="text-white/60 hover:text-white">
                    <X size={24} strokeWidth={1.5} />
                  </button>
                </form>
              </div>
            )}
          </div>
        </header>
        
      </div>

      {/* 3. Mobile Sidebar (Correctly positioned outside header) */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[400] transition-opacity duration-300 lg:hidden ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setIsMenuOpen(false)}
      >
        <div 
          className={`absolute top-0 left-0 w-[80%] h-full bg-[#280F0B] p-6 transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
          onClick={(e) => e.stopPropagation()} 
        >
          <div className="flex justify-between items-center mb-8 text-white">
            <span className="text-xl font-lora font-bold">Menu</span>
            <button onClick={() => setIsMenuOpen(false)}><X size={24} /></button>
          </div>
          
          <nav className="flex flex-col gap-6 text-lg font-manrope text-white">
            <Link href="/product-analogue" onClick={() => setIsMenuOpen(false)} className="border-b border-white/10 pb-2">Go to Shop</Link>
            <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="border-b border-white/10 pb-2">My Profile</Link>
            <Link href="/plans" onClick={() => setIsMenuOpen(false)} className="border-b border-white/10 pb-2">Plans</Link>
            <Link href="/about" onClick={() => setIsMenuOpen(false)} className="border-b border-white/10 pb-2">About Us</Link>
            <Link href="https://azure-takeaways-956863.framer.app/blogs" onClick={() => setIsMenuOpen(false)} className="border-b border-white/10 pb-2">Raw Earth Dojo</Link>
          </nav>
        </div>
      </div>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}