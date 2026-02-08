'use client';
import Header from '@/components/Header';
import Image from 'next/image';
import { useState, useEffect, useMemo, Suspense } from 'react';
import { useCart } from '@/app/context/CartContext';
import Link from 'next/link';
import CartDrawer from '@/components/CartDrawer';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';

/* ---------------- TYPES ---------------- */
type Variant = {
  id: string;
  title: string;
  image: string;
  price: number;
  selectedOptions: {
    name: string;
    value: string;
  }[];
};

type Product = {
  id: string; 
  title: string;
  handle: string; 
  price: number;
  category: string;
  gender: string;
  material: string | string[];
  image: string;
  variants?: Variant[];
};

type Filters = {
  price: { min: number; max: number };
  category: string[];
  gender: string[];
  material: string[];
};

const QUICK_LINKS = [
  { title: 'For Her', image: '/assets/images/For Her.png', filterType: 'gender', filterValue: 'For Her' },
  { title: 'For Him', image: '/assets/images/For Him.png', filterType: 'gender', filterValue: 'For Him' },
  { title: 'Charms & Pendants', image: '/assets/images/Charms.png', filterType: 'category', filterValue: 'Charms & Pendants' },
  { title: 'Crystal Bracelets', image: '/assets/images/Bracelets.png', filterType: 'category', filterValue: 'Bracelets' }
];

function ShopContent() {
  const { addToCart } = useCart();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q');

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [sortBy, setBy] = useState<string>('Default Sorting');
  const [pageTitle, setPageTitle] = useState('All Products');

  const [filters, setFilters] = useState<Filters>({
    price: { min: 0, max: 150 },
    category: [],
    gender: [],
    material: [],
  });

  const [openSections, setOpenSections] = useState({ category: true, gender: true, material: true });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // --- QUICK SHOP STATE ---
  const [quickShopProduct, setQuickShopProduct] = useState<Product | null>(null);
  const [quickShopVariant, setQuickShopVariant] = useState<Variant | null>(null);
  const [selectedChain, setSelectedChain] = useState<string>("");

  // FETCH PRODUCTS (With optional Search)
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const endpoint = urlQuery 
          ? `/api/shopify/products?q=${encodeURIComponent(urlQuery)}`
          : `/api/shopify/products`;

        const res = await fetch(endpoint);
        const data = await res.json();

        if (data && Array.isArray(data)) {
          setAllProducts(data);
          if (urlQuery){
            setPageTitle(`Results for "${urlQuery}"`);
          } else {
            setPageTitle('All Products');
          }
        } else {
          setApiError("Failed to load products.");
          setAllProducts([]); 
        }
      } catch (error) {
        setApiError("Network error.");
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [urlQuery]);

  const safeProducts = Array.isArray(allProducts) ? allProducts : [];

  // --- HELPER FUNCTIONS ---
  const getCount = (key: keyof Product, value: string) => {
    return safeProducts.filter(p => {
      const val = p[key];
      if (Array.isArray(val)) return (val as string[]).includes(value);
      return val === value;
    }).length;
  };

  const toggleSection = (key: keyof typeof openSections) => setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleFilter = (key: keyof Filters, value: string) => {
    setFilters((prev) => {
      const list = prev[key] as string[];
      return { ...prev, [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] };
    });
  };

  const handleQuickLink = (item: typeof QUICK_LINKS[0]) => {
    setPageTitle(item.title); 
    setFilters({
      price: { min: 0, max: 150 },
      category: [],
      gender: [],
      material: [],
      [item.filterType]: [item.filterValue]
    });
  };

  const dynamicMaterials = useMemo(() => {
    const counts: Record<string, number> = {};
    safeProducts.forEach(p => {
      const materials = Array.isArray(p.material) ? p.material : [p.material];
      materials.forEach(m => { if (m) counts[m] = (counts[m] || 0) + 1; });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);
  }, [safeProducts]);

  // --- FILTERING LOGIC ---
  const filteredProducts = safeProducts.filter((p) => {
    if (p.price < filters.price.min || p.price > filters.price.max) return false;
    
    if (filters.category.length > 0) {
      const title = p.title.toLowerCase();
      const isBraceletItem = title.includes('bracelets') || title.includes('bracelet');
      const isPendantItem = title.includes('pendants') || (!isBraceletItem && !title.includes('bracelet'));
      const matchesSelectedBracelets = filters.category.includes('Bracelets') && isBraceletItem;
      const matchesSelectedPendants = filters.category.includes('Charms & Pendants') && isPendantItem;
      if (!matchesSelectedBracelets && !matchesSelectedPendants) return false;
    }

    if (filters.gender.length) {
      const productGenders = Array.isArray(p.gender) ? p.gender : [p.gender];
      if (!productGenders.some(g => filters.gender.includes(g))) return false;
    }

    if (filters.material.length) {
      const productMaterials = Array.isArray(p.material) ? p.material : [p.material];
      if (!productMaterials.some(m => filters.material.includes(m))) return false;
    }

    return true;
  });

  const sortedProducts = useMemo(() => {
    const items = [...filteredProducts];
    switch (sortBy) {
      case 'Price: Low to High': return items.sort((a, b) => a.price - b.price);
      case 'Price: High to Low': return items.sort((a, b) => b.price - a.price);
      case 'Name: A to Z': return items.sort((a, b) => a.title.localeCompare(b.title));
      case 'Name: Z to A': return items.sort((a, b) => b.title.localeCompare(a.title));
      default: return items;
    }
  }, [filteredProducts, sortBy]);

  // Determine if a specific material is "active" via filter or search
  const activeMaterialContext = useMemo(() => {
     if (filters.material.length === 1) return filters.material[0];
     if (urlQuery) {
        const match = dynamicMaterials.find(m => urlQuery.toLowerCase().includes(m.toLowerCase()));
        if (match) return match;
     }
     return null;
  }, [filters.material, urlQuery, dynamicMaterials]);

  // --- QUICK SHOP LOGIC ---
  const openQuickShop = (p: Product, preSelectedVariant?: Variant) => {
    if (!p.variants || p.variants.length <= 1) {
       addToCart({ id: p.id, title: p.title, variant: "Default", price: p.price, image: p.image }, 1);
       setIsCartOpen(true);
       return;
    }

    // 2. Check if product has "Chain Type" options
    const hasChain = p.variants.some((v: any) => v.selectedOptions?.some((o: any) => o.name === "Chain Type"));
  
    if (!hasChain) {
        const target = preSelectedVariant || p.variants[0];
        addToCart({ 
            id: target.id, 
            title: p.title, 
            variant: target.title, 
            price: target.price, 
            image: target.image || p.image 
        }, 1);
        setIsCartOpen(true);
        return;
    }

    setQuickShopProduct(p);
    setQuickShopVariant(preSelectedVariant || p.variants[0]);
    const defaultChain = (preSelectedVariant || p.variants[0]).selectedOptions?.find((o: any) => o.name === "Chain Type")?.value || "";
    setSelectedChain(defaultChain);
  };

  const handleQuickShopAdd = () => {
    if (!quickShopProduct || !quickShopVariant) return;
    const materialOption = quickShopVariant.selectedOptions?.find((o: any) => o.name === "Jewelry Material")?.value;
    
    const finalVariant = quickShopProduct.variants?.find((v: any) => {
        const vMaterial = v.selectedOptions?.find((o: any) => o.name === "Jewelry Material")?.value;
        const vChain = v.selectedOptions?.find((o: any) => o.name === "Chain Type")?.value;
        
        // Match material AND chain
        // If material matches, proceed. Note: Some products might not have 'Jewelry Material' option if they are simple, but logic holds.
        return (vMaterial === materialOption) && (vChain === selectedChain);
    }) || quickShopVariant; // Fallback

    addToCart({ 
        id: finalVariant.id, 
        title: quickShopProduct.title, 
        variant: finalVariant.title, 
        price: finalVariant.price, 
        image: finalVariant.image || quickShopProduct.image 
    }, 1);
    
    setQuickShopProduct(null);
    setIsCartOpen(true);
  };

  if (loading) return (
    <div className="bg-[#F6D8AB] min-h-screen flex items-center justify-center">
      <div className="relative flex items-center justify-center w-48 h-48">
        <motion.div animate={{ scale: [0.8, 1.2, 0.8], opacity: [1, 0, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="absolute w-32 h-32">
          <img src="/assets/images/Logo.svg" alt="Loading" className="w-full h-full object-contain" />
        </motion.div>
      </div>
    </div>
  );

  return (
    <>
      <div className="px-5 md:px-12 xl:px-24 2xl:px-32 pb-5">
        
        {/* Quick Links */}
        {!urlQuery && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-16 w-full">
            {QUICK_LINKS.map((link) => (
              <motion.div
                key={link.title}
                onClick={() => handleQuickLink(link)}
                className="relative cursor-pointer group"
                whileTap={{ scale: 0.95 }}
              >
                {/* REMOVED BORDER, SLOWED HOVER */}
                <div className="aspect-[17/15] relative overflow-hidden shadow-sm bg-[#280F0B]">
                    <Image 
                      src={link.image} 
                      alt={link.title}
                      fill
                      className="object-fill transition-all duration-700 ease-in-out opacity-80 group-hover:scale-105 group-hover:opacity-100"
                    />
                    <div className="absolute bottom-5 left-5 z-10 pointer-events-none">
                      <span className="text-white font-manrope font-bold text-[24px] leading-none tracking-[-0.5px]">
                        {link.title === 'Charms' ? 'Charms & Pendants' : link.title}
                      </span>
                    </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Header & Sort */}
        <div className="hidden lg:grid grid-cols-[260px_1fr] gap-8 mb-1">
          <div />
          <h1 className="font-lora text-[40px] leading-tight">{pageTitle}</h1>
        </div>
      
        <div className="hidden lg:grid grid-cols-[260px_1fr] gap-8 mb-6">
          <h2 className="text-xl font-bold border-b border-[#280F0B33] pb-1 flex items-end tracking-[0px]">Filters</h2>
          <div className="flex justify-between items-end border-b border-[#280F0B33] pb-1">
            <p className="text-sm opacity-70 leading-none">{filteredProducts.length} Products</p>
            <select value={sortBy} onChange={(e) => setBy(e.target.value)} className="bg-transparent border-none font-semibold cursor-pointer outline-none text-sm">
              <option>Default Sorting</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Name: A to Z</option>
              <option>Name: Z to A</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* Sidebar */}
          <aside className="w-full lg:w-[260px]">
            <div className="lg:hidden flex flex-col mb-6">
              <h1 className="font-lora text-[40px] leading-tight mb-1">{pageTitle}</h1>
              <p className="text-xs opacity-70">Showing {filteredProducts.length} products</p>
            </div>

            <div className="flex justify-between items-center lg:hidden border-b border-[#280F0B33] pb-2 mb-4">
              <button onClick={() => setShowMobileFilters(true)} className="flex items-center gap-2 text-[#280F0B] font-semibold">
                <Image src="/assets/images/filter.svg" alt="" width={14} height={14} />
                <span>Filters</span>
              </button>
              <select value={sortBy} onChange={(e) => setBy(e.target.value)} className="bg-transparent border-none font-semibold outline-none text-xs">
                <option>Default Sorting</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>

            <AnimatePresence>
              {(showMobileFilters) && (
                <div className="fixed inset-0 z-[100] lg:hidden">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowMobileFilters(false)}
                    className="absolute inset-0 bg-black/40"
                  />
                  <motion.div 
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed top-0 left-0 h-full w-[85%] max-w-[320px] bg-[#F6D8AB] p-6 shadow-xl overflow-y-auto"
                  >
                    <div className="flex justify-between items-center mb-8">
                      <span className="font-lora text-2xl">Filters</span>
                      <button onClick={() => setShowMobileFilters(false)} className="text-3xl font-light">×</button>
                    </div>
                    <FilterContent filters={filters} setFilters={setFilters} openSections={openSections} toggleSection={toggleSection} dynamicMaterials={dynamicMaterials} toggleFilter={toggleFilter} safeProducts={safeProducts} getCount={getCount} />
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            <div className="hidden lg:block">
              <FilterContent filters={filters} setFilters={setFilters} openSections={openSections} toggleSection={toggleSection} dynamicMaterials={dynamicMaterials} toggleFilter={toggleFilter} safeProducts={safeProducts} getCount={getCount} />
            </div>
          </aside>

          {/* Product Grid */}
          <section className="flex-1 w-full">
            {sortedProducts.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 opacity-60">
                 <p className="text-xl font-lora">No products found.</p>
                 <button onClick={() => window.location.href = '/product-analogue'} className="mt-4 underline">Clear Search</button>
               </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
                {sortedProducts.map((p, index) => {
                  
                  // SMART TILE LOGIC:
                  // Check if we should display a specific variant based on filters/search
                  let displayVariant = null;
                  if (activeMaterialContext && p.variants) {
                     displayVariant = p.variants.find((v: any) => v.title.toLowerCase().includes(activeMaterialContext.toLowerCase()));
                  }
                  
                  // Fallback to main image
                  const displayImage = displayVariant?.image || p.image || '/assets/images/necklace-img.png';
                  const displayPrice = displayVariant?.price || p.price;

                  return (
                    <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="group cursor-pointer">
                      <Link href={`/product/${p.handle}`}>
                        <div className="aspect-[306/316] relative bg-[#F2EFEA] mb-4 overflow-hidden rounded-sm">
                          <Image src={displayImage} alt={p.title} fill className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105" />
                        </div>
                      </Link>
                      <h4 className="text-[14px] font-semibold mb-1 truncate">{p.title}</h4>
                      <div className="relative h-8 flex items-center justify-between overflow-hidden">
                        <p className="text-[13px] opacity-70 transition-all duration-300 transform lg:group-hover:translate-y-[-100%] lg:group-hover:opacity-0">${displayPrice.toFixed(2)} AUD</p>
                        
                        {/* Mobile Add */}
                        <button onClick={() => openQuickShop(p, displayVariant || undefined)} className="lg:hidden text-[14px] opacity-70 font-medium text-[#7A3E2E]">+ Add to Cart</button>
                        
                        {/* Desktop Add - QUICK SHOP TRIGGER */}
                        <button onClick={() => openQuickShop(p, displayVariant || undefined)} className="hidden lg:flex absolute top-0 left-0 w-full h-full text-[14px] opacity-70 transform translate-y-[100%] group-hover:translate-y-0 items-center hover:text-black transition-all duration-300">
                          + Add to Cart
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* QUICK SHOP MODAL */}
      <AnimatePresence>
        {quickShopProduct && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
              onClick={() => setQuickShopProduct(null)} 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              className="bg-[#F6D8AB] p-8 rounded-lg w-full max-w-sm relative z-10 shadow-2xl border border-[#280F0B]"
            >
               <button onClick={() => setQuickShopProduct(null)} className="absolute top-4 right-4 text-2xl leading-none hover:opacity-50">&times;</button>
               
               <h3 className="font-lora text-2xl font-bold mb-1">{quickShopProduct.title}</h3>
               {quickShopVariant && <p className="text-sm opacity-70 mb-6 font-bold uppercase tracking-wider">{quickShopVariant.title}</p>}
               
               <div className="mb-8">
                 <label className="text-xs font-bold uppercase tracking-widest block mb-3 opacity-80">Chain Type</label>
                 <div className="flex gap-2 flex-wrap">
                   {/* Extract unique chain types from product variants */}
                   {Array.from(new Set(quickShopProduct.variants?.map((v:any) => v.selectedOptions?.find((o:any) => o.name === "Chain Type")?.value).filter(Boolean)))
                     .map((chain: any) => (
                      <button 
                        key={chain}
                        onClick={() => setSelectedChain(chain)}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wide rounded-full border border-[#280F0B] transition-all ${selectedChain === chain ? 'bg-[#280F0B] text-[#F6D8AB]' : 'hover:bg-[#280F0B]/10'}`}
                      >
                        {chain}
                      </button>
                   ))}
                 </div>
               </div>

               <button 
                onClick={handleQuickShopAdd} 
                className="w-full bg-[#7F3E2E] text-white py-4 font-bold uppercase tracking-[1.5px] text-sm hover:brightness-110 transition-all"
               >
                 Add to Cart - ${(quickShopVariant?.price || quickShopProduct.price).toFixed(2)}
               </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

export default function ShopPage() {
  return (
    <>
      <Header />
      <div className="h-[40px] md:h-[40px] w-full bg-[#F6D8AB]" />
      <main className="bg-[#F6D8AB] text-[#280F0B] font-manrope min-h-screen">
        <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
          <ShopContent />
        </Suspense>
      </main>
      <style jsx global>{`
          .custom-slider::-webkit-slider-thumb { appearance: none; pointer-events: auto; height: 24px; width: 24px; border-radius: 50%; background: #280F0B; border: 2px solid #F6D8AB; box-shadow: 0 0 0 2px #280F0B; cursor: pointer; position: relative; z-index: 10; }
          .custom-slider::-moz-range-thumb { appearance: none; pointer-events: auto; height: 20px; width: 20px; border-radius: 50%; background: #280F0B; border: 2px solid #F6D8AB; box-shadow: 0 0 0 2px #280F0B; cursor: pointer; }
      `}</style>
    </>
  );
}

function FilterContent({ filters, setFilters, openSections, toggleSection, dynamicMaterials, toggleFilter, safeProducts, getCount }: any) {
  return (
    <>
      <div className="mt-2 mb-6 w-full">
        <p className="text-[12px] font-bold uppercase mb-3 tracking-wider">Price</p>
        <div className="flex gap-3 mb-5 items-center">
          <div className="relative w-1/2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm opacity-60">$</span>
            <input type="number" className="w-full bg-transparent border border-[#280F0B] pl-6 pr-2 py-1.5 text-sm outline-none" value={filters.price.min} onChange={(e) => setFilters((p: any) => ({...p, price: {...p.price, min: Number(e.target.value)}}))} />
          </div>
          <span className="opacity-50">—</span>
          <div className="relative w-1/2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm opacity-60">$</span>
            <input type="number" className="w-full bg-transparent border border-[#280F0B] pl-6 pr-2 py-1.5 text-sm outline-none" value={filters.price.max} onChange={(e) => setFilters((p: any) => ({...p, price: {...p.price, max: Number(e.target.value)}}))} />
          </div>
        </div>
        <div className="relative h-6 w-full flex items-center px-1">
          <div className="absolute h-1.5 bg-[#280F0B33] w-full rounded-full overflow-hidden">
            <div className="absolute h-full bg-[#725C4B]" style={{ left: `${(filters.price.min / 150) * 100}%`, right: `${100 - (filters.price.max / 150) * 100}%` }} />
          </div>
          <input type="range" min="0" max="150" value={filters.price.min} onChange={(e) => setFilters((p: any) => ({...p, price: {...p.price, min: Math.min(Number(e.target.value), filters.price.max)}}))} className="custom-slider absolute w-full pointer-events-none appearance-none bg-transparent" />
          <input type="range" min="0" max="150" value={filters.price.max} onChange={(e) => setFilters((p: any) => ({...p, price: {...p.price, max: Math.max(Number(e.target.value), filters.price.min)}}))} className="custom-slider absolute w-full pointer-events-none appearance-none bg-transparent" />
        </div>
      </div>

      {[
        { id: 'category', label: 'Product category', options: ['Bracelets', 'Charms & Pendants'] },
        { id: 'gender', label: 'Gender', options: ['For Her', 'For Him', 'Unisex'] },
        { id: 'material', label: 'Jewellery Material', options: dynamicMaterials },
      ].map((section) => (
        <div key={section.id} className="border-t border-[#280F0B33] pt-3 mt-5">
          <button onClick={() => toggleSection(section.id as any)} className="w-full flex justify-between items-center text-[12px] font-bold uppercase tracking-wider mb-2">
            {section.label}
            <Image src="/assets/images/dropdown.svg" alt="" width={24} height={24} className={`transition-transform duration-300 ${openSections[section.id as keyof typeof openSections] ? 'rotate-180' : ''}`} />
          </button>
          <div className={`overflow-hidden transition-all duration-500 ${openSections[section.id as keyof typeof openSections] ? 'max-h-[1000px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
            <div className="space-y-2 pb-3">
              {section.options.map((opt: string) => (
                <label key={opt} className="flex items-center gap-3 text-sm cursor-pointer hover:opacity-70">
                  <div className="relative flex items-center justify-center w-4 h-4">
                    <input type="checkbox" className="peer appearance-none w-4 h-4 border border-[#280F0B] rounded-sm checked:bg-[#280F0B] transition-all cursor-pointer" checked={filters[section.id as keyof Filters].includes(opt)} onChange={() => toggleFilter(section.id as keyof Filters, opt)} />
                    <svg className="absolute w-3 h-3 pointer-events-none hidden peer-checked:block text-[#F6D8AB]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span>{opt} ({section.id === 'category' ? safeProducts.filter((p: any) => {
                    const t = p.title.toLowerCase();
                    return opt === 'Bracelets' ? (t.includes('bracelet')) : (t.includes('pendant') || (!t.includes('bracelet')));
                  }).length : getCount(section.id as any, opt)})</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      ))}
    </>
  );
}