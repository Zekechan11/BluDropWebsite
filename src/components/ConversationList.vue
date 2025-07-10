<script setup>
import { ChatEmpty, ChatItem } from './ui/chat';

defineProps({
  conversations: Array,
  filteredConversations: Array,
  searchQuery: String,
  selectedConversation: Object,
});

const emit = defineEmits(['selectConversation', 'clearSearch']);

</script>

<template>
  <div class="overflow-y-auto flex-grow min-h-0">
    <ChatEmpty
      v-if="filteredConversations.length === 0 && searchQuery"
      icon="pi-search"
      title="No conversations found"
      subtitle="Try adjusting your search or check back later"
      buttonText="Clear Search"
      :showButton="true"
      @buttonClick="$emit('clearSearch')"
    />

    <ChatEmpty
      v-else-if="conversations.length === 0"
      icon="pi-comment"
      title="No conversations yet"
      subtitle="Conversations will appear here when customers start chatting"
      :showButton="false"
    />

    <template v-else>
      <ChatItem
        v-for="(conversation, index) in filteredConversations"
        :key="index"
        :conversation="conversation"
        :isSelected="selectedConversation === conversation"
        @select="$emit('selectConversation', $event)"
      />
    </template>
  </div>
</template>
