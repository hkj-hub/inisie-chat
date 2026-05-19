<template>
  <div class="chat">
    <header class="chat-header">
      <h1>Inisie Chat</h1>
      <div class="user-info">
        <span :style="{ color: user.color }">{{ user.name }}</span> さんでログイン中
      </div>
      <button class="leave-btn" @click="handleLeave">退室</button>
    </header>

    <section class="chat-list">
      <p v-if="loading">読み込み中...</p>
      <p v-else-if="error" class="error">{{ error }}</p>
      <ul v-else>
        <ChatMessage v-for="(entry, index) in chats" :key="index" :entry="entry" />
        <li v-if="chats.length === 0">まだチャットはありません</li>
      </ul>
    </section>

    <footer class="chat-input">
      <input
        v-model="message"
        type="text"
        placeholder="メッセージを入力してください"
        @keydown.enter="handleSend"
      />
      <button @click="handleSend">送信</button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import type { ChatEntry } from '@inisie-chat/shared'
import { fetchChats } from './fetchChats'
import { postChat } from './postChat'
import ChatMessage from './ChatMessage.vue'

const router = useRouter()

const raw = sessionStorage.getItem('chatUser')
const user = raw ? (JSON.parse(raw) as { name: string; color: string }) : null

if (!user) {
  void router.replace('/')
}

const safeUser = user ?? { name: '', color: 'red' }

const chats = ref<ChatEntry[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const message = ref('')

async function refresh(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    chats.value = await fetchChats()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'エラーが発生しました'
  } finally {
    loading.value = false
  }
}

async function handleSend(): Promise<void> {
  const text = message.value.trim()
  if (text === '') {
    await refresh()
    return
  }
  try {
    await postChat(safeUser.name, safeUser.color, text)
    message.value = ''
    await refresh()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'エラーが発生しました'
  }
}

function handleLeave(): void {
  sessionStorage.removeItem('chatUser')
  void router.push('/')
}

let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  void refresh()
  timer = setInterval(() => {
    void refresh()
  }, 60_000)
})

onUnmounted(() => {
  if (timer !== undefined) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.chat {
  max-width: 640px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  height: 100vh;
  box-sizing: border-box;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.chat-header h1 {
  margin: 0;
}

.user-info {
  flex: 1;
}

.leave-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
  border-radius: 4px;
}

.chat-list {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #ddd;
  padding: 0.5rem;
  margin-bottom: 1rem;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.chat-input {
  display: flex;
  gap: 0.5rem;
}

.chat-input input {
  flex: 1;
  padding: 0.5rem;
}

.error {
  color: red;
}
</style>
