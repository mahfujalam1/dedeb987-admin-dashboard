'use client';

import React, { useState, useRef } from 'react';
import { Button, Input, Dropdown, Image } from 'antd';
import type { MenuProps } from 'antd';
import {
  FiSend,
  FiPaperclip,
  FiImage,
  FiFileText,
  FiX,
  FiDownload,
} from 'react-icons/fi';
import { sendMessage } from '../store/slices/messagesSlice';
import { ChatAttachment, ChatMessage } from '../types';
import { useAppDispatch, useAppSelector } from '../store/hooks';

export default function ChatWindow() {
  const dispatch = useAppDispatch();
  const [inputText, setInputText] = useState('');
  const [selectedAttachment, setSelectedAttachment] =
    useState<ChatAttachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { conversations, activeConversationId } = useAppSelector(
    (state) => state.messages
  );

  const activeConv =
    conversations.find((c) => c.id === activeConversationId) ||
    conversations[0];

  const handleSend = () => {
    if ((!inputText.trim() && !selectedAttachment) || !activeConv) return;
    dispatch(
      sendMessage({
        conversationId: activeConv.id,
        text: inputText.trim(),
        attachment: selectedAttachment || undefined,
      })
    );
    setInputText('');
    setSelectedAttachment(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isPdf =
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf');

    const sizeStr =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    let previewUrl: string | undefined;
    if (isImage) {
      previewUrl = URL.createObjectURL(file);
    }

    setSelectedAttachment({
      name: file.name,
      type: isImage ? 'image' : isPdf ? 'pdf' : 'file',
      url: previewUrl,
      size: sizeStr,
    });

    e.target.value = '';
  };

  const attachmentMenuItems: MenuProps['items'] = [
    {
      key: 'photo',
      className: 'cursor-pointer',
      label: (
        <span className="font-serif text-xs cursor-pointer">
          Photo / Image (JPG, PNG, WebP)
        </span>
      ),
      icon: <FiImage className="text-sm text-[#84634B]" />,
      onClick: () => {
        if (fileInputRef.current) {
          fileInputRef.current.accept = 'image/*';
          fileInputRef.current.click();
        }
      },
    },
    {
      key: 'pdf',
      className: 'cursor-pointer',
      label: (
        <span className="font-serif text-xs cursor-pointer">
          PDF Document (.pdf)
        </span>
      ),
      icon: <FiFileText className="text-sm text-[#C23934]" />,
      onClick: () => {
        if (fileInputRef.current) {
          fileInputRef.current.accept = '.pdf,application/pdf';
          fileInputRef.current.click();
        }
      },
    },
    {
      key: 'all',
      className: 'cursor-pointer',
      label: (
        <span className="font-serif text-xs cursor-pointer">
          Browse all files...
        </span>
      ),
      icon: <FiPaperclip className="text-sm text-[#696157]" />,
      onClick: () => {
        if (fileInputRef.current) {
          fileInputRef.current.accept = 'image/*,.pdf,.doc,.docx';
          fileInputRef.current.click();
        }
      },
    },
  ];

  if (!activeConv) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-center text-[#8C8379] font-serif">
        No conversation selected
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      {/* Hidden file input for file picker */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Chat Header */}
      <div className="h-14 px-6 border-b border-[#ECE5DE] bg-white flex items-center justify-between shrink-0">
        <div>
          <h3 className="text-sm font-semibold font-serif text-[#171717] leading-tight">
            {activeConv.customerName}
          </h3>
          <p className="text-[11px] text-[#7A726A] font-serif leading-tight">
            {activeConv.productRe
              ? `Re: ${activeConv.productRe}`
              : activeConv.orderRe}
          </p>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 thin-scrollbar">
        {activeConv.messages.map((msg: ChatMessage) => {
          const isVendor = msg.sender === 'vendor';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isVendor ? 'items-end' : 'items-start'
                }`}
            >
              <div
                className={`max-w-[78%] px-4 py-2.5 text-xs font-serif leading-relaxed ${isVendor
                    ? 'rounded-2xl rounded-br-xs bg-[#111111] text-white shadow-sm'
                    : 'rounded-2xl rounded-bl-xs bg-[#F4ECE3] text-[#171717]'
                  }`}
              >
                {/* Photo / Image Attachment with Large View Preview */}
                {msg.attachment && msg.attachment.type === 'image' && (
                  <div className="mb-2 rounded-lg overflow-hidden border border-black/10 bg-black/5">
                    {msg.attachment.url ? (
                      <div className="relative group cursor-pointer">
                        <Image
                          src={msg.attachment.url}
                          alt={msg.attachment.name}
                          className="max-h-60 w-auto max-w-full object-cover rounded-lg cursor-pointer hover:opacity-95 transition-opacity"
                          preview={{
                            mask: (
                              <div className="flex items-center gap-1.5 text-xs font-serif text-white font-medium bg-black/40 px-3 py-1.5 rounded-full">
                                <span>Click for large view</span>
                              </div>
                            ),
                          }}
                        />
                      </div>
                    ) : (
                      <div className="p-3 flex items-center gap-2">
                        <FiImage className="text-lg" />
                        <span className="text-xs">{msg.attachment.name}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* PDF / File Attachment */}
                {msg.attachment &&
                  (msg.attachment.type === 'pdf' ||
                    msg.attachment.type === 'file') && (
                    <div
                      className={`mb-2 flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${isVendor
                          ? 'bg-white/10 border-white/20 text-white'
                          : 'bg-white border-[#E5DDD4] text-[#171717]'
                        }`}
                    >
                      <div className="w-8 h-8 rounded bg-[#E03131] text-white flex items-center justify-center font-bold text-[9px] tracking-wider shrink-0 shadow-xs">
                        PDF
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate font-serif leading-tight">
                          {msg.attachment.name}
                        </p>
                        {msg.attachment.size && (
                          <p
                            className={`text-[10px] leading-tight mt-0.5 ${isVendor ? 'text-white/70' : 'text-[#8A8177]'
                              }`}
                          >
                            {msg.attachment.size}
                          </p>
                        )}
                      </div>
                      <a
                        href={msg.attachment.url || '#'}
                        download={msg.attachment.name}
                        onClick={(e) => {
                          if (!msg.attachment?.url) e.preventDefault();
                        }}
                        className={`p-1.5 rounded hover:bg-black/10 transition-colors cursor-pointer ${isVendor
                            ? 'text-white hover:text-white'
                            : 'text-[#171717]'
                          }`}
                        title="Download attachment"
                      >
                        <FiDownload className="text-xs" />
                      </a>
                    </div>
                  )}

                {/* Message text */}
                {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
              </div>

              <span className="text-[10px] text-[#9A9085] mt-1 px-1 font-serif">
                {msg.time}
              </span>
            </div>
          );
        })}
      </div>

      {/* Reply input section with attachment preview */}
      <div className="p-3.5 border-t border-[#ECE5DE] bg-white shrink-0">
        {/* Attachment preview banner */}
        {selectedAttachment && (
          <div className="mb-2 p-2 px-3 bg-[#FAF7F4] border border-[#E8E2DC] rounded-lg flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2.5 min-w-0">
              {selectedAttachment.type === 'image' ? (
                selectedAttachment.url ? (
                  <div className="w-9 h-9 rounded border border-[#E0D7CC] overflow-hidden shrink-0">
                    <Image
                      src={selectedAttachment.url}
                      alt="preview"
                      width={36}
                      height={36}
                      className="object-cover cursor-pointer"
                      preview={{
                        mask: null,
                      }}
                    />
                  </div>
                ) : (
                  <FiImage className="text-lg text-[#84634B] shrink-0" />
                )
              ) : (
                <div className="w-8 h-8 rounded bg-[#E03131] text-white flex items-center justify-center font-bold text-[9px] tracking-wider shrink-0 shadow-xs">
                  PDF
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#171717] truncate font-serif leading-tight">
                  {selectedAttachment.name}
                </p>
                <p className="text-[10px] text-[#8C8379] leading-tight mt-0.5">
                  {selectedAttachment.size} • Ready to send (click image to preview)
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedAttachment(null)}
              className="p-1 hover:bg-[#ECE5DE] rounded-full text-[#7A726A] hover:text-[#171717] transition-colors ml-2 cursor-pointer"
              title="Remove attachment"
            >
              <FiX className="text-sm" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2.5">
          {/* Attachment Paperclip Icon Button with Dropdown */}
          <Dropdown
            menu={{ items: attachmentMenuItems }}
            trigger={['click']}
            placement="topLeft"
          >
            <button
              type="button"
              className="h-10 w-10 shrink-0 flex items-center justify-center rounded-lg border border-[#E8E2DC] bg-[#FAF7F4] text-[#635B52] hover:text-[#171717] hover:border-[#171717] hover:bg-white transition-all shadow-xs cursor-pointer"
              title="Attach photo or PDF document"
            >
              <FiPaperclip className="text-base cursor-pointer" />
            </button>
          </Dropdown>

          <Input.TextArea
            rows={1}
            autoSize={{ minRows: 1, maxRows: 4 }}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedAttachment
                ? 'Add an optional message...'
                : 'Write a reply... (Enter to send)'
            }
            className="text-xs font-serif bg-[#FAF7F4] border-[#E8E2DC] focus:bg-white rounded-lg flex-1"
          />

          <Button
            type="primary"
            icon={<FiSend className="text-xs" />}
            onClick={handleSend}
            disabled={!inputText.trim() && !selectedAttachment}
            className="bg-[#111111] text-white hover:bg-black font-serif text-xs h-10 px-5 shrink-0 flex items-center gap-1.5 rounded-lg disabled:opacity-40 cursor-pointer"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
