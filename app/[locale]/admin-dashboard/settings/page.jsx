"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Globe, Bell, Construction, FileText } from "lucide-react";

// This is the new component for your settings page.
// You would typically place this file at a path like `app/[locale]/admin-dashboard/settings/page.js`
export default function AdminSettingsPage() {
  // --- STATE MANAGEMENT ---
  // In a real application, you would fetch these initial values from your database (e.g., Firestore).

  // General Settings
  const [siteName, setSiteName] = useState("Marsos");
  const [supportEmail, setSupportEmail] = useState("support@marsos.sa");
  const [defaultCurrency, setDefaultCurrency] = useState("SAR");

  // Notification Settings
  const [orderConfirmationSms, setOrderConfirmationSms] = useState(true);
  const [newOrderAdminEmail, setNewOrderAdminEmail] = useState(true);

  // Maintenance Mode
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Site Content States
  const [privacyPolicy, setPrivacyPolicy] = useState(
    "Your privacy policy text goes here..."
  );
  const [termsAndConditions, setTermsAndConditions] = useState(
    "Your terms and conditions text goes here..."
  );
  const [announcementBanner, setAnnouncementBanner] = useState(
    "🎉 Special event this weekend! Free shipping on all orders."
  );
  const [showAnnouncementBanner, setShowAnnouncementBanner] = useState(true);

  // --- HANDLER FUNCTIONS ---

  /**
   * Handles saving all the settings.
   * In a real app, this function would send the updated data to your backend API
   * which would then save it to the database.
   */
  const handleSaveChanges = () => {
    const allSettings = {
      general: { siteName, supportEmail, defaultCurrency },
      notifications: { orderConfirmationSms, newOrderAdminEmail },
      maintenance: { maintenanceMode },
      siteContent: {
        privacyPolicy,
        termsAndConditions,
        announcementBanner,
        showAnnouncementBanner,
      },
    };

    // For demonstration, we'll just log the settings to the console.
    console.log("Saving settings:", allSettings);
    // Here you would typically show a success toast message.
    alert("Settings saved successfully! (Check console for data)");
  };

  return (
    <div className='space-y-8'>
      {/* Page Header */}
      <div className='flex items-center justify-between'>
        <div className='space-y-1'>
          <h1 className='text-2xl font-bold'>Settings</h1>
          <p className='text-gray-500'>
            Manage your store's configuration and integrations.
          </p>
        </div>
        <Button onClick={handleSaveChanges}>Save Changes</Button>
      </div>

      {/* Settings Cards */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* General Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Globe className='h-5 w-5' />
              General Settings
            </CardTitle>
            <CardDescription>
              Basic information about your store.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='siteName'>Site Name</Label>
              <Input
                id='siteName'
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder='Your Store Name'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='supportEmail'>Support Email</Label>
              <Input
                id='supportEmail'
                type='email'
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                placeholder='support@example.com'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='defaultCurrency'>Default Currency</Label>
              <Input
                id='defaultCurrency'
                value={defaultCurrency}
                onChange={(e) => setDefaultCurrency(e.target.value)}
                placeholder='e.g., SAR, USD'
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Bell className='h-5 w-5' />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Control when and how notifications are sent.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between p-4 border rounded-lg'>
              <div>
                <Label htmlFor='sms-notifications' className='font-medium'>
                  Order Confirmation SMS
                </Label>
                <p className='text-xs text-gray-500'>
                  Send WhatsApp/SMS to customers after a successful order.
                </p>
              </div>
              <Switch
                id='sms-notifications'
                checked={orderConfirmationSms}
                onCheckedChange={setOrderConfirmationSms}
              />
            </div>
            <div className='flex items-center justify-between p-4 border rounded-lg'>
              <div>
                <Label htmlFor='admin-notifications' className='font-medium'>
                  New Order Admin Email
                </Label>
                <p className='text-xs text-gray-500'>
                  Send an email to admins when a new order is placed.
                </p>
              </div>
              <Switch
                id='admin-notifications'
                checked={newOrderAdminEmail}
                onCheckedChange={setNewOrderAdminEmail}
              />
            </div>
          </CardContent>
        </Card>

        {/* Site Content & Announcements Card */}
        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <FileText className='h-5 w-5' />
              Site Content & Announcements
            </CardTitle>
            <CardDescription>
              Manage legal documents and site-wide banners.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Announcement Banner */}
            <div className='space-y-4 p-4 border rounded-lg bg-blue-50 border-blue-200'>
              <div className='flex items-center justify-between'>
                <div>
                  <Label
                    htmlFor='show-announcement'
                    className='font-medium text-blue-800'
                  >
                    Show Announcement Banner
                  </Label>
                  <p className='text-xs text-blue-600'>
                    Display a banner at the top of all pages.
                  </p>
                </div>
                <Switch
                  id='show-announcement'
                  checked={showAnnouncementBanner}
                  onCheckedChange={setShowAnnouncementBanner}
                />
              </div>
              {showAnnouncementBanner && (
                <div className='space-y-2'>
                  <Label htmlFor='announcementBanner'>Banner Text</Label>
                  <Input
                    id='announcementBanner'
                    value={announcementBanner}
                    onChange={(e) => setAnnouncementBanner(e.target.value)}
                    placeholder='Special discounts this week!'
                  />
                </div>
              )}
            </div>

            {/* Legal Documents */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label htmlFor='termsAndConditions'>Terms and Conditions</Label>
                <Textarea
                  id='termsAndConditions'
                  value={termsAndConditions}
                  onChange={(e) => setTermsAndConditions(e.target.value)}
                  placeholder='Enter your terms and conditions...'
                  className='h-48'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='privacyPolicy'>Privacy Policy</Label>
                <Textarea
                  id='privacyPolicy'
                  value={privacyPolicy}
                  onChange={(e) => setPrivacyPolicy(e.target.value)}
                  placeholder='Enter your privacy policy...'
                  className='h-48'
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Mode Card */}
        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Construction className='h-5 w-5' />
              Maintenance Mode
            </CardTitle>
            <CardDescription>
              Temporarily disable public access to your store.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-between p-4 border rounded-lg bg-red-50 border-red-200'>
              <div>
                <Label
                  htmlFor='maintenance-mode'
                  className='font-medium text-red-800'
                >
                  Enable Maintenance Mode
                </Label>
                <p className='text-xs text-red-600'>
                  While enabled, only logged-in admins can access the site.
                </p>
              </div>
              <Switch
                id='maintenance-mode'
                checked={maintenanceMode}
                onCheckedChange={setMaintenanceMode}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
