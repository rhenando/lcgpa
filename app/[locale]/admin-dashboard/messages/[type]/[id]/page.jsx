"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/firebase/config";
import { doc, onSnapshot } from "firebase/firestore";
import { MessageSquare } from "lucide-react";

export default function AdminMessageThreadPage() {
  const { type, id } = useParams();
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "messages", id), (docSnap) => {
      if (docSnap.exists()) {
        setThread({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    });

    return () => unsub();
  }, [id]);

  if (loading) {
    return <p className='p-4 text-gray-500'>Loading conversation...</p>;
  }

  if (!thread) {
    return <p className='p-4 text-red-500'>Message thread not found.</p>;
  }

  return (
    <div className='p-6 max-w-4xl mx-auto'>
      <h1 className='text-xl font-bold text-[#2c6449] mb-2 flex items-center gap-2'>
        <MessageSquare className='w-5 h-5' />
        {thread.buyerName} ↔ {thread.supplierName}
      </h1>
      <p className='text-sm text-gray-500 mb-4'>Type: {type.toUpperCase()}</p>

      <div className='bg-white shadow-sm border rounded-md p-4 space-y-2'>
        {thread.messages?.length > 0 ? (
          thread.messages.map((msg, index) => {
            const name =
              msg.from === "buyer" ? thread.buyerName : thread.supplierName;
            const date =
              msg.timestamp?.seconds &&
              new Date(msg.timestamp.seconds * 1000).toLocaleString();

            return (
              <div
                key={index}
                className={`flex flex-col ${
                  msg.from === "buyer" ? "items-start" : "items-end"
                }`}
              >
                <div className='text-xs text-gray-400 mb-1'>
                  {name} • {date}
                </div>
                <div
                  className={`max-w-xs px-4 py-2 rounded-md text-sm ${
                    msg.from === "buyer"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-green-100 text-green-900"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        ) : (
          <p className='text-gray-500 text-sm'>No messages in this thread.</p>
        )}
      </div>
    </div>
  );
}
