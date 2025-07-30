"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { db } from "@/firebase/config";
import {
  collection,
  query,
  where,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  arrayUnion,
} from "firebase/firestore";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations, useLocale } from "next-intl";

const CHAT_TYPE_KEYS = [
  { value: "All", label: "all_types" },
  { value: "RFQ Inquiry", label: "rfq_inquiry" },
  { value: "Product Inquiry", label: "product_inquiry" },
  { value: "Cart Inquiry", label: "cart_inquiry" },
  { value: "Order Inquiry", label: "order_inquiry" },
];

const TYPE_KEY_MAP = {
  "RFQ Inquiry": "rfq_inquiry",
  "Product Inquiry": "product_inquiry",
  "Cart Inquiry": "cart_inquiry",
  "Order Inquiry": "order_inquiry",
};

async function getProductName(productId, locale) {
  if (!productId) return "";
  try {
    const productSnap = await getDoc(doc(db, "products", productId));
    if (!productSnap.exists()) return "";
    const p = productSnap.data();
    if (typeof p.productName === "object") {
      return (
        p.productName[locale] ||
        p.productName.en ||
        Object.values(p.productName)[0] ||
        ""
      );
    }
    return p.productName || "";
  } catch {
    return "";
  }
}

export default function UserMessages() {
  const currentUser = useSelector((state) => state.auth.user);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [deletingChatId, setDeletingChatId] = useState(null);

  const t = useTranslations("buyer-messages");
  const locale = useLocale();
  const isRTL = locale === "ar";

  useEffect(() => {
    if (!currentUser) return;
    let unsubscribes = [];

    (async () => {
      setUserRole(currentUser.role);

      const sources = [
        {
          col: "rfqChats",
          label: "RFQ Inquiry",
          key: currentUser.role === "supplier" ? "supplierId" : "buyerId",
          path: (id) => `/chat/rfq/${id}`,
        },
        {
          col: "productChats",
          label: "Product Inquiry",
          key: currentUser.role === "supplier" ? "supplierId" : "buyerId",
          path: (id) => `/chat/product/${id}`,
        },
        {
          col: "cartChats",
          label: "Cart Inquiry",
          key: currentUser.role === "supplier" ? "supplierId" : "buyerId",
          path: (id) => `/chat/cart/${id}`,
        },
        {
          col: "orderChats",
          label: "Order Inquiry",
          key: currentUser.role === "supplier" ? "supplierId" : "buyerId",
          path: async (id, data) => {
            const bill = data.billNumber;
            let extra = {};
            if (bill) {
              const oSnap = await getDoc(doc(db, "orders", bill));
              if (oSnap.exists()) {
                const od = oSnap.data();
                extra.totalAmount = od.totalAmount;
                extra.orderStatus = od.orderStatus;
              }
            }
            return (
              `/order-chat/${id}` +
              (bill ? `?data=${encodeURIComponent(JSON.stringify(extra))}` : "")
            );
          },
        },
      ];

      sources.forEach((src) => {
        const q = query(
          collection(db, src.col),
          where(src.key, "==", currentUser.uid)
        );

        const unsub = onSnapshot(q, async (snap) => {
          const updated = await Promise.all(
            snap.docs.map(async (d) => {
              const data = d.data();
              const otherId =
                currentUser.role === "supplier"
                  ? data.buyerId
                  : data.supplierId;

              let otherName = t("unknown");
              if (otherId) {
                const uSnap = await getDoc(doc(db, "users", otherId));
                if (uSnap.exists()) {
                  const udata = uSnap.data();
                  otherName =
                    (isRTL
                      ? udata.companyNameAr || udata.companyDescriptionAr
                      : udata.companyName || udata.companyDescriptionEn) ||
                    udata.authPersonName ||
                    udata.authPersonMobile ||
                    t("unknown");
                }
              }

              let productName = "";
              if (src.col === "rfqChats") {
                productName = data.productName || "";
              } else {
                const prodId =
                  data.productId || data.productID || data.itemId || "";
                if (prodId) {
                  productName = await getProductName(prodId, locale);
                }
              }

              const path =
                typeof src.path === "function"
                  ? await src.path(d.id, data)
                  : src.path;

              const getTimestamp = () => {
                const val =
                  data.lastActivity ||
                  data.lastUpdated ||
                  data.createdAt ||
                  null;
                if (!val) return new Date(0);
                if (typeof val.toDate === "function") return val.toDate();
                if (val instanceof Date) return val;
                return new Date(val);
              };

              return {
                id: d.id,
                name: otherName,
                productName,
                concernType: src.label,
                chatPath: path,
                lastUpdated: getTimestamp(),
                unread: !(data.readBy || []).includes(currentUser.uid),
                collectionName: src.col,
              };
            })
          );

          setChats((prev) => {
            const filtered = prev.filter((c) => c.concernType !== src.label);
            return [...filtered, ...updated].sort(
              (a, b) => b.lastUpdated - a.lastUpdated
            );
          });
        });

        unsubscribes.push(unsub);
      });

      setLoading(false);
      return () => unsubscribes.forEach((u) => u());
    })();
  }, [currentUser, locale, t]);

  const handleMarkAsRead = async (chatId, col) => {
    await updateDoc(doc(db, col, chatId), {
      readBy: arrayUnion(currentUser.uid),
    });
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, unread: false } : c))
    );
  };

  const handleDeleteChat = async (chatId, col) => {
    setDeletingChatId(chatId);
    try {
      await deleteDoc(doc(db, col, chatId));
      setChats((prev) => prev.filter((c) => c.id !== chatId));
    } catch (err) {
      alert(t("delete_failed") + ": " + err.message);
    }
    setDeletingChatId(null);
  };

  const filtered = chats.filter((c) => {
    const matchesName = c.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType =
      selectedType === "All" || c.concernType === selectedType;
    return matchesName && matchesType;
  });

  if (loading || !userRole) {
    return (
      <div
        className='max-w-6xl mx-auto p-4 space-y-4'
        dir={isRTL ? "rtl" : "ltr"}
      >
        <p className='text-center py-8 text-lg'>{t("loading")}</p>
      </div>
    );
  }

  return (
    <div
      className='max-w-6xl mx-auto p-4 space-y-4'
      dir={isRTL ? "rtl" : "ltr"}
    >
      <h1
        className='text-2xl font-semibold'
        style={{ textAlign: isRTL ? "right" : "left" }}
      >
        {t("messages")}
      </h1>
      <div className='flex flex-col sm:flex-row gap-3'>
        <Input
          placeholder={t("search_placeholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='flex-1'
          dir={isRTL ? "rtl" : "ltr"}
        />
        <Select
          value={selectedType}
          onValueChange={setSelectedType}
          className='w-full sm:w-48'
        >
          <SelectTrigger>
            <SelectValue placeholder={t("all_types")} />
          </SelectTrigger>
          <SelectContent>
            {CHAT_TYPE_KEYS.map((ct) => (
              <SelectItem key={ct.value} value={ct.value}>
                {t(ct.label)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop Table */}
      <div className='hidden md:block border rounded'>
        <ScrollArea>
          <div style={{ direction: isRTL ? "rtl" : "ltr" }}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={isRTL ? "text-end" : "text-start"}>
                    {t("name")}
                  </TableHead>
                  <TableHead className={isRTL ? "text-end" : "text-start"}>
                    {t("product")}
                  </TableHead>
                  <TableHead className={isRTL ? "text-end" : "text-start"}>
                    {t("concern_type")}
                  </TableHead>
                  <TableHead className={isRTL ? "text-end" : "text-start"}>
                    {t("last_updated")}
                  </TableHead>
                  <TableHead className={isRTL ? "text-end" : "text-start"}>
                    {t("actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow
                    key={c.id}
                    className={c.unread ? "bg-yellow-50" : "bg-white"}
                  >
                    <TableCell className={isRTL ? "text-end" : "text-start"}>
                      {c.name}
                    </TableCell>
                    <TableCell className={isRTL ? "text-end" : "text-start"}>
                      {c.productName ? (
                        c.productName
                      ) : (
                        <span className='italic text-gray-400'>
                          {t("product_card.unnamed_product")}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className={isRTL ? "text-end" : "text-start"}>
                      <Badge variant='outline'>
                        {t(TYPE_KEY_MAP[c.concernType] || c.concernType)}
                      </Badge>
                    </TableCell>
                    <TableCell className={isRTL ? "text-end" : "text-start"}>
                      {c.lastUpdated.getTime() === 0
                        ? t("no_activity")
                        : c.lastUpdated.toLocaleString(locale)}
                    </TableCell>
                    <TableCell className={isRTL ? "text-end" : "text-start"}>
                      <div
                        className={`flex flex-wrap gap-2 ${
                          isRTL ? "justify-end" : ""
                        }`}
                      >
                        <Link href={c.chatPath}>
                          <Button size='sm'>{t("open")}</Button>
                        </Link>
                        {c.unread && (
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() =>
                              handleMarkAsRead(c.id, c.collectionName)
                            }
                          >
                            {t("mark_read")}
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size='sm'
                              variant='destructive'
                              disabled={deletingChatId === c.id}
                            >
                              {t("delete")}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {t("delete_confirm_title")}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {t("delete_confirm_desc")}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>
                                {t("cancel")}
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleDeleteChat(c.id, c.collectionName)
                                }
                              >
                                {t("yes_delete")}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </div>

      {/* Mobile Cards */}
      <div className='space-y-3 md:hidden'>
        {filtered.map((c) => (
          <Card
            key={c.id}
            className={
              c.unread
                ? isRTL
                  ? "bg-yellow-50 text-end"
                  : "bg-yellow-50"
                : isRTL
                ? "bg-white text-end"
                : "bg-white"
            }
          >
            <CardContent
              className={`pt-4 pb-2 px-4 ${isRTL ? "text-end" : ""}`}
            >
              <div
                className={`flex justify-between items-center mb-2 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <h2
                  className={`font-medium text-base ${
                    isRTL ? "text-end" : "text-start"
                  }`}
                >
                  {c.name}
                </h2>
                <Badge variant='outline'>
                  {t(TYPE_KEY_MAP[c.concernType] || c.concernType)}
                </Badge>
              </div>
              {c.productName && (
                <div
                  className={`mb-1 text-sm text-gray-800 ${
                    isRTL ? "text-end" : "text-start"
                  }`}
                >
                  <span className='font-semibold'>{t("product")}: </span>
                  {c.productName}
                </div>
              )}
              {!c.productName && (
                <div
                  className={`mb-1 text-sm italic text-gray-400 ${
                    isRTL ? "text-end" : "text-start"
                  }`}
                >
                  {t("product_card.unnamed_product")}
                </div>
              )}
              <p
                className={`text-sm text-gray-500 ${
                  isRTL ? "text-end" : "text-start"
                }`}
              >
                {c.lastUpdated.getTime() === 0
                  ? t("no_activity")
                  : c.lastUpdated.toLocaleString(locale)}
              </p>
              <div
                className={`mt-2 flex gap-2 flex-wrap ${
                  isRTL ? "justify-end" : ""
                }`}
              >
                <Link href={c.chatPath}>
                  <Button size='sm' className='flex-1'>
                    {t("open")}
                  </Button>
                </Link>
                {c.unread && (
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => handleMarkAsRead(c.id, c.collectionName)}
                    className='flex-1'
                  >
                    {t("mark_read")}
                  </Button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size='sm'
                      variant='destructive'
                      className='flex-1'
                      disabled={deletingChatId === c.id}
                    >
                      {t("delete")}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {t("delete_confirm_title")}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {t("delete_confirm_desc")}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteChat(c.id, c.collectionName)}
                      >
                        {t("yes_delete")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && (
          <p className='text-center py-8 text-gray-500'>{t("no_messages")}</p>
        )}
      </div>
    </div>
  );
}
