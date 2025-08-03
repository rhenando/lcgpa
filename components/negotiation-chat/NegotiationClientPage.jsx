"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import Image from "next/image"; // Import the Image component
import PropTypes from "prop-types";

export function NegotiationClientPage({ product, factory }) {
  const t = useTranslations("NegotiationChat");

  const [negotiatedProduct, setNegotiatedProduct] = useState(product);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Mock response logic remains the same
  const mockSupplierResponse = (buyerMessage, updatedPrice) => {
    setTimeout(() => {
      if (updatedPrice) {
        setMessages((prev) => [
          ...prev,
          {
            author: "supplier",
            text: `I've received your offer of ${t("price", {
              price: updatedPrice,
            })}. Let me review it.`,
          },
        ]);
        setTimeout(() => {
          const counterPrice = updatedPrice * 1.05;
          setNegotiatedProduct((prev) => ({
            ...prev,
            priceCeiling: counterPrice,
          }));
          setMessages((prev) => [
            ...prev,
            {
              author: "supplier",
              text: `The best I can do is ${t("price", {
                price: counterPrice,
              })}. Is that acceptable?`,
            },
          ]);
        }, 2000);
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          author: "supplier",
          text: `Thanks for your message! We're reviewing your request regarding "${buyerMessage}".`,
        },
      ]);
    }, 1200);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleProductChange = (field, value) => {
    const updatedDetails = { ...negotiatedProduct, [field]: value };
    setNegotiatedProduct(updatedDetails);
    mockSupplierResponse("price update", value);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (currentMessage.trim() === "") return;
    setMessages((prev) => [...prev, { author: "buyer", text: currentMessage }]);
    mockSupplierResponse(currentMessage);
    setCurrentMessage("");
  };

  return (
    <div className='container mx-auto py-8 h-[calc(100vh-100px)] flex flex-col'>
      <header className='mb-6'>
        <h1 className='text-3xl font-bold'>
          {t("title", { factory: factory.name })}
        </h1>
        <p className='text-muted-foreground'>{t("description")}</p>
      </header>

      <div className='flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden'>
        {/* --- UPDATED LEFT PANEL --- */}
        <Card className='md:col-span-1 overflow-y-auto'>
          <CardHeader>
            <CardTitle>{t("productDetails")}</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {/* Product Image */}
            <div className='relative w-full h-40 overflow-hidden rounded-md border'>
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className='object-cover'
                sizes='(max-width: 768px) 100vw, 33vw'
              />
            </div>

            {/* Product Name */}
            <h3 className='font-bold text-xl'>{product.name}</h3>

            {/* Negotiable Price Section */}
            <div className='space-y-2'>
              <Label htmlFor='price'>{t("negotiablePrice")}</Label>
              <Input
                id='price'
                type='number'
                value={negotiatedProduct.priceCeiling}
                onChange={(e) =>
                  handleProductChange(
                    "priceCeiling",
                    parseFloat(e.target.value)
                  )
                }
                className='text-brand-green font-bold text-lg'
              />
            </div>

            {/* Static Details Section */}
            <div className='space-y-2 text-sm border-t pt-4'>
              <div className='flex justify-between items-center'>
                <span className='font-medium text-muted-foreground'>
                  {t("productCode")}
                </span>
                <span className='font-mono bg-muted px-2 py-1 rounded'>
                  {product.productCode}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='font-medium text-muted-foreground'>
                  {t("sector")}
                </span>
                <span className='text-right'>{product.sectorName}</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='font-medium text-muted-foreground'>
                  {t("category")}
                </span>
                <span className='text-right'>{product.category}</span>
              </div>
            </div>

            {/* Description Section */}
            <div className='border-t pt-4'>
              <h4 className='font-semibold mb-2'>{t("descriptionTitle")}</h4>
              <p className='text-sm text-muted-foreground leading-relaxed'>
                {product.definition}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Right Panel (Chat) */}
        <div className='md:col-span-2 flex flex-col h-full bg-gray-50/50 rounded-lg border'>
          {/* ... chat logic remains the same ... */}
          <div className='flex-1 p-4 space-y-4 overflow-y-auto'>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.author === "buyer" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                    msg.author === "buyer"
                      ? "bg-brand-green text-white"
                      : "bg-white border"
                  }`}
                >
                  <p className='text-sm'>{msg.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className='p-4 border-t bg-white'>
            <div className='relative'>
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder={t("placeholder")}
                className='pr-12'
              />
              <Button
                type='submit'
                size='icon'
                variant='ghost'
                className='absolute top-1/2 right-1 -translate-y-1/2 text-gray-500 hover:text-brand-green'
              >
                <Send className='w-5 h-5' />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

NegotiationClientPage.propTypes = {
  product: PropTypes.object.isRequired,
  factory: PropTypes.object.isRequired,
};
