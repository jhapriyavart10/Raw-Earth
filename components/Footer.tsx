"use client";
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function Footer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLSpanElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const updateScale = () => {
      if (!logoRef.current || !containerRef.current) return;
      logoRef.current.style.transform = 'scale(1)';
      const textWidth = logoRef.current.offsetWidth;
      const containerWidth = containerRef.current.offsetWidth;
      if (textWidth === 0 || containerWidth === 0) return;
      const rawScale = containerWidth / textWidth;
      const isMobile = window.innerWidth < 768;
      const clampedScale = isMobile ? Math.min(rawScale, 1.0) : Math.min(Math.max(rawScale, 0.82), 1.12);
      setScale(clampedScale);
    };

    requestAnimationFrame(updateScale);
    window.addEventListener('resize', updateScale);

    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    <footer className="bg-[#280F0B] text-[#F6D8AB] pt-16 pb-10 mt-auto">
      <div ref={containerRef} className="w-[99vw] sm:w-[85vw] max-w-[2440px] mx-auto px-4 sm:px-0">

        {/* Main Content Grid */}
        <div className="flex flex-col lg:flex-row lg:justify-between gap-12 lg:gap-8 mb-16 lg:mb-24">

          {/* Tagline & Socials */}
          <div className="flex-1">
            <h2
              className="text-[32px] leading-[1.15] text-[#F6D8AB] mb-6"
              style={{ WebkitFontSmoothing: 'antialiased' }}
            >
              <span className="font-manrope font-normal">
                Your{' '}
              </span>
              <span className="font-lora italic font-medium">
                spiritual journey
              </span>
              <br />
              <span className="font-manrope font-normal">
                begins{' '}
              </span>

              <span className="font-manrope font-normal text-[#FFC26F]">
                here
              </span>.
            </h2>

            <p className="font-manrope text-[14px] text-white opacity-70 max-w-md mb-8 leading-[1.6]">
              Healing Bracelets from the house of Raw Earth Crystals. <br className="hidden md:block" />
              Every bracelet tells a beautiful story.
            </p>

            <div className="flex gap-5">
              {[
                { name: 'X', href: 'https://x.com/GC_Crystals' },
                { name: 'insta', href: 'https://www.instagram.com/raw_earth_crystals_store/' },
                { name: 'pinterest', href: 'https://au.pinterest.com/raw_earth_crystals/' },
                { name: 'facebook', href: 'https://www.facebook.com/rawearthcrystalsstore' }
              ].map((social) => (
                <Link key={social.name} href={social.href} target="_blank" rel="noopener noreferrer">
                  <img
                    src={`/assets/images/${social.name}.svg`}
                    alt={`${social.name} icon`}
                    className="w-5 h-5 invert brightness-0 opacity-90 hover:opacity-70 transition-opacity"
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Links Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 lg:gap-16 w-full lg:w-auto">
            <div>
              <h3 className="text-[#F6D8AB]/50 text-xs tracking-normal mb-4 font-manrope">
                Index
              </h3>
              <ul className="space-y-[6px] text-[15px] font-manrope">
                <li><Link href="/product-analogue">Home</Link></li>
                <li><Link href="https://azure-takeaways-956863.framer.app/blogs">Dojo</Link></li>
                <li><Link href="/testimonials">Testimonials</Link></li>
                <li><Link href="/profile">User Account</Link></li>
                <li><Link href="/product-analogue">Shop</Link></li>
                <li><Link href="/faqs">FAQs</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-[#F6D8AB]/50 text-xs tracking-[0em] mb-4 font-manrope">
                Legal
              </h3>
              <ul className="space-y-[6px] text-[15px] font-manrope">
                <li><Link href="/policies/privacy">Privacy Policy</Link></li>
                <li><Link href="/policies/terms">Terms of service</Link></li>
                <li><Link href="/policies/refund">Refund policy</Link></li>
                <li><Link href="/policies/shipping">Shipping policy</Link></li>
                {/* <li><Link href="/signup">Sign up</Link></li> */}
              </ul>
            </div>

            <div className="lg:text-left">
              <h3 className="text-[#F6D8AB]/50 text-xs tracking-[0em] mb-4 font-manrope">
                Contact
              </h3>
              <a
                href="mailto:hello@rawearthcrystals.com.au"
                className="text-[15px] font-manrope opacity-90 hover:opacity-70 transition-opacity"
              >
                hello@rawearthcrystals.com.au
              </a>
            </div>
          </div>
        </div>

        {/* Massive Logo Text */}
        <div className="w-full mb-10 overflow-hidden flex justify-center">
          <h1
            className="font-muslone uppercase select-none whitespace-nowrap tracking-wider"
            style={{
              fontSize: 'clamp(1.2rem, 8vw, 12rem)',      // FIXED base size
              fontWeight: 500,         // FIXED weight
              lineHeight: 0.9,
              WebkitFontSmoothing: 'antialiased',
              paddingTop: '0.08em',
            }}
          >
            <span
              ref={logoRef}
              style={{
                display: 'inline-block',
                transform: `scale(${scale})`,
                transformOrigin: 'center center',
                willChange: 'transform',
              }}
            >
              Raw Earth Crystals
            </span>
          </h1>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 w-full 
                font-manrope text-[14px] font-medium tracking-[-0.1px] leading-[1.4em] 
                text-[#CCCCCC] text-center lg:text-left">
          <p>© {new Date().getFullYear()} Raw Earth Crystals All rights reserved.</p>
          <p>Designed & Developed by Dtory Studio</p>
        </div>

      </div>
    </footer>
  );
}
