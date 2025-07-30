export default function WhyMarsosSection() {
  return (
    <section className='w-full bg-[#2c6449] py-12 sm:py-20 px-2 sm:px-4 overflow-hidden relative'>
      {/* Subtle brand background shapes */}
      <svg
        className='absolute top-0 left-0 w-full h-full z-0 pointer-events-none'
        viewBox='0 0 1440 400'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <rect
          x='700'
          y='0'
          width='600'
          height='350'
          rx='90'
          fill='#b2e0c7'
          fillOpacity='0.04'
          transform='rotate(30 800 0)'
        />
        <rect
          x='180'
          y='150'
          width='320'
          height='180'
          rx='40'
          fill='#b2e0c7'
          fillOpacity='0.06'
          transform='rotate(-18 350 180)'
        />
      </svg>
      <div className='relative z-10 max-w-7xl mx-auto'>
        {/* Section Title */}
        <div className='mb-8 sm:mb-10 flex flex-col items-center'>
          <span className='uppercase tracking-widest text-xs sm:text-sm bg-[#1a4833]/30 px-3 py-1 rounded-full text-[#eaf3ed] font-semibold mb-2'>
            Why Marsos.sa?
          </span>
          <h2 className='text-xl sm:text-3xl md:text-5xl font-extrabold text-[#eaf3ed] text-center mb-2'>
            The Future of Industrial Commerce
          </h2>
        </div>
        {/* Features Grid */}
        <div className='mt-8 sm:mt-12 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10 items-stretch'>
          <FeatureCard
            icon={
              <svg
                className='w-10 h-10 sm:w-12 sm:h-12'
                fill='none'
                stroke='#2c6449'
                strokeWidth='2.5'
                viewBox='0 0 48 48'
              >
                <rect x='7' y='14' width='34' height='23' rx='6' />
                <path d='M11 20h26M15 27h18' />
              </svg>
            }
            title='Unified Industrial Marketplace'
            description='A one-stop platform aggregating Saudi industrial products for efficient B2B sourcing and procurement. Buyers access a comprehensive catalog, while manufacturers gain broader reach to showcase products.'
          />
          <FeatureCard
            icon={
              <svg
                className='w-10 h-10 sm:w-12 sm:h-12'
                fill='none'
                stroke='#2c6449'
                strokeWidth='2.5'
                viewBox='0 0 48 48'
              >
                <rect x='8' y='16' width='32' height='18' rx='5' />
                <rect
                  x='14'
                  y='21'
                  width='8'
                  height='5'
                  rx='2'
                  fill='#2c6449'
                />
                <path d='M32 26h2' strokeLinecap='round' />
              </svg>
            }
            title='Easy & Secure Payments'
            description='Integrated payment solutions make transactions smooth, secure, and business-friendly—building trust and removing barriers in the B2B purchase process.'
          />
          <FeatureCard
            icon={
              <svg
                className='w-10 h-10 sm:w-12 sm:h-12'
                fill='none'
                stroke='#2c6449'
                strokeWidth='2.5'
                viewBox='0 0 48 48'
              >
                <rect x='10' y='10' width='28' height='28' rx='6' />
                <path d='M18 18h12M18 24h8' />
              </svg>
            }
            title='User-Friendly Digital Tools'
            description='Intuitive tools let manufacturers set up online stores, manage products, and connect with buyers—fast onboarding and easy operations, even for e-commerce newcomers.'
          />
          <FeatureCard
            icon={
              <svg
                className='w-10 h-10 sm:w-12 sm:h-12'
                fill='none'
                stroke='#2c6449'
                strokeWidth='2.5'
                viewBox='0 0 48 48'
              >
                <circle cx='24' cy='24' r='14' />
                <path d='M24 10v28M10 24h28' />
              </svg>
            }
            title='Expanded Market Reach'
            description='marsos.sa connects Saudi producers with buyers locally and globally—increasing export opportunities and helping businesses scale beyond regional markets.'
          />
        </div>
      </div>
    </section>
  );
}

// Card component with centered content and updated color
function FeatureCard({ icon, title, description }) {
  return (
    <div
      className='flex flex-col justify-center items-center text-center w-full max-w-xs mx-auto px-3 py-8 h-full
      bg-[#f6faf6] rounded-xl shadow-lg border border-[#b2e0c7]/70
      transition-transform duration-200 hover:scale-105'
    >
      <div className='mb-4'>{icon}</div>
      <div className='font-bold text-base sm:text-lg text-[#1a4833] mb-2'>
        {title}
      </div>
      <div className='text-[#226345] text-sm sm:text-base'>{description}</div>
    </div>
  );
}
