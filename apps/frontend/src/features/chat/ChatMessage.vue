<template>
  <li class="chat-message">
    <span class="time">{{ formatDate(entry.timestamp) }}</span>
    <span class="name" :style="{ color: entry.color }">{{ entry.name }}</span>:
    <span class="message">{{ entry.message }}</span>
  </li>
</template>

<script setup lang="ts">
import type { ChatEntry } from '@inisie-chat/shared'
import { formatDate } from '../../shared/lib/formatDate'

defineProps<{
  entry: ChatEntry
}>()
</script>

<style scoped>
.chat-message {
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
</style>
