<script lang="ts" setup>
import { computed, ref } from 'vue';

import { useChatStore } from '#/store';

const emit = defineEmits<{
  newChat: [];
  openSettings: [];
}>();

const chatStore = useChatStore();

const searchQuery = ref('');
const editingId = ref<null | string>(null);
const editingTitle = ref('');

const filteredConversations = computed(() => {
  if (!searchQuery.value) return chatStore.conversations;
  const q = searchQuery.value.toLowerCase();
  return chatStore.conversations.filter((c) =>
    c.title.toLowerCase().includes(q),
  );
});

function startRename(id: string, title: string) {
  editingId.value = id;
  editingTitle.value = title;
}

function confirmRename(id: string) {
  if (editingTitle.value.trim()) {
    chatStore.renameConversation(id, editingTitle.value.trim());
  }
  editingId.value = null;
}

function cancelRename() {
  editingId.value = null;
}

function handleDelete(id: string) {
  chatStore.deleteConversation(id);
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return date.toLocaleDateString('zh-CN');
}
</script>

<template>
  <div
    class="sidebar flex flex-col h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700"
  >
    <!-- Header -->
    <div class="p-3 border-b border-gray-200 dark:border-gray-700">
      <button
        class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl text-sm font-medium transition-all shadow-md hover:shadow-lg cursor-pointer"
        @click="emit('newChat')"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        新对话
      </button>
    </div>

    <!-- Search -->
    <div class="px-3 py-2">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索对话..."
        class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 placeholder-gray-400 transition-all"
      />
    </div>

    <!-- Conversation List -->
    <div class="flex-1 overflow-y-auto px-2 py-1 space-y-1 scrollbar-thin">
      <div
        v-for="conv in filteredConversations"
        :key="conv.id"
        class="group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all"
        :class="
          conv.id === chatStore.currentConversationId
            ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 shadow-sm'
            : 'hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'
        "
        @click="chatStore.selectConversation(conv.id)"
      >
        <!-- Icon -->
        <div
          class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>

        <!-- Title & Time -->
        <div class="flex-1 min-w-0">
          <template v-if="editingId === conv.id">
            <input
              v-model="editingTitle"
              class="w-full px-2 py-0.5 text-sm bg-white dark:bg-gray-700 border border-blue-400 rounded focus:outline-none"
              @blur="confirmRename(conv.id)"
              @keydown.enter="confirmRename(conv.id)"
              @keydown.escape="cancelRename"
              @click.stop
            />
          </template>
          <template v-else>
            <div
              class="text-sm font-medium text-gray-700 dark:text-gray-200 truncate"
            >
              {{ conv.title }}
            </div>
            <div class="text-xs text-gray-400 mt-0.5">
              {{ formatTime(conv.updatedAt) }}
            </div>
          </template>
        </div>

        <!-- Actions -->
        <div
          class="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <button
            class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
            title="重命名"
            @click.stop="startRename(conv.id, conv.title)"
          >
            <svg
              class="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            class="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
            title="删除"
            @click.stop="handleDelete(conv.id)"
          >
            <svg
              class="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="filteredConversations.length === 0"
        class="text-center text-gray-400 text-sm py-8"
      >
        {{ searchQuery ? '没有找到匹配的对话' : '暂无对话' }}
      </div>
    </div>

    <!-- Footer - Settings -->
    <div class="p-3 border-t border-gray-200 dark:border-gray-700">
      <button
        class="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm transition-colors cursor-pointer"
        @click="emit('openSettings')"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        API 设置
      </button>
    </div>
  </div>
</template>
