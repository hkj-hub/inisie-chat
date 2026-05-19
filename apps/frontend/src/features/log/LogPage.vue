<template>
  <div class="log">
    <h1>ログ一覧</h1>

    <nav class="links">
      <RouterLink to="/">エントランスへ戻る</RouterLink>
    </nav>

    <section class="log-list">
      <p v-if="loading">読み込み中...</p>
      <p v-else-if="error" class="error">{{ error }}</p>
      <ul v-else>
        <li v-for="(entry, index) in logs" :key="index" class="log-entry">
          <span class="time">{{ formatDate(entry.timestamp) }}</span>
          <span class="name" :style="{ color: entry.color }">{{ entry.name }}</span>:
          <span class="message">{{ entry.message }}</span>
        </li>
        <li v-if="logs.length === 0">ログはありません</li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import type { LogEntry } from '@inisie-chat/shared'
import { fetchLogs } from './fetchLogs'
import { formatDate } from '../../shared/lib/formatDate'

const logs = ref<LogEntry[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

async function loadLogs(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    logs.value = await fetchLogs()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'エラーが発生しました'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadLogs()
})
</script>

<style scoped>
.log {
  max-width: 640px;
  margin: 0 auto;
  padding: 1rem;
}

.links {
  margin-bottom: 1rem;
}

ul {
  list-style: none;
  padding: 0;
}

.log-entry {
  padding: 0.25rem 0;
  border-bottom: 1px solid #eee;
}

.time {
  font-size: 0.8rem;
  color: #999;
  margin-right: 0.5rem;
}

.name {
  font-weight: bold;
}

.message {
  margin-left: 0.25rem;
}

.error {
  color: red;
}
</style>
