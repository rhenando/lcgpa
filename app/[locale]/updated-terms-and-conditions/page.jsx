"use client";

import React from "react";
import { FileText, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

function getLocaleFromPath(pathname) {
  const match = pathname.match(/^\/([a-zA-Z-]+)(\/|$)/);
  return match ? match[1] : "en";
}

export default function TermsAndConditions() {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);

  const handlePrint = () => window.print();

  // --- English Content (from PDF) ---
  const termsEn = (
    <article className='text-[1.07rem] leading-8 font-light'>
      <section className='mb-8'>
        <h2 className='text-lg font-bold mb-2'>Orders</h2>
        <p className='mb-3'>Dear Customer,</p>
        <p className='mb-3'>
          To organize the sale process, please read the following:
        </p>
        <ul className='list-disc list-inside mb-3 pl-4'>
          <li>
            Orders are subject to our acceptance at our discretion, and products
            in your cart are not reserved until you pay for your order.
          </li>
          <li>
            Our website may contain information regarding the availability of
            the goods, which can be used to forecast the likely availability of
            the product upon order completion. Unfortunately, we cannot
            guarantee that a product is actually available even if it is
            declared to be immediately available, as stock can change throughout
            the day in rare cases. The product may be available when the order
            is placed but may have been sold by the time the order is processed.
            We will notify you if this occurs.
          </li>
          <li>
            Your order will be confirmed by email after the payment is
            completed. However, the order is only considered confirmed when you
            receive a notification from the store confirming that the relevant
            product(s) have been dispatched.
          </li>
        </ul>
      </section>
      <section className='mb-8'>
        <h2 className='text-lg font-bold mb-2'>
          Goods, Prices, and Availability
        </h2>
        <ul className='list-disc list-inside mb-3 pl-4'>
          <li>
            We make every reasonable effort to ensure that all visual
            descriptions and displays of the goods available through us
            correspond to the actual goods. Please note that product images and
            packaging descriptions are for illustrative purposes only. There may
            be slight differences between the product image and the actual
            product sold due to computer monitor differences and lighting
            conditions.
          </li>
          <li>
            We make every reasonable effort to ensure that all prices displayed
            on our website are correct at the time of your internet connection.
            We reserve the right to change prices, and to add, change, or remove
            special offers from time to time as necessary under these terms.
          </li>
        </ul>
      </section>
      <section className='mb-8'>
        <h2 className='text-lg font-bold mb-2'>Payment</h2>
        <ul className='list-disc list-inside mb-3 pl-4'>
          <li>
            You must always pay for goods and applicable delivery charges in
            advance during the order process.
          </li>
          <li>
            By entering payment data on our website, you confirm that you are
            authorized to use the provided payment method. We reserve the right
            to refuse orders without obligation to you if we believe payments
            are not authorized, if the payment method is invalid, or if you are
            not authorized to use the relevant payment method.
          </li>
        </ul>
      </section>
      <section className='mb-8'>
        <h2 className='text-lg font-bold mb-2'>Accurate Delivery Details</h2>
        <ul className='list-disc list-inside mb-3 pl-4'>
          <li>Please check your address carefully!</li>
          <li>
            Our delivery guarantee only applies to properly directed orders. We
            cannot guarantee the package status if the delivery service has to
            redirect it. We only guarantee delivery to the address you confirmed
            during order confirmation.
          </li>
        </ul>
      </section>
      <section className='mb-8'>
        <h2 className='text-lg font-bold mb-2'>Product Return and Refund</h2>
        <p className='mb-3'>
          We aim to offer a great experience every time. Due to the perishable
          nature of our products:
        </p>
        <ul className='list-disc list-inside mb-3 pl-4'>
          <li>
            To replace or return a product, the invoice must be presented, the
            product must be in good condition, and the customer must not have
            used or benefited from it.
          </li>
        </ul>
        <h3 className='font-bold mb-1'>
          A. Cases in which a deposit is refundable:
        </h3>
        <ul className='list-disc list-inside mb-3 pl-8'>
          <li>
            If the product does not conform to the specifications agreed with
            the supplier.
          </li>
          <li>
            If the supplier fails to deliver the product on the agreed delivery
            date.
          </li>
          <li>If the supplier is out of stock.</li>
          <li>If the product is sold after receiving the deposit.</li>
        </ul>
        <h3 className='font-bold mb-1'>
          B. Cases in which the product can be returned or replaced:
        </h3>
        <ul className='list-disc list-inside mb-3 pl-8'>
          <li>If the product is damaged during delivery.</li>
          <li>If the product delivered differs from what was ordered.</li>
        </ul>
        <p className='mb-2 pl-8'>
          <b>Note:</b> The customer must notify the store within 24 hours of
          dispatch. The store is not obliged to process the return if the
          product has been used.
        </p>
        <h3 className='font-bold mb-1'>
          C. Products that may not be returned or replaced:
        </h3>
        <ul className='list-disc list-inside mb-3 pl-8'>
          <li>
            Products without manufacturer defects that have been opened or used
            by the customer.
          </li>
        </ul>
        <h3 className='font-bold mb-1'>
          D. Cases where the product or deposit may not be refunded:
        </h3>
        <ul className='list-disc list-inside mb-3 pl-8'>
          <li>
            If the product was custom-made based on the customer's request or
            specifications, except in cases of defects or specification
            violations.
          </li>
          <li>If damage results from customer mishandling.</li>
          <li>
            Products that are prone to spoilage during the order cancellation
            window.
          </li>
          <li>Products that cannot be resold for health reasons.</li>
        </ul>
      </section>
    </article>
  );

  // --- Arabic Content (localized) ---
  const termsAr = (
    <article className='text-[1.07rem] leading-8 font-light' dir='rtl'>
      <section className='mb-8'>
        <h2 className='text-lg font-bold mb-2'>الطلبات</h2>
        <p className='mb-3'>
          عزيزي العميل لتنظيم عملية البيع نأمل منك الاطلاع على التالي :
        </p>
        <ul className='list-disc list-inside mb-3 pr-4'>
          <li>
            تخضع الطلبات إلى قبولنا وفقاً لتقديرنا الخاص، ولا تُحجز المنتجات
            الموجودة في سلة التسوق الخاصة بك حتى تدفع قيمة طلبك.
          </li>
          <li>
            قد يحتوي الموقع على معلومات تتعلق بتوافر البضائع ، يمكن استخدام هذه
            المعلومات لتوقع احتمال توفر المنتج فور إتمام الطلب، لسوء الحظ لا
            يمكننا ضمان توفر منتج فعليًا وهو معلن أنه متاح على الفور، إذ يمكن أن
            يتغير المخزون على مدار اليوم في حالات نادرة، قد يكون المنتج متاحًا
            عند تقديم الطلب ولكن جرى بيعه بحلول الوقت الذي تم فيه معالجة الطلب،
            سنخطرك في حالة حدوث ذلك.
          </li>
          <li>
            سيتم تأكيد استلام طلبك عبر البريد الإلكتروني بعد اتمام عملية الدفع
            ومع ذلك، يؤكد الطلب فقط عندما تتلقى إشعارًا من المتجر يؤكد إرسال
            المنتج (المنتجات) ذات صلة.
          </li>
        </ul>
      </section>
      <section className='mb-8'>
        <h2 className='text-lg font-bold mb-2'>السلع والأسعار والتوافر</h2>
        <ul className='list-disc list-inside mb-3 pr-4'>
          <li>
            نحن نبذل كل الجهود الممكنة للتأكد من أن جميع الأوصاف والعروض البصرية
            للبضائع المتاحة من خلالنا تتوافق مع السلع الفعلية، يرجى ملاحظة أن
            صور البضائع وأوصاف العبوة أو أيهما هي لأغراض توضيحية فقط. قد يكون
            هناك اختلافات طفيفة بين صورة المنتج والمنتج الفعلي المباع بسبب
            الاختلافات في شاشات الكمبيوتر وظروف الإضاءة.
          </li>
          <li>
            نبذل كل الجهود المعقولة لضمان صحة جميع الأسعار المعروضة على موقعنا
            في وقت اتصالك بالإنترنت، نحتفظ بالحق في تغيير الأسعار وإضافة عروض
            خاصة أو تغييرها أو إزالتها من وقت لآخر وحسب الضرورة وفقًا للشروط.
          </li>
        </ul>
      </section>
      <section className='mb-8'>
        <h2 className='text-lg font-bold mb-2'>الدفع</h2>
        <ul className='list-disc list-inside mb-3 pr-4'>
          <li>
            يجب دائمًا الدفع مقابل السلع ورسوم التوصيل ذات الصلة مقدمًا أثناء
            عملية الطلب.
          </li>
          <li>
            من خلال إدخال بيانات الدفع على موقعنا، تتعهد بأنك مخول للدفع
            باستخدام هذه البيانات. نحتفظ بالحق في رفض الطلبات دون التزام اتجاهك
            عندما نعتقد أن المدفوعات غير مسموح بها أو طريقة الدفع غير صالحة أو
            إذا كنا نعتقد أنه غير مصرح لك باستخدام طريقة الدفع ذات الصلة.
          </li>
        </ul>
      </section>
      <section className='mb-8'>
        <h2 className='text-lg font-bold mb-2'>دقة التوصيل</h2>
        <ul className='list-disc list-inside mb-3 pr-4'>
          <li>
            تحقق من عناوينك بعناية! يمتد ضمان التوصيل الخاص بنا فقط إلى الطلبات
            الموجهة بشكل صحيح، لا يمكننا ضمان حالة الحزمة إذا كان على خدمة
            التوصيل إعادة توجيهها. نحن نضمن التسليم فقط إلى العنوان المقدم الذي
            تم تأكيده في إقرار الطلب.
          </li>
        </ul>
      </section>
      <section className='mb-8'>
        <h2 className='text-lg font-bold mb-2'>
          استرجاع المنتجات واسترداد الأموال
        </h2>
        <p className='mb-3'>
          نهدف إلى تقديم تجربة رائعة في كل مرة و نظرًا لطبيعة منتجاتنا القابلة
          للتلف.
        </p>
        <ul className='list-disc list-inside mb-3 pr-4'>
          <li>
            يشترط لاستبدال أو استرجاع المنتج إبراز الفاتورة وأن يكون المنتج
            بحالة سليمة وألا يكون المستهلك قد استخدم المنتج أو حصل على منفعته مع
            مراعات التالي.
          </li>
        </ul>
        <h3 className='font-bold mb-1'>أ- حالات استرجاع العربون هي :</h3>
        <ul className='list-disc list-inside mb-3 pr-8'>
          <li>عدم مطابقة السلعة للمواصفات المتفق عليها مع المزود.</li>
          <li>عدم إلتزام المزود بتاريخ تسليم السلعة كما هو محدد في العقد.</li>
          <li>نفاذ السلعة لدى المزود.</li>
          <li>نفاذ التصرف فيها بعد استلام العربون.</li>
        </ul>
        <h3 className='font-bold mb-1'>ب- حالات استرجاع أو استبدال المنتج:</h3>
        <ul className='list-disc list-inside mb-3 pr-8'>
          <li>في حال تلف المنتج أثناء التوصيل.</li>
          <li>في حال تم شحن منتج خلاف المنتج الموضح بالطلب.</li>
        </ul>
        <p className='mb-2 pr-8'>
          <b>ملاحظة:</b> يجب على المستهلك أن يقوم بتبليغ المتجر خلال 24ساعة من
          وقت الإرسال. والمتجر غير ملزم بذلك في حال قام المستهلك بالإستفادة من
          المنتج.
        </p>
        <h3 className='font-bold mb-1'>
          ت- لا يحق للمستهلك استبدال واسترجاع المنتجات التالية:
        </h3>
        <ul className='list-disc list-inside mb-3 pr-8'>
          <li>
            المنتجات التي لا يوجد بها عيب مصنعي أو أي خلل ومطابقة للشروط وتم
            فتحها واستخدامها من قبل المستهلك.
          </li>
        </ul>
        <h3 className='font-bold mb-1'>
          جـ- حالات يحق للمستهلك استرجاع المنتج أو العربون في الحالات التالية:
        </h3>
        <ul className='list-disc list-inside mb-3 pr-8'>
          <li>
            إذا كان المنتج تم تصنيعه بناءً على طلب المستهلك أو وفقًا لمواصفات
            حددها، ويستثنى من ذلك المنتجات التي بها عيب أو خالفت المواصفات
            المحددة من قبل المستهلك.
          </li>
          <li>إذا ظهر عيب في المنتج بسبب سوء حبازة المستهلك.</li>
          <li>منتجات تكون عرضة للتلف خلال مدة جواز إلغاء الطلب.</li>
          <li>المنتجات التي لا يمكن إعادة بيعها لأسباب صحية.</li>
        </ul>
      </section>
    </article>
  );

  const isRTL = locale === "ar";

  return (
    <div className='min-h-screen flex items-center justify-center bg-white print:bg-white'>
      <div className='w-full max-w-2xl mx-auto p-6 print:p-0'>
        {/* Page Header */}
        <div className='flex flex-col items-center mb-8'>
          <FileText className='w-10 h-10 mb-2 text-gray-400 print:hidden' />
          <h1 className='text-2xl font-bold mb-2 text-center tracking-tight'>
            {isRTL ? "الشروط والأحكام" : "Terms and Conditions"}
          </h1>
          <span className='text-xs text-gray-400 block text-center mb-2'>
            {isRTL ? "آخر تحديث: يونيو 2025" : "Last updated: June 2025"}
          </span>
          <div className='flex gap-2 print:hidden'>
            <Button
              variant='ghost'
              className='flex items-center gap-1'
              onClick={handlePrint}
              size='sm'
            >
              <Printer className='w-4 h-4' />
              {isRTL ? "طباعة" : "Print"}
            </Button>
            <Button
              variant='secondary'
              className='flex items-center gap-1'
              size='sm'
              disabled
            >
              <Download className='w-4 h-4' />
              {isRTL ? "تحميل PDF" : "Download PDF"}
            </Button>
          </div>
        </div>
        {/* Terms Body */}
        <div dir={isRTL ? "rtl" : "ltr"} className={isRTL ? "text-right" : ""}>
          {isRTL ? termsAr : termsEn}
        </div>
      </div>
    </div>
  );
}
