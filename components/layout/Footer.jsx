"use client";

import Link from "next/link";
import Image from "next/image";
import { Linkedin, Twitter, Youtube } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  // NOTE: A Government Procurement Authority would have official social media accounts.
  // Replace '#' with your actual URLs.
  const socialLinks = [
    {
      href: "#",
      icon: <Twitter size={20} />,
      label: "Twitter",
    },
    {
      href: "#",
      icon: <Linkedin size={20} />,
      label: "LinkedIn",
    },
    {
      href: "#",
      icon: <Youtube size={20} />,
      label: "Youtube",
    },
  ];

  return (
    <footer className='bg-[#074d31] text-white'>
      <div className='max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        {/* Top Grid: Re-structured for government context */}
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8'>
          {/* About the Authority */}
          <div className='sm:col-span-2'>
            <Image
              src='/logo.svg' // NOTE: A white version of your logo is needed for dark backgrounds.
              alt='Local Content & Government Procurement Authority'
              width={180}
              height={40}
              className='mb-4 bg-white rounded-sm'
            />
            <p className='text-gray-300 text-sm'>
              The LCGPA is responsible for developing local content and
              improving government procurement processes to support the national
              economy.
            </p>
          </div>

          {/* Important Links */}
          <div>
            <h3 className='font-semibold mb-4 text-white uppercase tracking-wider'>
              Important Links
            </h3>
            <ul className='space-y-3 text-sm'>
              <li>
                <Link
                  href='/tenders'
                  className='text-gray-300 hover:text-white hover:underline'
                >
                  Tenders & Opportunities
                </Link>
              </li>
              <li>
                <Link
                  href='/supplier-registration'
                  className='text-gray-300 hover:text-white hover:underline'
                >
                  Supplier Registration
                </Link>
              </li>
              <li>
                <Link
                  href='/regulations'
                  className='text-gray-300 hover:text-white hover:underline'
                >
                  Laws & Regulations
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className='font-semibold mb-4 text-white uppercase tracking-wider'>
              Support
            </h3>
            <ul className='space-y-3 text-sm'>
              <li>
                <Link
                  href='/faq'
                  className='text-gray-300 hover:text-white hover:underline'
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href='/contact'
                  className='text-gray-300 hover:text-white hover:underline'
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href='/terms-of-service'
                  className='text-gray-300 hover:text-white hover:underline'
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href='/privacy-policy'
                  className='text-gray-300 hover:text-white hover:underline'
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section: Separator and social links */}
        <div className='mt-10 border-t border-white/20 pt-8 flex flex-col sm:flex-row justify-between items-center gap-6'>
          {/* Social Links */}
          <div className='flex items-center gap-4'>
            <p className='text-sm font-semibold'>Follow Us:</p>
            <div className='flex gap-3'>
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target='_blank'
                  rel='noopener noreferrer'
                  aria-label={link.label}
                  className='text-gray-300 hover:text-white transition-colors'
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Trust Logos and Copyright */}
        <div className='mt-10 border-t border-white/20 pt-8 flex flex-col md:flex-row items-center justify-between gap-8'>
          <div className='text-center text-xs text-gray-400'>
            <span>
              © {currentYear} Local Content & Government Procurement Authority.
              All rights reserved.
            </span>
          </div>

          {/* Local Government Trust Logos */}
          <div className='flex items-center gap-x-6'>
            <a
              href='https://vision2030.gov.sa'
              target='_blank'
              rel='noopener noreferrer'
            >
              <Image
                src='/vision_2030_logo.svg'
                alt='Saudi Vision 2030'
                width={180}
                height={55}
                className='object-contain'
              />
            </a>
            <a
              href='https://bc.gov.sa'
              target='_blank'
              rel='noopener noreferrer'
            >
              <Image
                src='/saudi_business_logo.png'
                alt='Saudi Business Center'
                width={100}
                height={55}
                className='object-contain'
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
