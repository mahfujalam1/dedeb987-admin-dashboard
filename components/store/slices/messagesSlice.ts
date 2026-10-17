import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Conversation, ChatMessage, ChatAttachment } from '../../types';
import { initialConversations } from '@/components/data/otherData';

interface MessagesState {
  conversations: Conversation[];
  activeConversationId: string;
}

const initialState: MessagesState = {
  conversations: initialConversations,
  activeConversationId: initialConversations[0]?.id || '',
};

export const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setActiveConversation: (state, action: PayloadAction<string>) => {
      state.activeConversationId = action.payload;
      const conv = state.conversations.find((c) => c.id === action.payload);
      if (conv) conv.unreadCount = 0;
    },
    sendMessage: (
      state,
      action: PayloadAction<{
        conversationId: string;
        text: string;
        attachment?: ChatAttachment;
      }>
    ) => {
      const conv = state.conversations.find(
        (c) => c.id === action.payload.conversationId
      );
      if (conv) {
        const newMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          sender: 'vendor',
          text: action.payload.text,
          time: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          attachment: action.payload.attachment,
        };
        conv.messages.push(newMsg);
        conv.preview = action.payload.attachment
          ? `[${action.payload.attachment.type.toUpperCase()}] ${action.payload.text || action.payload.attachment.name}`
          : action.payload.text;
        conv.timestamp = 'Just now';
      }
    },
    openConversationForUser: (state, action: PayloadAction<{ userId: string; userName: string }>) => {
      const match = state.conversations.find(
        (c) => c.customerName.toLowerCase() === action.payload.userName.toLowerCase() || c.id === action.payload.userId
      );
      if (match) {
        state.activeConversationId = match.id;
        match.unreadCount = 0;
      } else {
        const newConv: Conversation = {
          id: `conv-user-${action.payload.userId}`,
          customerName: action.payload.userName,
          preview: 'Started new direct chat with customer',
          timestamp: 'Just now',
          unreadCount: 0,
          messages: [
            {
              id: `m-init-${Date.now()}`,
              sender: 'vendor',
              text: `Hello ${action.payload.userName}, how can we help you today?`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ],
        };
        state.conversations.unshift(newConv);
        state.activeConversationId = newConv.id;
      }
    },
  },
});

export const { setActiveConversation, sendMessage, openConversationForUser } = messagesSlice.actions;
export default messagesSlice.reducer;
