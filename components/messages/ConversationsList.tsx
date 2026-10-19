'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setActiveConversation, openConversationForUser, openConversationForVendor } from '../store/slices/messagesSlice';
import { adminUsers, adminVendors } from '@/lib/data/admin-data';

export default function ConversationsList() {
  const [activeTab, setActiveTab] = React.useState<'vendors' | 'customers'>('vendors');
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const { conversations, activeConversationId } = useAppSelector(
    (state) => state.messages
  );

  React.useEffect(() => {
    const orderId = searchParams.get('orderId');
    const convId = searchParams.get('convId');
    const userId = searchParams.get('userId');
    const vendorId = searchParams.get('vendorId');

    if (vendorId) {
      setActiveTab('vendors');
      const targetVendor = adminVendors.find((v) => v.id === vendorId);
      const vName = targetVendor ? targetVendor.name : `Vendor ${vendorId}`;
      dispatch(openConversationForVendor({ vendorId, vendorName: vName }));
    } else if (userId) {
      setActiveTab('customers');
      const targetUser = adminUsers.find((u) => u.id === userId);
      if (targetUser) {
        dispatch(openConversationForUser({ userId: targetUser.id, userName: targetUser.name }));
      } else {
        const match = conversations.find((c) => c.id === userId);
        if (match) {
          dispatch(setActiveConversation(match.id));
        }
      }
    } else if (convId) {
      dispatch(setActiveConversation(convId));
    } else if (orderId) {
      const match = conversations.find(
        (c) => c.orderId === orderId || c.orderRe?.includes(orderId)
      );
      if (match) {
        dispatch(setActiveConversation(match.id));
      }
    }
  }, [searchParams, conversations, dispatch]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="h-14 px-4 border-b border-[#ECE5DE] bg-white flex items-center justify-between shrink-0">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#79716B] font-serif">
          Conversations
        </h3>
        <span className="text-[10px] bg-[#F2EBE3] text-[#84634B] px-2 py-0.5 rounded-full font-serif font-medium">
          {conversations.length} total
        </span>
      </div>

      {/* Slim conversations list with decreased item height */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1 thin-scrollbar">
        <div className="flex items-center justify-around border border-gray-200 px-3 py-2 mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#8A8177] font-serif">
          <div className={`"font-bold p-2 rounded-md" ${activeTab === 'vendors' ? 'bg-black text-white rounded-md cursor-pointer transition-all duration-300' : 'bg-gray-200 text-gray-700 rounded-md cursor-pointer transition-all duration-300'}`} onClick={() => setActiveTab('vendors')}>
            Vendors
          </div>
          <div className={`"font-bold p-2 rounded-md cursor-pointer" ${activeTab === 'customers' ? 'bg-black text-white rounded-md cursor-pointer transition-all duration-300' : 'bg-gray-200 text-gray-700 rounded-md cursor-pointer transition-all duration-300'}`} onClick={() => setActiveTab('customers')}>
            Customers
          </div>
        </div>
        {conversations.map((conv) => {
          const isActive = conv.id === activeConversationId;
          return (
            <button
              key={conv.id}
              type="button"
              onClick={() => dispatch(setActiveConversation(conv.id))}
              className={`w-full text-left px-3 py-2 rounded-lg transition-all border ${isActive
                ? 'bg-white border-[#DDD5CC] shadow-xs'
                : 'hover:bg-white/80 border-transparent'
                }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className={`text-xs truncate font-serif ${isActive ? 'font-bold text-[#171717]' : 'font-semibold text-[#171717]'
                      }`}
                  >
                    {conv.customerName}
                  </span>
                  {conv.unreadCount > 0 && (
                    <span className="w-3.5 h-3.5 rounded-full bg-[#111111] text-white text-[8.5px] flex items-center justify-center font-bold shrink-0">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                <span className="text-[9.5px] text-[#8C8379] font-serif shrink-0 ml-1">
                  {conv.timestamp}
                </span>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-serif truncate leading-tight">
                <span className="text-[#554C42] font-medium shrink-0">
                  {conv.productRe ? `Re: ${conv.productRe}` : conv.orderRe} —
                </span>
                <span className="truncate text-[#8C8379]">{conv.preview}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
