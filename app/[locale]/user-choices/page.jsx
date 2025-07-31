"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Briefcase, Building2 } from "lucide-react"; // Icons for roles

// The page component uses Suspense to handle search parameters safely.
export default function UserChoicesPage() {
  return (
    <Suspense fallback={<div className='min-h-screen' />}>
      <UserChoicesInner />
    </Suspense>
  );
}

// The inner component contains the main logic.
function UserChoicesInner() {
  const router = useRouter();
  const params = useSearchParams();
  const t = useTranslations("UserChoice");

  const [loadingRole, setLoadingRole] = useState(null);

  // Capture all potential authentication parameters for a robust handoff.
  const uid = params.get("uid");
  const email = params.get("email");
  const phone = params.get("phone");

  const handleRoleSelection = (role) => {
    setLoadingRole(role);

    const queryParams = new URLSearchParams();
    if (uid) queryParams.set("uid", uid);
    if (email) queryParams.set("email", email);
    if (phone) queryParams.set("phone", phone);

    let targetPath = "";
    if (role === "supplier") {
      targetPath = `/supplier-onboarding?${queryParams.toString()}`;
    } else if (role === "buyer") {
      // Reverted to "buyer" and "/buyer-onboarding"
      targetPath = `/buyer-onboarding?${queryParams.toString()}`;
    }

    router.push(targetPath);
  };

  return (
    <div className='lg:grid lg:grid-cols-2 min-h-[80vh] items-center'>
      {/* Left Column: Role Selection Card */}
      <div className='bg-gray-50 px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center'>
        <Card className='w-full max-w-lg bg-white shadow-lg rounded-lg'>
          <CardHeader className='text-center'>
            <CardTitle className='text-xl sm:text-2xl font-extrabold text-gray-900'>
              {t("title")}
            </CardTitle>
            <CardDescription className='pt-2'>
              {t("description")}
            </CardDescription>
          </CardHeader>
          <CardContent className='px-6 py-8 pt-0 space-y-6'>
            <div className='space-y-4'>
              <Button
                variant='outline'
                onClick={() => handleRoleSelection("supplier")}
                disabled={loadingRole !== null}
                className='w-full h-auto p-6 flex'
              >
                {/* Using a robust Grid layout to prevent text overflow. */}
                <div className='grid grid-cols-[auto_1fr] gap-4 items-center w-full'>
                  <Briefcase className='h-8 w-8 text-primary' />
                  <div className='text-left'>
                    <p className='font-bold text-base'>
                      {t("roles.supplier.title")}
                    </p>
                    <p className='text-xs text-gray-500 font-normal'>
                      {t("roles.supplier.description")}
                    </p>
                  </div>
                </div>
              </Button>

              <Button
                variant='outline'
                onClick={() => handleRoleSelection("buyer")}
                disabled={loadingRole !== null}
                className='w-full h-auto p-6 flex'
              >
                {/* Using a robust Grid layout to prevent text overflow. */}
                <div className='grid grid-cols-[auto_1fr] gap-4 items-center w-full'>
                  <Building2 className='h-8 w-8 text-primary' />
                  <div className='text-left'>
                    <p className='font-bold text-base'>
                      {t("roles.buyer.title")}
                    </p>
                    <p className='text-xs text-gray-500 font-normal'>
                      {t("roles.buyer.description")}
                    </p>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Branding Panel */}
      <div className='hidden lg:flex h-full bg-gradient-to-br from-[#004d40] to-[#00796b] text-white flex-col items-center justify-center p-10 text-center'>
        <img
          src='/logo.svg' // Recommended: Use a white logo for dark backgrounds
          alt='Government Procurement Authority Logo'
          className='w-100 h-auto'
        />
        <h1 className='text-4xl font-bold mb-4'>{t("welcome.title")}</h1>
        <p className='text-lg max-w-sm opacity-80'>{t("welcome.subtitle")}</p>
      </div>
    </div>
  );
}
