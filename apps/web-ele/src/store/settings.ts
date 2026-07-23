import type { ChatSettings } from '#/types/chat';

import { ref, watch } from 'vue';

import { defineStore } from 'pinia';

const STORAGE_KEY = 'ai-chat-settings';

const defaultSettings: ChatSettings = {
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 2048,
};

function loadSettings(): ChatSettings {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data
      ? { ...defaultSettings, ...JSON.parse(data) }
      : { ...defaultSettings };
  } catch {
    return { ...defaultSettings };
  }
}

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<ChatSettings>(loadSettings());

  watch(
    settings,
    (val) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
    },
    { deep: true },
  );

  function updateSettings(partial: Partial<ChatSettings>) {
    settings.value = { ...settings.value, ...partial };
  }

  function resetSettings() {
    settings.value = { ...defaultSettings };
  }

  return {
    settings,
    updateSettings,
    resetSettings,
  };
});
