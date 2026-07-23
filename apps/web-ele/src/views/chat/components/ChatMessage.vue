<script lang="ts" setup>
import { ref } from 'vue';

import MarkdownRenderer from './MarkdownRenderer.vue';

defineProps<{
  content: string;
  error?: boolean;
  loading?: boolean;
  role: 'assistant' | 'system' | 'user';
}>();

const copied = ref(false);

async function copyContent(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {
    // fallback
  }
}
</script>

<template>
  <div
    class="chat-message flex gap-3 py-4 px-4"
    :class="{ 'flex-row-reverse': role === 'user' }"
  >
    <!-- Avatar -->
    <div class="flex-shrink-0">
      <div
        class="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
        :class="
          role === 'user'
            ? 'bg-gradient-to-br from-blue-500 to-purple-600'
            : 'bg-gradient-to-br from-emerald-500 to-teal-600'
        "
      >
        {{ role === 'user' ? 'U' : 'AI' }}
      </div>
    </div>

    <!-- Message Content -->
    <div
      class="flex-1 min-w-0"
      :class="role === 'user' ? 'flex justify-end' : ''"
    >
      <div
        class="inline-block max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
        :class="[
          role === 'user'
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tr-sm'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm',
        ]"
      >
        <!-- Loading Animation -->
        <div v-if="loading && !content" class="flex items-center gap-1 py-1">
          <span
            class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style="animation-delay: 0ms"
          ></span>
          <span
            class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style="animation-delay: 150ms"
          ></span>
          <span
            class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style="animation-delay: 300ms"
          ></span>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-red-500 flex items-center gap-2">
          <span>⚠️</span>
          <span>{{ content }}</span>
        </div>

        <!-- User Message (plain text) -->
        <div
          v-else-if="role === 'user'"
          class="whitespace-pre-wrap break-words"
        >
          {{ content }}
        </div>

        <!-- Assistant Message (markdown) -->
        <MarkdownRenderer v-else :content="content" />

        <!-- Streaming cursor -->
        <span
          v-if="loading && content"
          class="inline-block w-1.5 h-4 bg-current opacity-70 animate-pulse ml-0.5 align-middle"
        ></span>
      </div>

      <!-- Actions -->
      <div
        v-if="content && !loading"
        class="flex items-center gap-2 mt-1 text-xs text-gray-400"
        :class="role === 'user' ? 'justify-end' : 'justify-start'"
      >
        <button
          class="hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
          @click="copyContent(content)"
        >
          {{ copied ? '✓ 已复制' : '复制' }}
        </button>
      </div>
    </div>
  </div>
</template>
