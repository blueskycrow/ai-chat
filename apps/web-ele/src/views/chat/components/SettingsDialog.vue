<script lang="ts" setup>
import { reactive, watch } from 'vue';

import {
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElOption,
  ElSelect,
  ElSlider,
} from 'element-plus';

import { useSettingsStore } from '#/store';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const settingsStore = useSettingsStore();

const form = reactive({
  apiKey: settingsStore.settings.apiKey,
  baseUrl: settingsStore.settings.baseUrl,
  model: settingsStore.settings.model,
  temperature: settingsStore.settings.temperature,
  maxTokens: settingsStore.settings.maxTokens,
});

// 同步 store -> form
watch(
  () => settingsStore.settings,
  (val) => {
    form.apiKey = val.apiKey;
    form.baseUrl = val.baseUrl;
    form.model = val.model;
    form.temperature = val.temperature;
    form.maxTokens = val.maxTokens;
  },
  { deep: true },
);

function handleSave() {
  settingsStore.updateSettings({ ...form });
  emit('update:modelValue', false);
}

function handleReset() {
  settingsStore.resetSettings();
}

const modelOptions = [
  'gpt-3.5-turbo',
  'gpt-4',
  'gpt-4-turbo',
  'gpt-4o',
  'gpt-4o-mini',
  'deepseek-chat',
  'deepseek-coder',
  'qwen-turbo',
  'qwen-plus',
  'qwen-max',
];
</script>

<template>
  <ElDialog
    :model-value="props.modelValue"
    title="API 设置"
    width="520px"
    :close-on-click-modal="false"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <ElForm label-width="100px" label-position="top" class="space-y-1">
      <ElFormItem label="API Key">
        <ElInput
          v-model="form.apiKey"
          type="password"
          show-password
          placeholder="sk-..."
          clearable
        />
        <div class="text-xs text-gray-400 mt-1">
          支持 OpenAI 兼容格式的 API Key
        </div>
      </ElFormItem>

      <ElFormItem label="Base URL">
        <ElInput
          v-model="form.baseUrl"
          placeholder="https://api.openai.com/v1"
          clearable
        />
        <div class="text-xs text-gray-400 mt-1">
          可配置为任意 OpenAI 兼容的 API 地址（如 DeepSeek、通义千问、Ollama
          等）
        </div>
      </ElFormItem>

      <ElFormItem label="模型">
        <ElSelect
          v-model="form.model"
          filterable
          allow-create
          placeholder="选择或输入模型名称"
          class="w-full"
        >
          <ElOption v-for="m in modelOptions" :key="m" :label="m" :value="m" />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="Temperature">
        <ElSlider
          v-model="form.temperature"
          :min="0"
          :max="2"
          :step="0.1"
          show-input
        />
      </ElFormItem>

      <ElFormItem label="Max Tokens">
        <ElInputNumber
          v-model="form.maxTokens"
          :min="256"
          :max="128000"
          :step="256"
          class="w-full"
        />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <div class="flex justify-between">
        <ElButton @click="handleReset">恢复默认</ElButton>
        <div class="flex gap-2">
          <ElButton @click="emit('update:modelValue', false)">取消</ElButton>
          <ElButton type="primary" @click="handleSave">保存</ElButton>
        </div>
      </div>
    </template>
  </ElDialog>
</template>
