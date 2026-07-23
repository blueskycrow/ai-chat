<script lang="ts" setup>
import { nextTick, ref } from 'vue';

const props = defineProps<{
  disabled?: boolean;
  streaming?: boolean;
}>();

const emit = defineEmits<{
  send: [content: string];
  stop: [];
}>();

const inputRef = ref<HTMLTextAreaElement | null>(null);
const inputText = ref('');

function handleSend() {
  const text = inputText.value.trim();
  if (!text || props.disabled) return;
  emit('send', text);
  inputText.value = '';
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.style.height = 'auto';
    }
  });
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
}

function handleInput() {
  if (!inputRef.value) return;
  inputRef.value.style.height = 'auto';
  const scrollHeight = inputRef.value.scrollHeight;
  inputRef.value.style.height = `${Math.min(scrollHeight, 200)}px`;
}
</script>

<template>
  <div
    class="chat-input p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
  >
    <div class="max-w-3xl mx-auto">
      <div
        class="relative flex items-end gap-2 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 focus-within:border-blue-400 dark:focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all p-2"
      >
        <textarea
          ref="inputRef"
          v-model="inputText"
          rows="1"
          placeholder="输入消息... (Enter 发送, Shift+Enter 换行)"
          class="flex-1 bg-transparent resize-none outline-none text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 px-2 py-1.5 max-h-[200px] leading-relaxed"
          :disabled="disabled"
          @keydown="handleKeydown"
          @input="handleInput"
        ></textarea>

        <!-- Stop Button (when streaming) -->
        <button
          v-if="streaming"
          class="flex-shrink-0 flex items-center justify-center w-9 h-9 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors cursor-pointer"
          title="停止生成"
          @click="emit('stop')"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        </button>

        <!-- Send Button -->
        <button
          v-else
          class="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl transition-all cursor-pointer"
          :class="
            inputText.trim() && !disabled
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
          "
          :disabled="!inputText.trim() || disabled"
          title="发送"
          @click="handleSend"
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
              d="M12 19V5m0 0l-7 7m7-7l7 7"
            />
          </svg>
        </button>
      </div>

      <!-- Tip -->
      <div class="text-center text-xs text-gray-400 mt-2">
        AI 可能会出错，请核实重要信息
      </div>
    </div>
  </div>
</template>
