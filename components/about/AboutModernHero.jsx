"use client";

import { useLocale } from "next-intl";

export default function AboutModernHero({ aboutRef }) {
  const locale = useLocale();
  const isRTL = locale === "ar";

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      lang={locale}
      className='relative w-full h-screen flex items-center overflow-hidden'
    >
      {/* BG IMAGE */}
      <img
        src='/about-hero2.jpg'
        alt={isRTL ? "حول مرصوص.سا" : "About Marsos.sa"}
        className='absolute inset-0 w-full h-full object-cover object-top z-0'
        draggable={false}
      />

      {/* GRADIENT OVERLAY for readability */}
      <div className='absolute inset-0 z-10 bg-gradient-to-br from-black/80 via-black/60 to-transparent' />

      {/* SVG overlays (full section guaranteed) */}
      <div className='absolute inset-0 w-full h-full z-20 pointer-events-none'>
        {/* ... SVGs unchanged ... */}
        <svg
          className='absolute inset-0 w-full h-full'
          viewBox='0 0 1400 768'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
          width='100%'
          height='100%'
          preserveAspectRatio='none'
        >
          <polygon
            points='0,0 700,0 400,768 0,768'
            fill='#2c6449'
            fillOpacity='0.44'
          />
          <polygon
            points='0,0 380,0 210,768 0,768'
            fill='#b2e0c7'
            fillOpacity='0.18'
          />
          <polygon
            points='600,0 900,0 650,768 350,768'
            fill='#eaf3ed'
            fillOpacity='0.11'
          />
        </svg>
        <svg
          className='absolute inset-0 w-full h-full'
          viewBox='0 0 1400 768'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
          width='100%'
          height='100%'
          preserveAspectRatio='none'
        >
          <line
            x1='110'
            y1='90'
            x2='730'
            y2='700'
            stroke='#2c6449'
            strokeWidth='10'
            strokeLinecap='round'
            opacity='0.38'
          />
        </svg>
        <svg
          className='absolute inset-0 w-full h-full'
          viewBox='0 0 1400 768'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
          width='100%'
          height='100%'
          preserveAspectRatio='none'
        >
          <line
            x1='180'
            y1='0'
            x2='900'
            y2='768'
            stroke='#b2e0c7'
            strokeWidth='7'
            strokeLinecap='round'
            opacity='0.7'
          />
        </svg>
      </div>

      {/* CONTENT */}
      <div
        ref={aboutRef}
        className={
          isRTL
            ? "relative z-30 flex flex-col items-center md:items-end justify-center h-full w-full max-w-xl px-4 md:pr-24 md:pl-4 py-8 text-right"
            : "relative z-30 flex flex-col items-center md:items-start justify-center h-full w-full max-w-xl px-4 md:pl-24 md:pr-4 py-8 text-left"
        }
      >
        {isRTL ? (
          <>
            <h2 className='text-white text-2xl sm:text-3xl md:text-5xl font-extrabold mb-4 leading-snug tracking-tight text-center md:text-left'>
              عن{" "}
              <span className='text-[#b2e0c7] font-extrabold'>Marsos.sa</span>
            </h2>
            <div className='text-white/90 mb-8 max-w-lg leading-relaxed text-base sm:text-lg drop-shadow space-y-4 text-center md:text-left'>
              <p>
                <b>marsos.sa</b> هي منصة رقمية سعودية تجمع بين الشركات الصناعية
                والمنتجات السعودية تحت مظلة واحدة، من خلال توفير حلول تقنية ذكية
                وطرق دفع ميسرة.
              </p>
              <p>
                تسد هذه المنصة الفجوة بين المشترين والمصنعين السعوديين من خلال
                توفير سوق إلكتروني موحد للمنتجات الصناعية.
              </p>
              <p>
                تأسست في عام 2024 ويقع مقرها الرئيسي في الرياض، المملكة العربية
                السعودية، وتقدم marsos.sa أدوات مالية ورقمية سهلة الاستخدام
                لتعزيز النمو وخلق قنوات بيع جديدة محليًا ودوليًا للمصنعين
                الصناعيين السعوديين.
              </p>
              <div className='border-l-4 border-[#b2e0c7] bg-[#eaf3ed]/70 py-2 px-4 rounded-lg shadow text-[#2c6449] text-base font-semibold mt-2 mb-2'>
                يأتي هذا المشروع ضمن التزامنا بدعم التحول الرقمي وتعزيز نمو
                القطاع الصناعي في المملكة تماشيًا مع أهداف رؤية السعودية 2030،
                حيث نهدف إلى تمكين المصنّعين من:
              </div>
              <ul className='list-disc pl-6 space-y-1 text-white text-base font-semibold'>
                <li>التوسع في أسواق جديدة.</li>
                <li>تحسين الكفاءة التشغيلية.</li>
                <li>زيادة فرص النجاح التجاري من خلال حلول مصممة بعناية.</li>
              </ul>
            </div>
          </>
        ) : (
          <>
            <h2 className='text-white text-2xl sm:text-3xl md:text-5xl font-extrabold mb-4 leading-snug tracking-tight text-center md:text-left'>
              About{" "}
              <span className='text-[#b2e0c7] font-extrabold'>Marsos.sa</span>
            </h2>
            <div className='text-white/90 mb-8 max-w-lg leading-relaxed text-base sm:text-lg drop-shadow space-y-4 text-center md:text-left'>
              <p>
                <b>marsos.sa</b> is a Saudi digital platform that unites Saudi
                Arabia industrial manufacturers and products under one umbrella,
                providing intuitive technology solutions and convenient payment
                methods.
              </p>
              <p>
                It bridges the gap between buyers and Saudi manufacturers by
                offering a unified online marketplace for industrial goods.
              </p>
              <p>
                Established in 2024 and headquartered in Riyadh, Saudi Arabia,
                marsos.sa delivers easy-to-use financial and digital tools to
                enhance growth and create new sales channels locally and
                internationally for Saudi industrial producers.
              </p>
              <div className='border-l-4 border-[#b2e0c7] bg-[#eaf3ed]/70 py-2 px-4 rounded-lg shadow text-[#2c6449] text-base font-semibold mt-2 mb-2'>
                This project comes as part of our commitment to support digital
                transformation and enhance the growth of the industrial sector
                in the Kingdom in line with the goals of Saudi Vision 2030, as
                we aim to enable Manufactures to:
              </div>
              <ul className='list-disc pl-6 space-y-1 text-white text-base font-semibold'>
                <li>Expanding into new markets.</li>
                <li>Improve operational efficiency.</li>
                <li>
                  Increase chances of business success through carefully
                  customized solutions.
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
