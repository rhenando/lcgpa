"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default function AdminMessagesPage() {
  const t = useTranslations("messages");
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const all = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(all);
    });

    return () => unsubscribe();
  }, []);

  const filtered = messages.filter((msg) => {
    const matchesType = activeTab === "all" || msg.type === activeTab;
    const lower = searchTerm.toLowerCase();
    const matchesSearch =
      msg.buyerName?.toLowerCase().includes(lower) ||
      msg.supplierName?.toLowerCase().includes(lower) ||
      msg.messages?.some((m) => m.content?.toLowerCase().includes(lower));
    return matchesType && matchesSearch;
  });

  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-bold text-[#2c6449]'>{t("title")}</h1>

      {/* Search */}
      <input
        type='text'
        placeholder='Search buyer, supplier, or message...'
        className='w-full max-w-md px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-[#2c6449]'
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='flex gap-2 mt-2 mb-4 flex-wrap'>
          <TabsTrigger value='all'>{t("all")}</TabsTrigger>
          <TabsTrigger value='rfq'>{t("labels.rfq")}</TabsTrigger>
          <TabsTrigger value='product'>{t("labels.product")}</TabsTrigger>
          <TabsTrigger value='cart'>{t("labels.cart")}</TabsTrigger>
          <TabsTrigger value='order'>{t("labels.order")}</TabsTrigger>
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <p className='text-gray-500'>{t("none")}</p>
      ) : (
        filtered.map((msg) => (
          <Card key={msg.id}>
            <CardContent className='p-4 flex flex-col sm:flex-row justify-between items-start gap-4'>
              <div>
                <p className='text-sm text-gray-500'>
                  {t("table.buyer")}: {msg.buyerName || t("unknownBuyer")}
                </p>
                <p className='text-sm text-gray-500'>
                  Supplier: {msg.supplierName || "Unknown Supplier"}
                </p>
                <p className='text-sm text-gray-500'>
                  Type: {t(`labels.${msg.type}`)}
                </p>
              </div>
              <Link
                href={`/admin-dashboard/messages/${msg.type}/${msg.id}`}
                className='text-[#2c6449] font-medium hover:underline'
              >
                {t("open")}
              </Link>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
