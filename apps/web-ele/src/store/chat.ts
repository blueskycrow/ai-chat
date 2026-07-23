import type { ChatMessage, Conversation } from '#/types/chat';

import { computed, ref, watch } from 'vue';

import { defineStore } from 'pinia';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

const STORAGE_KEY = 'ai-chat-conversations';

function loadFromStorage(): Conversation[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveToStorage(conversations: Conversation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
}

export const useChatStore = defineStore('chat', () => {
  const conversations = ref<Conversation[]>(loadFromStorage());
  const currentConversationId = ref<null | string>(null);
  const isStreaming = ref(false);

  const currentConversation = computed(() => {
    if (!currentConversationId.value) return null;
    return (
      conversations.value.find((c) => c.id === currentConversationId.value) ??
      null
    );
  });

  const currentMessages = computed(() => {
    return currentConversation.value?.messages ?? [];
  });

  // 持久化到 localStorage
  watch(
    conversations,
    (val) => {
      saveToStorage(val);
    },
    { deep: true },
  );

  function createConversation(title?: string): Conversation {
    const conv: Conversation = {
      id: generateId(),
      title: title || '新对话',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    conversations.value.unshift(conv);
    currentConversationId.value = conv.id;
    return conv;
  }

  function deleteConversation(id: string) {
    const idx = conversations.value.findIndex((c) => c.id === id);
    if (idx !== -1) {
      conversations.value.splice(idx, 1);
      if (currentConversationId.value === id) {
        currentConversationId.value = conversations.value[0]?.id ?? null;
      }
    }
  }

  function renameConversation(id: string, title: string) {
    const conv = conversations.value.find((c) => c.id === id);
    if (conv) {
      conv.title = title;
      conv.updatedAt = Date.now();
    }
  }

  function selectConversation(id: string) {
    currentConversationId.value = id;
  }

  function addMessage(
    conversationId: string,
    message: Omit<ChatMessage, 'id' | 'timestamp'>,
  ): ChatMessage {
    const conv = conversations.value.find((c) => c.id === conversationId);
    if (!conv) throw new Error('Conversation not found');

    const msg: ChatMessage = {
      ...message,
      id: generateId(),
      timestamp: Date.now(),
    };
    conv.messages.push(msg);
    conv.updatedAt = Date.now();

    // 自动更新标题（如果是第一条用户消息）
    if (
      conv.messages.filter((m) => m.role === 'user').length === 1 &&
      message.role === 'user'
    ) {
      conv.title =
        message.content.slice(0, 30) +
        (message.content.length > 30 ? '...' : '');
    }

    return msg;
  }

  function updateMessageContent(
    conversationId: string,
    messageId: string,
    content: string,
  ) {
    const conv = conversations.value.find((c) => c.id === conversationId);
    if (!conv) return;
    const msg = conv.messages.find((m) => m.id === messageId);
    if (msg) {
      msg.content = content;
      conv.updatedAt = Date.now();
    }
  }

  function updateMessageStatus(
    conversationId: string,
    messageId: string,
    status: { error?: boolean; loading?: boolean },
  ) {
    const conv = conversations.value.find((c) => c.id === conversationId);
    if (!conv) return;
    const msg = conv.messages.find((m) => m.id === messageId);
    if (msg) {
      if (status.loading !== undefined) msg.loading = status.loading;
      if (status.error !== undefined) msg.error = status.error;
    }
  }

  function clearConversation(id: string) {
    const conv = conversations.value.find((c) => c.id === id);
    if (conv) {
      conv.messages = [];
      conv.updatedAt = Date.now();
    }
  }

  return {
    conversations,
    currentConversationId,
    currentConversation,
    currentMessages,
    isStreaming,
    createConversation,
    deleteConversation,
    renameConversation,
    selectConversation,
    addMessage,
    updateMessageContent,
    updateMessageStatus,
    clearConversation,
  };
});
