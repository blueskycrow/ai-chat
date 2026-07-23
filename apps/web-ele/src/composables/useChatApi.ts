import type { OpenAIStreamChunk } from '#/types/chat';

import { ref } from 'vue';

import { useSettingsStore } from '#/store';

export function useChatApi() {
  const settingsStore = useSettingsStore();
  const isStreaming = ref(false);
  const abortController = ref<AbortController | null>(null);

  async function sendMessage(
    messages: Array<{ content: string; role: string }>,
    onChunk: (content: string) => void,
    onComplete: () => void,
    onError: (error: string) => void,
  ) {
    const { settings } = settingsStore;

    if (!settings.apiKey) {
      onError('请先在设置中配置 API Key');
      return;
    }

    abortController.value = new AbortController();
    isStreaming.value = true;

    try {
      const response = await fetch(
        `${settings.baseUrl.replace(/\/$/, '')}/chat/completions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${settings.apiKey}`,
          },
          body: JSON.stringify({
            model: settings.model,
            messages,
            temperature: settings.temperature,
            max_tokens: settings.maxTokens,
            stream: true,
          }),
          signal: abortController.value.signal,
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.error?.message ||
            `API 请求失败: ${response.status} ${response.statusText}`,
        );
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应流');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;
          if (!trimmed.startsWith('data: ')) continue;

          try {
            const chunk: OpenAIStreamChunk = JSON.parse(trimmed.slice(6));
            const content = chunk.choices?.[0]?.delta?.content;
            if (content) {
              onChunk(content);
            }
          } catch {
            // 忽略解析错误的 chunk
          }
        }
      }

      onComplete();
    } catch (error: any) {
      if (error.name === 'AbortError') {
        onComplete();
        return;
      }
      onError(error.message || '请求失败，请重试');
    } finally {
      isStreaming.value = false;
      abortController.value = null;
    }
  }

  function stopStreaming() {
    if (abortController.value) {
      abortController.value.abort();
      abortController.value = null;
    }
  }

  return {
    isStreaming,
    sendMessage,
    stopStreaming,
  };
}
