"use client";

import { useEffect, useState, useRef } from "react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  getDoc,
  doc,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/firebase/config";
import { useSelector } from "react-redux";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizontal } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import UserProfileDialog from "@/components/userprofile/UserProfileDialog";
import AttachmentButton from "@/components/chat/AttachmentButton";

const ChatMessages = ({ chatId, chatMeta, parentCollection = "cartChats" }) => {
  const containerRef = useRef(null);
  const { user: currentUser, loading: authLoading } = useSelector(
    (state) => state.auth
  );
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const bottomRef = useRef(null);
  const [buyerName, setBuyerName] = useState("");

  // Modal/dialog state
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileUserId, setProfileUserId] = useState(null);

  // Attachment preview/send states
  const [pendingAttachment, setPendingAttachment] = useState(null); // {file, url, type}
  const [pendingCaption, setPendingCaption] = useState("");

  // File upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // next-intl hooks
  const t = useTranslations("ChatMessages");
  const locale = useLocale();

  // Fetch buyer's name
  useEffect(() => {
    if (!chatMeta?.buyerId) return;
    const fetchName = async () => {
      try {
        const snap = await getDoc(doc(db, "users", chatMeta.buyerId));
        if (snap.exists()) {
          const data = snap.data();
          setBuyerName(
            data.authPersonName ||
              data.name ||
              data.nameEn ||
              data.nameAr ||
              data.displayName ||
              data.email ||
              chatMeta.buyerId ||
              t("buyer")
          );
        } else {
          setBuyerName(t("buyer"));
        }
      } catch (e) {
        console.error(e);
        setBuyerName(t("buyer"));
      }
    };
    fetchName();
    // eslint-disable-next-line
  }, [chatMeta?.buyerId, t]);

  // Listen for chat messages in real time
  useEffect(() => {
    if (!chatId) return;
    const messagesRef = collection(db, "cartChats", chatId, "messages");
    const q = query(messagesRef, orderBy("createdAt"));

    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(msgs);
      setTimeout(() => {
        const el = containerRef.current;
        if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      }, 100);
    });

    return () => unsub();
  }, [chatId]);

  // Cleanup for file preview URL
  useEffect(() => {
    return () => {
      if (pendingAttachment?.url) URL.revokeObjectURL(pendingAttachment.url);
    };
  }, [pendingAttachment]);

  // WhatsApp-style send logic (attachment or plain text)
  const sendMessage = async () => {
    if (pendingAttachment && currentUser) {
      setUploading(true);
      setUploadProgress(0);
      try {
        const { file } = pendingAttachment;
        const storageRef = ref(
          storage,
          `chat_attachments/${chatId}/${Date.now()}_${file.name}`
        );
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            setUploading(false);
            setUploadProgress(0);
            alert(t("upload_failed") + ": " + error.message);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            await addDoc(collection(db, "cartChats", chatId, "messages"), {
              senderId: currentUser.uid,
              senderRole:
                currentUser.uid === chatMeta.buyerId ? "buyer" : "supplier",
              senderName: currentUser.displayName || t("supplier"),
              text: pendingCaption,
              attachmentUrl: downloadURL,
              attachmentName: file.name,
              attachmentType: file.type,
              createdAt: new Date(),
            });
            setUploading(false);
            setUploadProgress(0);
            setPendingAttachment(null);
            setPendingCaption("");
          }
        );
      } catch (error) {
        setUploading(false);
        setUploadProgress(0);
        alert(t("upload_failed") + ": " + error.message);
      }
      return;
    }

    if (!newMsg.trim() || !currentUser) return;
    const isBuyer = currentUser.uid === chatMeta.buyerId;
    const senderRole = isBuyer ? "buyer" : "supplier";
    const senderName = isBuyer
      ? buyerName
      : currentUser.displayName || t("supplier");

    try {
      await addDoc(collection(db, "cartChats", chatId, "messages"), {
        senderId: currentUser.uid,
        senderRole,
        senderName,
        text: newMsg.trim(),
        createdAt: new Date(),
      });
      setNewMsg("");
    } catch (e) {
      console.error("Failed to send message:", e);
    }
  };

  // Loading
  if (authLoading || !currentUser) {
    return <p className='p-6 text-center text-gray-500'>{t("loading")}</p>;
  }

  return (
    <div className='flex flex-col h-full'>
      {/* Message list */}
      <div
        ref={containerRef}
        className='flex-1 overflow-y-auto overscroll-contain space-y-2 p-4 border rounded bg-gray-50'
      >
        {messages.map((msg) => {
          const isSender = msg.senderId === currentUser.uid;
          const displayName =
            msg.senderRole === "buyer" ? buyerName : msg.senderName;

          // Attachment display logic
          const isImage =
            msg.attachmentType && msg.attachmentType.startsWith("image/");
          const isVideo =
            msg.attachmentType && msg.attachmentType.startsWith("video/");
          const isDoc =
            msg.attachmentType &&
            !msg.attachmentType.startsWith("image/") &&
            !msg.attachmentType.startsWith("video/");

          return (
            <div
              key={msg.id}
              className={`relative max-w-[75%] p-3 rounded-xl text-sm leading-snug ${
                isSender
                  ? "ml-auto bg-[#dcf8c6] text-right rounded-br-none"
                  : "mr-auto bg-white text-left rounded-bl-none border"
              }`}
            >
              <div className='text-xs text-gray-500 mb-1 font-medium'>
                {msg.senderRole === "buyer"
                  ? `${t("buyer")}`
                  : `${t("supplier")}`}{" "}
                •{" "}
                <button
                  type='button'
                  className='underline text-primary hover:text-secondary transition-colors cursor-pointer bg-transparent border-0 p-0'
                  title={t("viewProfile") || "View Profile"}
                  onClick={() => {
                    setProfileUserId(msg.senderId);
                    setProfileOpen(true);
                  }}
                >
                  {displayName}
                </button>
              </div>
              <div>
                {msg.text && (
                  <p className='whitespace-pre-wrap text-gray-800'>
                    {msg.text}
                  </p>
                )}
                {msg.attachmentUrl && (
                  <div className='mt-2'>
                    {isImage ? (
                      <img
                        src={msg.attachmentUrl}
                        alt={msg.attachmentName || "attachment"}
                        className='max-w-[200px] rounded shadow'
                      />
                    ) : isVideo ? (
                      <video
                        src={msg.attachmentUrl}
                        controls
                        className='max-w-[200px] rounded shadow'
                      />
                    ) : (
                      <a
                        href={msg.attachmentUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-blue-600 underline'
                        download
                      >
                        {msg.attachmentName || t("attachDocument")}
                      </a>
                    )}
                  </div>
                )}
              </div>
              <span className='text-[10px] text-gray-500 mt-1 block'>
                {msg.createdAt?.seconds
                  ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString(
                      locale,
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )
                  : ""}
              </span>
              <div
                className={`absolute w-0 h-0 border-t-8 border-b-8 top-2 ${
                  isSender
                    ? "right-[-8px] border-l-[8px] border-l-[#dcf8c6] border-t-transparent border-b-transparent"
                    : "left-[-8px] border-r-[8px] border-r-white border-t-transparent border-b-transparent"
                }`}
              />
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* WhatsApp-style Attachment Preview */}
      {pendingAttachment && (
        <div className='mb-2 flex items-center gap-4 bg-gray-100 rounded p-3 relative'>
          {pendingAttachment.type &&
            pendingAttachment.type.startsWith("image/") && (
              <img
                src={pendingAttachment.url}
                alt='preview'
                className='w-20 h-20 object-cover rounded'
              />
            )}
          {pendingAttachment.type &&
            pendingAttachment.type.startsWith("video/") && (
              <video
                src={pendingAttachment.url}
                controls
                className='w-20 h-20 object-cover rounded'
              />
            )}
          {pendingAttachment.type &&
            !pendingAttachment.type.startsWith("image/") &&
            !pendingAttachment.type.startsWith("video/") && (
              <div className='flex items-center gap-2'>
                <span className='w-10 h-10 bg-gray-300 rounded flex items-center justify-center'>
                  📄
                </span>
                <span className='text-sm'>{pendingAttachment.file.name}</span>
              </div>
            )}
          <button
            type='button'
            className='absolute top-1 right-1 text-gray-400 hover:text-red-600 text-lg'
            onClick={() => {
              setPendingAttachment(null);
              setPendingCaption("");
            }}
            title={t("cancelAttachment") || "Cancel"}
          >
            ×
          </button>
          <input
            type='text'
            value={pendingCaption}
            onChange={(e) => setPendingCaption(e.target.value)}
            placeholder={t("addCaption") || "Add a caption…"}
            className='flex-1 border rounded px-2 py-1 ml-3'
            disabled={uploading}
          />
        </div>
      )}

      {/* Upload progress */}
      {uploading && (
        <div className='px-4 py-2 text-sm text-gray-600'>
          {t("uploading")}: {Math.round(uploadProgress)}%
        </div>
      )}

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className='flex gap-2 mt-3'
      >
        <AttachmentButton
          onSelectPhoto={(file) => {
            setPendingAttachment({
              file,
              url: URL.createObjectURL(file),
              type: file.type,
            });
            setPendingCaption("");
          }}
          onSelectDocument={(file) => {
            setPendingAttachment({
              file,
              url: null,
              type: file.type,
            });
            setPendingCaption("");
          }}
          onSelectCamera={() => {}}
          onSelectContact={() => {}}
          disabled={uploading || !!pendingAttachment}
        />

        <Input
          value={pendingAttachment ? pendingCaption : newMsg}
          onChange={(e) =>
            pendingAttachment
              ? setPendingCaption(e.target.value)
              : setNewMsg(e.target.value)
          }
          placeholder={
            pendingAttachment
              ? t("addCaption") || "Add a caption…"
              : t("typeMessage")
          }
          className='flex-1'
          disabled={uploading}
        />

        <Button
          type='submit'
          className='bg-[#2c6449] text-white'
          disabled={
            uploading ||
            (pendingAttachment ? !pendingAttachment : !newMsg.trim())
          }
        >
          <SendHorizontal size={16} />
        </Button>
      </form>

      {/* Profile Dialog Modal */}
      <UserProfileDialog
        userId={profileUserId}
        open={profileOpen}
        onOpenChange={setProfileOpen}
      />
    </div>
  );
};

export default ChatMessages;
