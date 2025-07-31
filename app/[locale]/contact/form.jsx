"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import { Phone, Mail, MapPin, Clock } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  const router = useRouter();
  const t = useTranslations("Contact");
  const [status, setStatus] = useState("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    subject: "",
    tenderNumber: "", // Changed from orderNumber
    message: "",
    honeypot: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelect = (value) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.honeypot) return; // Simple spam trap

    // Basic validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.category ||
      !formData.subject ||
      !formData.message
    ) {
      toast.error(t("toast.error.allFields"));
      return;
    }

    setStatus("submitting");

    try {
      await addDoc(collection(db, "contactMessages"), {
        name: formData.name,
        email: formData.email,
        category: formData.category,
        subject: formData.subject,
        tenderNumber: formData.tenderNumber || null, // Updated field
        message: formData.message,
        status: "new",
        createdAt: serverTimestamp(),
      });

      toast.success(t("toast.success"));
      setFormData({
        name: "",
        email: "",
        category: "",
        subject: "",
        tenderNumber: "",
        message: "",
        honeypot: "",
      });
      setStatus("submitted");

      // Optional: Redirect to a thank-you page after a delay
      // setTimeout(() => router.push("/thank-you"), 2000);
    } catch (err) {
      console.error("Contact form error:", err);
      toast.error(t("toast.error.general"));
      setStatus("error");
    }
  };

  const inquiryCategories = [
    { value: "general", label: t("form.category.options.general") },
    { value: "tender_inquiry", label: t("form.category.options.tender") },
    {
      value: "registration_support",
      label: t("form.category.options.registration"),
    },
    { value: "technical_issue", label: t("form.category.options.technical") },
    { value: "feedback", label: t("form.category.options.feedback") },
  ];

  return (
    <section className='px-6 py-16 max-w-6xl mx-auto'>
      <h1 className='text-4xl font-bold text-center mb-6'>{t("title")}</h1>
      <p className='text-muted-foreground text-center mb-12 max-w-3xl mx-auto'>
        {t("description")}
      </p>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
        {/* Left Column: Contact Details & FAQs */}
        <div className='space-y-8'>
          <div>
            <h2 className='text-2xl font-semibold mb-4'>
              {t("details.title")}
            </h2>
            <ul className='space-y-3 text-gray-700'>
              <li className='flex items-center space-x-3'>
                <Phone className='w-5 h-5 text-primary' />
                <span>{t("details.phoneLabel")}:</span>
                <a
                  href='tel:+966920000000'
                  className='text-primary hover:underline'
                  dir='ltr'
                >
                  {t("details.phone")}
                </a>
              </li>
              <li className='flex items-center space-x-3'>
                <Mail className='w-5 h-5 text-primary' />
                <span>{t("details.emailLabel")}:</span>
                <a
                  href={`mailto:${t("details.email")}`}
                  className='text-primary hover:underline'
                >
                  {t("details.email")}
                </a>
              </li>
              <li className='flex items-center space-x-3'>
                <MapPin className='w-5 h-5 text-primary' />
                <span>{t("details.address")}</span>
              </li>
              <li className='flex items-center space-x-3'>
                <Clock className='w-5 h-5 text-primary' />
                <span>{t("details.hours")}</span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className='text-2xl font-semibold mb-4'>{t("faq.title")}</h2>
            <ul className='list-disc list-inside text-gray-700 space-y-2'>
              <li>
                <Link
                  href='/faq#supplier-registration'
                  className='text-primary hover:underline'
                >
                  {t("faq.registration")}
                </Link>
              </li>
              <li>
                <Link
                  href='/faq#tendering-process'
                  className='text-primary hover:underline'
                >
                  {t("faq.tendering")}
                </Link>
              </li>
              <li>
                <Link
                  href='/faq#technical-support'
                  className='text-primary hover:underline'
                >
                  {t("faq.technical")}
                </Link>
              </li>
              <li>
                <Link
                  href='/faq'
                  className='text-primary hover:underline font-semibold'
                >
                  {t("faq.viewAll")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <form
          onSubmit={handleSubmit}
          className='space-y-6 bg-white p-8 rounded-lg shadow-md'
          aria-label='Contact form'
        >
          {/* Honeypot field for spam prevention */}
          <input
            type='text'
            name='honeypot'
            className='hidden'
            value={formData.honeypot}
            onChange={handleChange}
            autoComplete='off'
          />

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
            <div className='sm:col-span-1'>
              <Label htmlFor='name'>{t("form.name.label")}</Label>
              <Input
                id='name'
                name='name'
                type='text'
                required
                value={formData.name}
                onChange={handleChange}
                placeholder={t("form.name.placeholder")}
                className='mt-1'
              />
            </div>
            <div className='sm:col-span-1'>
              <Label htmlFor='email'>{t("form.email.label")}</Label>
              <Input
                id='email'
                name='email'
                type='email'
                required
                value={formData.email}
                onChange={handleChange}
                placeholder={t("form.email.placeholder")}
                className='mt-1'
              />
            </div>
          </div>

          <div>
            <Label htmlFor='category'>{t("form.category.label")}</Label>
            <Select
              onValueChange={handleSelect}
              value={formData.category}
              name='category'
            >
              <SelectTrigger id='category' className='mt-1 w-full'>
                <SelectValue placeholder={t("form.category.placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {inquiryCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
            <div>
              <Label htmlFor='subject'>{t("form.subject.label")}</Label>
              <Input
                id='subject'
                name='subject'
                type='text'
                required
                value={formData.subject}
                onChange={handleChange}
                placeholder={t("form.subject.placeholder")}
                className='mt-1'
              />
            </div>
            <div>
              <Label htmlFor='tenderNumber'>
                {t("form.tenderNumber.label")}
              </Label>
              <Input
                id='tenderNumber'
                name='tenderNumber'
                type='text'
                value={formData.tenderNumber}
                onChange={handleChange}
                placeholder={t("form.tenderNumber.placeholder")}
                className='mt-1'
              />
            </div>
          </div>

          <div>
            <Label htmlFor='message'>{t("form.message.label")}</Label>
            <Textarea
              id='message'
              name='message'
              rows={5}
              required
              value={formData.message}
              onChange={handleChange}
              placeholder={t("form.message.placeholder")}
              className='mt-1'
            />
          </div>

          <Button
            type='submit'
            disabled={status === "submitting"}
            className='w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition'
          >
            {status === "submitting"
              ? t("form.button.submitting")
              : t("form.button.submit")}
          </Button>
        </form>
      </div>
    </section>
  );
}
