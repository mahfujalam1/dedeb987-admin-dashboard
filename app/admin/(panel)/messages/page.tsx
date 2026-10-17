import { Suspense } from 'react';
import ChatWindow from "@/components/messages/ChatWindow";
import ConversationsList from "@/components/messages/ConversationsList";


export default function MessagesPage() {
  return (
    <>
      <div className="flex flex-col h-[calc(100vh-130px)] min-h-[640px] -mb-8">
        {/* Compact Page Title */}
        <div className="mb-2.5 shrink-0">
          <h2 className="text-2xl lg:text-3xl font-serif text-[#171717] tracking-tight">
            Messages
          </h2>
          <p className="text-xs text-[#7A726A] mt-0.5 font-serif">
            Platform-wide customer & vendor conversations.
          </p>
        </div>

        {/* Unified Attached Messages Layout */}
        <div className="flex-1 min-h-0 bg-white border border-[#EBE4DD] rounded-2xl shadow-sm flex flex-col md:flex-row overflow-hidden">
          {/* Slim attached conversation sidebar */}
          <div className="w-full md:w-72 lg:w-80 shrink-0 border-b md:border-b-0 md:border-r border-[#ECE5DE] flex flex-col h-full bg-[#FAF7F4]/40">
            <Suspense fallback={<div className="p-4 text-xs text-ink-muted">Loading conversations...</div>}>
              <ConversationsList />
            </Suspense>
          </div>

          {/* Full-height message outlet box */}
          <div className="flex-1 min-w-0 flex flex-col h-full bg-white">
            <ChatWindow />
          </div>
        </div>
      </div>
    </>
  );
}
