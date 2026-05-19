<template>
  <div class="entrance">
    <h1>Inisie Chat</h1>

    <section class="join-form">
      <h2>入室</h2>
      <div class="form-row">
        <label for="name">名前</label>
        <input id="name" v-model="name" type="text" placeholder="名前を入力してください" />
      </div>
      <div class="form-row">
        <label for="color">色</label>
        <select id="color" v-model="color">
          <option v-for="c in COLORS" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>
      <button :disabled="name.trim() === ''" @click="handleEnter">入室</button>
    </section>

    <section class="chat-preview">
      <h2>チャット一覧（プレビュー）</h2>
      <p v-if="loading">読み込み中...</p>
      <p v-else-if="error">{{ error }}</p>
      <ul v-else>
        <li v-for="(entry, index) in chats" :key="index">
          <span class="time">{{ formatDate(entry.timestamp) }}</span>
          <span :style="{ color: entry.color }">{{ entry.name }}</span>:
          {{ entry.message }}
        </li>
        <li v-if="chats.length === 0">まだチャットはありません</li>
      </ul>
    </section>

    <nav class="links">
      <RouterLink to="/log">ログ画面へ</RouterLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import type { ChatEntry } from '@inisie-chat/shared'
import { fetchChats } from './fetchChats'
import { formatDate } from '../../shared/lib/formatDate'

const COLORS = [
  'red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'gray',
  'crimson', 'coral', 'salmon', 'tomato', 'chocolate', 'goldenrod', 'olive',
  'teal', 'cyan', 'turquoise', 'navy', 'indigo', 'violet', 'magenta', 'maroon',
  'lime', 'aqua', 'silver', 'darkgreen', 'darkblue', 'hotpink',
] as const

const router = useRouter()
const name = ref('')
const color = ref<string>('red')
const chats = ref<ChatEntry[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

async function loadChats(): Promise<void> {
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

function handleEnter(): void {
  if (name.value.trim() === '') return
  sessionStorage.setItem('chatUser', JSON.stringify({ name: name.value.trim(), color: color.value }))
  void router.push('/chat')
}

onMounted(() => {
  void loadChats()
})
</script>

<style scoped>
.entrance {
  max-width: 640px;
  margin: 0 auto;
  padding: 1rem;
}

.join-form,
.chat-preview {
  margin-bottom: 1.5rem;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.form-row label {
  width: 4rem;
  font-weight: bold;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  padding: 0.25rem 0;
  border-bottom: 1px solid #eee;
}

.time {
  font-size: 0.8rem;
  color: #999;
  margin-right: 0.5rem;
}

.links {
  margin-top: 1rem;
}
</style>
