import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

// Helper for slugifying category labels
function safeSlug(value) {
  if (typeof value !== "string") return "";
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/[^\w\u0600-\u06FF-]+/g, "");
}

export default function TrendingSlider({
  categories = [],
  isRTL,
  locale = "en",
}) {
  return (
    <div className='relative w-full'>
      <Swiper
        modules={[Navigation]}
        slidesPerView={5}
        spaceBetween={8}
        navigation={{
          nextEl: ".cat-next",
          prevEl: ".cat-prev",
        }}
        dir={isRTL ? "rtl" : "ltr"}
        style={{ width: "100%" }}
        breakpoints={{
          320: { slidesPerView: 3 },
          640: { slidesPerView: 4 },
          900: { slidesPerView: 8 },
        }}
      >
        {categories.map((cat, i) => {
          let slug = "";
          if (typeof cat.slug === "string") {
            slug = cat.slug;
          } else if (typeof cat.label === "string") {
            slug = safeSlug(cat.label);
          } else {
            slug = `category-${i}`;
          }

          return (
            <SwiperSlide key={`${slug}-${i}`}>
              <Link href={`/category/${slug}`} className='group block'>
                <div className='flex flex-col items-center min-w-[110px] w-[110px] mx-auto'>
                  <div className='w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-white shadow border border-gray-200 mb-2 flex items-center justify-center transition group-hover:scale-105'>
                    <img
                      src={cat.image}
                      alt={cat.label}
                      className='w-full h-full object-cover'
                      loading='lazy'
                      onError={(e) => (e.target.src = "/dummy1.jpg")}
                    />
                  </div>
                  <span
                    className='text-[#2c6449] font-semibold text-xs md:text-sm text-center mt-1 leading-snug break-words max-w-[100px]'
                    style={{
                      wordBreak: "break-word",
                      whiteSpace: "normal",
                    }}
                  >
                    {cat.label}
                  </span>
                </div>
              </Link>
            </SwiperSlide>
          );
        })}
        <button
          className='cat-prev absolute top-1/2 -translate-y-1/2 left-1 z-20 bg-[#eaf3ed] hover:bg-[#f9d783] text-[#2c6449] rounded-full p-1 shadow transition'
          style={{ width: 28, height: 28 }}
        >
          <svg width='18' height='18' viewBox='0 0 20 20'>
            <path
              fill='none'
              d='M13.5 16l-5-6 5-6'
              stroke='#2c6449'
              strokeWidth='1.6'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </button>
        <button
          className='cat-next absolute top-1/2 -translate-y-1/2 right-1 z-20 bg-[#eaf3ed] hover:bg-[#f9d783] text-[#2c6449] rounded-full p-1 shadow transition'
          style={{ width: 28, height: 28 }}
        >
          <svg width='18' height='18' viewBox='0 0 20 20'>
            <path
              fill='none'
              d='M6.5 4l5 6-5 6'
              stroke='#2c6449'
              strokeWidth='1.6'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </button>
      </Swiper>
    </div>
  );
}
