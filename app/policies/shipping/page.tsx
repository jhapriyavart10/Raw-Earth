import Header from '@/components/Header'

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen mx-auto">
      <Header />
      
      {/* Main Content - Responsive fluid layout */}
      <main className="bg-[#F6D8AB] min-h-screen pb-12">
        {/* Centered container with max-width */}
        <div className="w-full max-w-[1280px] mx-auto px-8 pt-16 flex flex-col gap-6">
          <h1 className="font-bold text-[32px] leading-[100%] tracking-[0px] text-gray-900" style={{ fontFamily: 'var(--font-manrope)' }}>Shipping Policy</h1>
          
          {/* Intro */}
          <p className="text-base leading-6 font-normal" style={{ fontFamily: 'var(--font-manrope)', letterSpacing: '-0.005em' }}>
            At Raw Earth Crystals, we aim to provide our customers with a smooth and efficient shopping experience. Below are the details regarding our shipping policy:
          </p>

          {/* Estimated Shipping Times */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Estimated Shipping Times</h2>
            <p className="text-base leading-6 font-normal" style={{ fontFamily: 'var(--font-manrope)', letterSpacing: '-0.005em' }}>
              The estimated completion time for all shipping orders is based on the approximate timelines provided by our delivery service partners. Please be aware that these times are estimates and are not guarantees. Once your order has been dispatched, it is subject to the delivery service's schedule, and we cannot be held responsible for any delays beyond our control.
            </p>
          </section>

          {/* Shipping Prices */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Shipping Prices</h2>
            <p className="text-base leading-6 font-normal mb-2" style={{ fontFamily: 'var(--font-manrope)', letterSpacing: '-0.005em' }}>
              All shipping prices are subject to change without notice. We strive to keep our shipping costs competitive, but please understand that fluctuations in pricing may occur due to factors beyond our control.
            </p>
            <p className="text-base leading-6 font-normal" style={{ fontFamily: 'var(--font-manrope)', letterSpacing: '-0.005em' }}>
              Any sales or promotions that involve modifying the price of shipping for the customer are also subject to change without notice. We recommend checking our website regularly to stay updated on any shipping changes or promotional offers.
            </p>
          </section>

          {/* Responsibility for Delivery */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Responsibility for Delivery</h2>
            <p className="text-base leading-6 font-normal" style={{ fontFamily: 'var(--font-manrope)', letterSpacing: '-0.005em' }}>
              While we take every measure to ensure your order is shipped promptly, we are not responsible for failed deliveries that result from the fault of the delivery service. This includes, but is not limited to, lost packages, delays due to unforeseen circumstances, or issues related to incorrect addresses provided at checkout.
            </p>
          </section>

          {/* Order Tracking */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Order Tracking</h2>
            <p className="text-base leading-6 font-normal" style={{ fontFamily: 'var(--font-manrope)', letterSpacing: '-0.005em' }}>
              Once your order has been shipped, you will receive a confirmation email containing tracking information. You can use this information to monitor the status of your shipment directly through the delivery service's tracking system.
            </p>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Contact Us</h2>
            <p className="text-base leading-6 font-normal mb-3" style={{ fontFamily: 'var(--font-manrope)', letterSpacing: '-0.005em' }}>
              If you have any questions or concerns regarding our shipping policy, please feel free to reach out to our customer service team. We are here to assist you!
            </p>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Contact Information</h3>
            <div className="space-y-1">
              <p className="text-gray-900">
                <span className="font-semibold">Customer Service Email:</span>{' '}
                <a href="mailto:help@rawearthcrystals.com" className="hover:underline">
                  help@rawearthcrystals.com
                </a>
              </p>
              <p className="text-gray-900">
                <span className="font-semibold">Website:</span>{' '}
                <a href="https://rawearthcrystals.com.au" className="hover:underline" target="_blank" rel="noopener noreferrer">
                  rawearthcrystals.com.au
                </a>
              </p>
            </div>
          </section>

          {/* Footer note */}
          <section>
            <p className="text-gray-800 italic text-sm">
              This policy is effective as of September, 2024. Raw Earth Crystals reserves the right to modify this policy at any time.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
