<script lang="ts" setup>
const emit = defineEmits<{
  sendSuggestion: [prompt: string];
}>();

function handleClick(item: (typeof suggestions)[number]) {
  emit('sendSuggestion', item.prompt);
}

const suggestions = [
  {
    icon: '💡',
    title: '帮我写一段代码',
    desc: '用 Python 实现快速排序算法',
    prompt: '帮我用 Python 写一段快速排序算法，要有详细注释',
  },
  {
    icon: '📝',
    title: '写一篇文章',
    desc: '关于人工智能的未来发展',
    prompt: '写一篇关于人工智能未来发展趋势的文章，800字左右',
  },
  {
    icon: '🔍',
    title: '解释一个概念',
    desc: '什么是大语言模型？',
    prompt: '用通俗易懂的语言解释什么是大语言模型（LLM），它的工作原理是什么？',
  },
  {
    icon: '🎯',
    title: '帮我翻译',
    desc: '中英文互译',
    prompt: '请帮我将以下内容翻译成英文：人工智能正在改变我们的生活方式',
  },
];
</script>

<template>
  <div class="welcome-screen flex-1 flex items-center justify-center p-8">
    <div class="max-w-2xl w-full text-center">
      <!-- Logo & Title -->
      <div class="mb-8">
        <div
          class="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg"
        >
          <svg
            class="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          AI Chat
        </h1>
        <p class="text-gray-500 dark:text-gray-400">
          智能对话助手，支持多种大语言模型
        </p>
      </div>

      <!-- Suggestion Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        <button
          v-for="item in suggestions"
          :key="item.title"
          class="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all text-left cursor-pointer group"
          @click="handleClick(item)"
        >
          <span class="text-2xl flex-shrink-0">{{ item.icon }}</span>
          <div class="min-w-0">
            <div
              class="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
            >
              {{ item.title }}
            </div>
            <div class="text-xs text-gray-400 mt-0.5">{{ item.desc }}</div>
          </div>
        </button>
      </div>

      <!-- Features -->
      <div class="flex items-center justify-center gap-6 text-xs text-gray-400">
        <span class="flex items-center gap-1">
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
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          流式响应
        </span>
        <span class="flex items-center gap-1">
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
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          数据安全
        </span>
        <span class="flex items-center gap-1">
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
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
          Markdown 渲染
        </span>
        <span class="flex items-center gap-1">
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
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
          明暗主题
        </span>
      </div>
    </div>
  </div>
</template>
