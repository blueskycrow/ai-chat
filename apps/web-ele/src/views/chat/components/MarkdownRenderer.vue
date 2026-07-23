<script lang="ts" setup>
import { computed } from 'vue';

import hljs from 'highlight.js';
import MarkdownIt from 'markdown-it';

import 'highlight.js/styles/github-dark.css';

const props = defineProps<{
  content: string;
}>();

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  highlight(str: string, lang: string) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch {
        // fall through
      }
    }
    try {
      return hljs.highlightAuto(str).value;
    } catch {
      return str;
    }
  },
});

// 自定义链接在新标签页打开
const defaultRender =
  md.renderer.rules.link_open ||
  function (tokens, idx, options, _env, self) {
    return self.renderToken(tokens, idx, options);
  };

md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  const token = tokens[idx];
  if (token) {
    const aIndex = token.attrIndex('target');
    if (aIndex < 0) {
      token.attrPush(['target', '_blank']);
    } else if (token.attrs) {
      token.attrs[aIndex] = ['target', '_blank'];
    }
    token.attrPush(['rel', 'noopener noreferrer']);
  }
  return defaultRender(tokens, idx, options, env, self);
};

const renderedHtml = computed(() => {
  if (!props.content) return '';
  return md.render(props.content);
});
</script>

<template>
  <div
    class="markdown-body prose prose-sm dark:prose-invert max-w-none"
    v-html="renderedHtml"
  ></div>
</template>

<style scoped>
.markdown-body :deep(pre) {
  padding: 0 !important;
  margin: 0 !important;
  background: transparent !important;
}

.markdown-body :deep(code) {
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
}

.markdown-body :deep(p code) {
  padding: 0.2em 0.4em;
  font-size: 85%;
  background: rgb(175 184 193 / 20%);
  border-radius: 6px;
}

.markdown-body :deep(pre code) {
  display: block;
  padding: 1em;
  overflow-x: auto;
  background: #1e1e2e;
  border-radius: 8px;
}

.markdown-body :deep(table) {
  width: 100%;
  margin: 1em 0;
  border-collapse: collapse;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  padding: 8px 12px;
  text-align: left;
  border: 1px solid rgb(128 128 128 / 30%);
}

.markdown-body :deep(th) {
  font-weight: 600;
  background: rgb(128 128 128 / 10%);
}

.markdown-body :deep(blockquote) {
  padding-left: 1em;
  margin: 1em 0;
  color: rgb(128 128 128 / 80%);
  border-left: 4px solid rgb(128 128 128 / 40%);
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 1.5em;
}

.markdown-body :deep(li) {
  margin: 0.25em 0;
}

.markdown-body :deep(a) {
  color: #58a6ff;
  text-decoration: none;
}

.markdown-body :deep(a:hover) {
  text-decoration: underline;
}
</style>
