import Header from '@/components/Header'

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen mx-auto">
      <Header />
      
      {/* Main Content - Responsive fluid layout */}
      <main className="bg-[#F6D8AB] min-h-screen pb-12">
        {/* Centered container with max-width */}
        <div className="w-full max-w-[1280px] mx-auto px-8 pt-16 flex flex-col gap-6">
          <h1 className="font-bold text-[32px] leading-[100%] tracking-[0px] text-gray-900" style={{ fontFamily: 'var(--font-manrope)' }}>Refund Policy</h1>
          
          {/* Returns Section */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Returns:</h2>
            <p className="text-gray-800 leading-relaxed">
              We accept returns within 30 days of purchase for items in new or like-new condition, with original packaging intact. Returns are accepted for both defective and non-defective products (e.g., buyer's remorse).
            </p>
          </section>

          {/* Eligibility Criteria */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Eligibility Criteria:</h2>
            <ul className="list-disc list-inside space-y-1 text-base leading-6 font-normal ml-4" style={{ fontFamily: 'var(--font-manrope)', letterSpacing: '-0.005em' }}>
              <li>Items must be unused, undamaged, and in resalable condition.</li>
              <li>Proof of purchase (order number or receipt) is required.</li>
              <li>Sale items, personalized/custom-made products, and items marked "final sale" are non-returnable.</li>
              <li>Does not fall under any other requirements of our return policy</li>
            </ul>
          </section>

          {/* Parts Replacement */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Parts replacement:</h2>
            <p className="text-gray-800 leading-relaxed">
              All products which can fall under the circumstance of requiring part replacements are covered for the first six (6) months of purchase.
            </p>
          </section>

          {/* Refunds */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Refunds:</h2>
            <p className="text-gray-800 leading-relaxed">
              Refunds are processed within 14 business days of receiving the returned item. Refunds are issued to the original payment method. Shipping costs are non-refundable.
            </p>
          </section>

          {/* Exchanges */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Exchanges:</h2>
            <p className="text-gray-800 leading-relaxed">
              Exchanges are allowed for defective or damaged items. Contact us at help@rawearthcrystals.com.au to initiate an exchange.
            </p>
          </section>

          {/* Return Process */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Return process:</h2>
            <div className="bg-[#FFC26F] p-6 rounded-lg space-y-3">
              <p className="text-gray-900">
                <span className="font-semibold">Contact Us:</span>{' '}
                <a href="mailto:help@rawearthcrystals.com.au" className="font-bold hover:underline">
                  help@rawearthcrystals.com.au
                </a>{' '}
                with your order number and reason for return.
              </p>
              <p className="text-gray-900">
                <span className="font-semibold">Ship the Item:</span> Return the product to:
              </p>
              <div className="ml-4 text-gray-900">
                <p>Raw Earth Crystals</p>
                <p>Unit 3/32 Harrington St, Arundel QLD 4214</p>
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-gray-900 text-sm">Customers are responsible for return shipping costs.</p>
                <p className="text-gray-900 text-sm">
                  For items over $75, we recommend using a trackable shipping service
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
