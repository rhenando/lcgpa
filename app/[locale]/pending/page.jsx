"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PendingPage() {
  const router = useRouter();
  const t = useTranslations("pending");

  return (
    <div className='min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-8'>
      <Card className='w-full max-w-md shadow-md'>
        <CardHeader>
          <CardTitle className='text-center text-lg sm:text-xl'>
            {t("title")}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4 text-center'>
          <p className='text-sm sm:text-base text-gray-700'>{t("message")}</p>
          <Button
            variant='outline'
            onClick={() => router.push("/")}
            className='w-full'
          >
            {t("button")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
