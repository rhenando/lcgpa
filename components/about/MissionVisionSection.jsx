"use client";
import { useLocale } from "next-intl";

const messages = {
  en: {
    heading: "Our mission & vision.",
    subheading: "Driving growth through industrial innovation.",
    missionTitle: "Mission",
    missionDesc:
      "Our mission is to provide easy to use financial and digital solutions that empower Saudi manufacturers to grow and reach new markets, both locally and internationally. Marsos.sa is committed to bridging the producer-consumer divide by leveraging technology and strategic partnerships, enabling seamless transactions and fostering sustainable industrial development.",
    visionTitle: "Vision",
    visionDesc:
      "To become the leading global hub for Saudi industrial products and a key enabler of the Kingdom’s industrial digital transformation. We strive to build a trusted, innovative marketplace that elevates Saudi manufacturers on the world stage, reflecting the strength and quality of Made in Saudi products.",
  },
  ar: {
    heading: "مهمتنا ورؤيتنا.",
    subheading: "دفع عجلة النمو من خلال الابتكار الصناعي.",
    missionTitle: "المهمة",
    missionDesc:
      "مهمتنا هي توفير حلول مالية ورقمية سهلة الاستخدام تمكّن المصنّعين السعوديين من النمو والوصول إلى أسواق جديدة محليًا ودوليًا. تلتزم منصة Marsos.sa بردم الفجوة بين المنتج والمستهلك من خلال الاستفادة من التكنولوجيا والشراكات الاستراتيجية، بما يتيح معاملات سلسة ويعزز التنمية الصناعية المستدامة.",
    visionTitle: "الرؤية",
    visionDesc:
      "أن نصبح المركز العالمي الرائد للمنتجات الصناعية السعودية وأن نكون ممكنًا رئيسيًا للتحول الرقمي الصناعي في المملكة. نسعى لبناء سوق موثوقة ومبتكرة ترفع من مكانة المصنّعين السعوديين عالميًا وتعكس قوة وجودة منتجات صنع في السعودية.",
  },
};

export default function MissionVisionSection() {
  const locale = useLocale?.() || "en";
  const lang = locale === "ar" ? "ar" : "en";
  const isRTL = lang === "ar";
  const t = messages[lang];

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className='w-full bg-[#eaf3ed] py-8 sm:py-16 px-2 sm:px-4'
    >
      <div className='max-w-4xl mx-auto'>
        {/* Heading */}
        <div className='mb-6'>
          <h2 className='text-2xl sm:text-4xl font-extrabold text-[#2c6449] mb-2 leading-tight'>
            {t.heading}
          </h2>
          <div className='text-[#246955] text-base sm:text-lg md:text-xl font-medium'>
            {t.subheading}
          </div>
        </div>
        {/* Mission Card */}
        <div
          className={`
            rounded-xl border border-[#b2e0c7] mb-5 px-3 py-4 flex flex-row items-start gap-3 sm:gap-6 bg-white
            ${isRTL ? "flex-row-reverse" : ""}
          `}
        >
          {/* Text */}
          <div className='flex-1 min-w-0'>
            <div className='font-bold text-lg sm:text-2xl text-[#2c6449] mb-2'>
              {t.missionTitle}
            </div>
            <div className='text-[#143b25] text-xs sm:text-base leading-relaxed'>
              {t.missionDesc}
            </div>
          </div>
          {/* Image */}
          <div
            className={`
              flex-shrink-0 w-24 h-24 sm:w-36 sm:h-36 rounded-lg border border-[#b2e0c7] bg-gray-100 flex items-start justify-center mt-0
              ${isRTL ? "mr-2" : "ml-2"}
            `}
          >
            <img
              src='/mission.jpg'
              alt={t.missionTitle}
              className='w-full h-full object-cover rounded-lg'
            />
          </div>
        </div>
        {/* Vision Card */}
        <div
          className={`
            rounded-xl border border-[#b2e0c7] mb-8 px-3 py-4 flex flex-row items-start gap-3 sm:gap-6 bg-white
            ${isRTL ? "flex-row-reverse" : ""}
          `}
        >
          {/* Image */}
          <div
            className={`
              flex-shrink-0 w-24 h-24 sm:w-36 sm:h-36 rounded-lg border border-[#b2e0c7] bg-gray-100 flex items-start justify-center mb-0
              ${isRTL ? "ml-2" : "mr-2"}
            `}
          >
            <img
              src='/vision.jpg'
              alt={t.visionTitle}
              className='w-full h-full object-cover rounded-lg'
            />
          </div>
          {/* Text */}
          <div className='flex-1 min-w-0'>
            <div className='font-bold text-lg sm:text-2xl text-[#2c6449] mb-2'>
              {t.visionTitle}
            </div>
            <div className='text-[#143b25] text-xs sm:text-base leading-relaxed'>
              {t.visionDesc}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
