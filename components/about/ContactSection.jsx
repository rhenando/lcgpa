import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Phone, MapPin } from "lucide-react";
import { toast, Toaster } from "sonner";
import { db } from "@/firebase/config";
import { collection, addDoc, Timestamp } from "firebase/firestore";

const COUNTRY_CODES = [
  { code: "+966", label: "🇸🇦 +966", value: "SA" },
  { code: "+971", label: "🇦🇪 +971", value: "AE" },
  { code: "+63", label: "🇵🇭 +63", value: "PH" },
  { code: "+974", label: "🇶🇦 +974", value: "QA" },
  { code: "+968", label: "🇴🇲 +968", value: "OM" },
  { code: "+965", label: "🇰🇼 +965", value: "KW" },
  { code: "+973", label: "🇧🇭 +973", value: "BH" },
];

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ContactSection() {
  const locale = useLocale();
  const t = useTranslations("contactHero");
  const isRTL = locale === "ar";

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("SA");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePhoneChange = (e) => {
    let value = e.target.value;
    if (/[^0-9]/.test(value)) {
      toast.error(t("validation.onlyNumbers"));
      value = value.replace(/[^0-9]/g, "");
    }
    if (value.length > 10) {
      toast.error(t("validation.maxDigits"));
      value = value.slice(0, 10);
    }
    setPhone(value);
  };

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handleFullNameChange = (e) => setFullName(e.target.value);
  const handleCountryCodeChange = (e) => setCountryCode(e.target.value);
  const handleMessageChange = (e) => setMessage(e.target.value);

  const handleEmailBlur = () => {
    if (email && !validateEmail(email)) {
      toast.error(t("validation.email"));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let error = false;

    if (!fullName.trim()) {
      toast.error(t("validation.name"));
      error = true;
    }
    if (!validateEmail(email)) {
      toast.error(t("validation.email"));
      error = true;
    }
    if (!phone || phone.length < 7) {
      toast.error(t("validation.phone"));
      error = true;
    }
    if (!message.trim()) {
      toast.error(t("validation.message"));
      error = true;
    }
    if (error) return;

    setLoading(true);

    try {
      await addDoc(collection(db, "contactMessages"), {
        fullName,
        countryCode,
        phone,
        email,
        message,
        createdAt: Timestamp.now(),
      });

      toast.success(t("success"));
      setFullName("");
      setCountryCode("SA");
      setPhone("");
      setEmail("");
      setMessage("");
    } catch (err) {
      console.error(err);
      toast.error(t("fail"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className='w-full bg-[#eaf3ed] py-10 md:py-14 px-2 sm:px-4 flex justify-center'
      id='contact'
      dir={isRTL ? "rtl" : "ltr"}
    >
      <Toaster position='top-center' richColors />
      <div className='w-full max-w-6xl rounded-2xl overflow-hidden shadow-lg bg-white/60 relative flex flex-col md:flex-row p-0'>
        {/* Left: Info + Brand Message */}
        <div
          className={
            "relative w-full md:flex-1 flex flex-col justify-between min-h-[300px] md:min-h-[440px] p-4 md:p-8 bg-[#2c6449] bg-blend-multiply"
          }
          style={{
            backgroundImage: "url('/8dbf4ecc-44d8-4842-bd4e-6173c2509126.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className='mb-8 md:mb-10'>
            <h2 className='text-[#f9d783] text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3'>
              {t("sectionTitle")}
            </h2>
            <p
              className='text-[#eaf3ed] text-base sm:text-lg leading-relaxed mb-4 max-w-lg'
              style={isRTL ? { whiteSpace: "pre-line" } : {}}
            >
              {t("brandText")}
            </p>
          </div>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-7 text-white text-sm'>
            <div>
              <div className='font-bold mb-3 flex items-center gap-2 text-[#f9d783] text-lg'>
                <Phone className='w-5 h-5 text-[#f9d783]' />
                <span>{t("call")}</span>
              </div>
              <div className='mb-2 flex items-center gap-2'>
                <span className='tracking-wider'>0 5 3 0 0 1 4 7 0 7</span>
              </div>
              <div className='mb-2 flex items-center gap-2 lowercase'>
                marsos@marsos.sa
              </div>
              <div className='mb-1 flex items-center gap-2'>
                <a
                  href='https://marsos.sa'
                  className='underline break-all'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  marsos.sa
                </a>
              </div>
            </div>
            <div>
              <div className='font-bold mb-3 flex items-center gap-2 text-[#f9d783] text-lg'>
                <MapPin className='w-5 h-5 text-[#f9d783]' />
                <span>{t("location")}</span>
              </div>
              <div className='mb-1 flex items-center gap-2'>{t("address")}</div>
            </div>
          </div>
        </div>
        {/* Right: Contact Form */}
        <div className='w-full md:flex-1 bg-white p-4 md:p-8 flex flex-col min-h-[300px] md:min-h-[440px] justify-center'>
          <h3 className='text-[#2c6449] font-bold text-lg sm:text-xl mb-3'>
            {t("formTitle")}
          </h3>
          <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
            <div
              className={
                isRTL
                  ? "flex flex-col md:flex-row-reverse gap-4"
                  : "flex flex-col md:flex-row gap-4"
              }
            >
              <input
                className='flex-1 rounded-md border border-[#b2e0c7] px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#2c6449]'
                placeholder={t("name")}
                type='text'
                name='fullName'
                autoComplete='name'
                value={fullName}
                onChange={handleFullNameChange}
                disabled={loading}
                dir={isRTL ? "rtl" : "ltr"}
              />
              <div
                className={
                  isRTL ? "flex flex-1 flex-row-reverse" : "flex flex-1"
                }
              >
                <select
                  className={
                    isRTL
                      ? "rounded-r-md border border-[#b2e0c7] bg-white px-2 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#2c6449]"
                      : "rounded-l-md border border-[#b2e0c7] bg-white px-2 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#2c6449]"
                  }
                  style={{ minWidth: 88 }}
                  value={countryCode}
                  name='countryCode'
                  aria-label={t("countryCodeLabel")}
                  onChange={handleCountryCodeChange}
                  disabled={loading}
                  dir={isRTL ? "rtl" : "ltr"}
                >
                  {COUNTRY_CODES.map((item) => (
                    <option value={item.value} key={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <input
                  className={
                    isRTL
                      ? "flex-1 rounded-l-md border-t border-b border-l border-[#b2e0c7] px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#2c6449]"
                      : "flex-1 rounded-r-md border-t border-b border-r border-[#b2e0c7] px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#2c6449]"
                  }
                  placeholder={t("phone")}
                  type='tel'
                  name='phoneNumber'
                  value={phone}
                  onChange={handlePhoneChange}
                  autoComplete='tel'
                  maxLength={10}
                  inputMode='numeric'
                  disabled={loading}
                  dir={isRTL ? "rtl" : "ltr"}
                />
              </div>
            </div>
            <input
              className='rounded-md border border-[#b2e0c7] px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#2c6449]'
              placeholder={t("email")}
              type='email'
              name='email'
              autoComplete='email'
              value={email}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              disabled={loading}
              dir={isRTL ? "rtl" : "ltr"}
            />
            <textarea
              className='rounded-md border border-[#b2e0c7] px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#2c6449] min-h-[80px]'
              placeholder={t("message")}
              name='message'
              value={message}
              onChange={handleMessageChange}
              disabled={loading}
              dir={isRTL ? "rtl" : "ltr"}
            />
            <button
              type='submit'
              className={`mt-2 rounded-md bg-[#2c6449] text-white font-semibold px-8 py-2 shadow hover:bg-[#205a3d] transition ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? t("sending") : t("send")}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
