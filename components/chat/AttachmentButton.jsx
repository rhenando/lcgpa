"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, FileImage, Camera, FileText, User } from "lucide-react";
import { useTranslations } from "next-intl";

export default function AttachmentButton({
  onSelectPhoto,
  onSelectCamera,
  onSelectDocument,
  onSelectContact,
  disabled,
}) {
  const t = useTranslations("ChatMessages");
  const [showMenu, setShowMenu] = useState(false);
  const fileInputPhotoRef = useRef();
  const fileInputDocRef = useRef();

  function handleMenuBlur(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) setShowMenu(false);
  }

  return (
    <div className='relative' tabIndex={-1} onBlur={handleMenuBlur}>
      <Button
        type='button'
        variant='ghost'
        size='icon'
        className='text-gray-500 hover:text-gray-800'
        tabIndex={-1}
        aria-label={t("attachPhoto")}
        onClick={() => setShowMenu((v) => !v)}
        disabled={disabled}
      >
        <Paperclip size={20} />
      </Button>

      {showMenu && (
        <div
          className='absolute bottom-12 left-0 z-30 bg-white border rounded-xl shadow-lg min-w-[180px] py-2 flex flex-col gap-1'
          tabIndex={0}
        >
          <button
            type='button'
            className='flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-colors text-left'
            onClick={() => {
              setShowMenu(false);
              fileInputPhotoRef.current?.click();
            }}
            tabIndex={0}
          >
            <FileImage size={18} className='text-primary' />
            {t("attachPhoto")}
          </button>
          <button
            type='button'
            className='flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-colors text-left'
            onClick={() => {
              setShowMenu(false);
              fileInputDocRef.current?.click();
            }}
            tabIndex={0}
          >
            <FileText size={18} className='text-primary' />
            {t("document")}
          </button>
          <button
            type='button'
            className='flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-colors text-left'
            onClick={() => {
              setShowMenu(false);
              onSelectContact && onSelectContact();
            }}
            tabIndex={0}
          >
            <User size={18} className='text-primary' />
            {t("contact")}
          </button>
          <button
            type='button'
            className='flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-colors text-left'
            onClick={() => {
              setShowMenu(false);
              onSelectCamera && onSelectCamera();
            }}
            tabIndex={0}
          >
            <Camera size={18} className='text-primary' />
            {t("camera")}
          </button>
        </div>
      )}

      <input
        type='file'
        ref={fileInputPhotoRef}
        style={{ display: "none" }}
        accept='image/*,video/*'
        onChange={(e) => {
          if (e.target.files?.[0]) onSelectPhoto(e.target.files[0]);
          e.target.value = "";
        }}
      />
      <input
        type='file'
        ref={fileInputDocRef}
        style={{ display: "none" }}
        accept='.pdf,.doc,.docx,.xlsx,.xls,.txt,application/msword,application/pdf'
        onChange={(e) => {
          if (e.target.files?.[0]) onSelectDocument(e.target.files[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
