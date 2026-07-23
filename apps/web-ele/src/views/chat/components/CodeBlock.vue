<script lang="ts" setup>
import { ref } from 'vue';

const props = defineProps<{
  code: string;
  language: string;
}>();

const copied = ref(false);

async function copyCode() {
  try {
    await navigator.clipboard.writeText(props.code);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {
    // fallback
    const textarea = document.createElement('textarea');
    textarea.value = props.code;
    document.body.append(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  }
}
</script>

<template>
  <div
    class="code-block relative my-3 rounded-lg overflow-hidden bg-[#1e1e2e] dark:bg-[#11111b]"
  >
    <div
      class="flex items-center justify-between px-4 py-2 bg-[#313244] dark:bg-[#181825] text-xs text-gray-300"
    >
      <span class="font-mono">{{ language || 'code' }}</span>
      <button
        class="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-white/10 transition-colors cursor-pointer"
        @click="copyCode"
      >
        <span v-if="copied" class="text-green-400">✓ 已复制</span>
        <span v-else>📋 复制</span>
      </button>
    </div>
    <pre
      class="p-4 overflow-x-auto text-sm leading-relaxed"
    ><code v-html="code" class="font-mono"></code></pre>
  </div>
</template>
