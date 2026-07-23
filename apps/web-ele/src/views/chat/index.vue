<script lang="ts" setup>
import { ref } from 'vue';

import { useAutoScroll } from '#/composables/useAutoScroll';
import { useChatApi } from '#/composables/useChatApi';
import { useChatStore, useSettingsStore } from '#/store';

import ChatInput from './components/ChatInput.vue';
import ChatMessage from './components/ChatMessage.vue';
import SettingsDialog from './components/SettingsDialog.vue';
import Sidebar from './components/Sidebar.vue';
import WelcomeScreen from './components/WelcomeScreen.vue';

const chatStore = useChatStore();
const settingsStore = useSettingsStore();
const chatApi = useChatApi();

const showSettings = ref(false);
const sidebarCollapsed = ref(false);

const { containerRef, handleScroll } = useAutoScroll(
  () => chatStore.currentMessages,
);

function handleNewChat() {
  chatStore.createConversation();
}

async function handleSendSuggestion(prompt: string) {
  // 创建新会话并直接发送该 prompt
  chatStore.createConversation();
  await handleSend(prompt);
}

async function handleSend(content: string) {
  // 如果没有当前会话，创建一个
  if (!chatStore.currentConversationId) {
    chatStore.createConversation();
  }

  const convId = chatStore.currentConversationId;
  if (!convId) return;

  // 添加用户消息
  chatStore.addMessage(convId, { role: 'user', content });

  // 添加 AI 占位消息
  const aiMsg = chatStore.addMessage(convId, {
    role: 'assistant',
    content: '',
    loading: true,
  });

  // 构建消息历史
  const messages = chatStore.currentMessages
    .filter((m) => !m.loading && !m.error)
    .map((m) => ({ role: m.role, content: m.content }));

  // 发送请求
  let accumulatedContent = '';

  await chatApi.sendMessage(
    messages,
    (chunk) => {
      accumulatedContent += chunk;
      chatStore.updateMessageContent(convId, aiMsg.id, accumulatedContent);
    },
    () => {
      chatStore.updateMessageStatus(convId, aiMsg.id, { loading: false });
    },
    (error) => {
      chatStore.updateMessageContent(convId, aiMsg.id, error);
      chatStore.updateMessageStatus(convId, aiMsg.id, {
        loading: false,
        error: true,
      });
    },
  );
}

function handleStop() {
  chatApi.stopStreaming();
  // 更新最后一条消息状态
  if (chatStore.currentConversationId) {
    const msgs = chatStore.currentMessages;
    const lastMsg = msgs[msgs.length - 1];
    if (lastMsg && lastMsg.loading) {
      chatStore.updateMessageStatus(
        chatStore.currentConversationId,
        lastMsg.id,
        {
          loading: false,
        },
      );
    }
  }
}

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value;
}
</script>

<template>
  <div class="chat-page flex h-screen bg-white dark:bg-gray-900">
    <!-- Sidebar -->
    <div
      class="sidebar-wrapper transition-all duration-300 overflow-hidden"
      :class="sidebarCollapsed ? 'w-0' : 'w-72'"
    >
      <div class="w-72 h-full">
        <Sidebar
          @new-chat="handleNewChat"
          @open-settings="showSettings = true"
        />
      </div>
    </div>

    <!-- Main Chat Area -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Top Bar -->
      <div
        class="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
      >
        <!-- Toggle Sidebar -->
        <button
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors cursor-pointer"
          @click="toggleSidebar"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <!-- Current Conversation Title -->
        <div class="flex-1 min-w-0">
          <h2
            class="text-sm font-medium text-gray-700 dark:text-gray-200 truncate"
          >
            {{ chatStore.currentConversation?.title || 'AI Chat' }}
          </h2>
        </div>

        <!-- Model Badge -->
        <div
          class="flex-shrink-0 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400"
        >
          {{ settingsStore.settings.model }}
        </div>
      </div>

      <!-- Messages Area (ref on always-rendered wrapper) -->
      <div
        ref="containerRef"
        class="flex-1 overflow-y-auto scroll-smooth"
        @scroll="handleScroll"
      >
        <div
          v-if="
            chatStore.currentConversation &&
            chatStore.currentMessages.length > 0
          "
          class="max-w-3xl mx-auto py-4"
        >
          <ChatMessage
            v-for="msg in chatStore.currentMessages"
            :key="msg.id"
            :content="msg.content"
            :role="msg.role"
            :loading="msg.loading"
            :error="msg.error"
          />
        </div>

        <!-- Welcome Screen -->
        <WelcomeScreen v-else @send-suggestion="handleSendSuggestion" />
      </div>

      <!-- Input Area -->
      <ChatInput
        :streaming="chatApi.isStreaming.value"
        @send="handleSend"
        @stop="handleStop"
      />
    </div>

    <!-- Settings Dialog -->
    <SettingsDialog v-model="showSettings" />
  </div>
</template>

<style scoped>
/* Custom scrollbar */
.sidebar-wrapper {
  scrollbar-width: none;
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: rgb(128 128 128 / 30%);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgb(128 128 128 / 50%);
}
</style>
