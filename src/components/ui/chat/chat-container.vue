<script setup>
defineProps({
    showMobileChat: Boolean
})
</script>

<template>
    <div :class="[
        'w-full overflow-auto h-[88vh] md:w-1/2 flex flex-col border border-gray-300 rounded-lg shadow-md min-h-0',
        showMobileChat ? 'hidden md:flex' : 'flex'
    ]">
        <div class="bg-blue-500 text-white font-semibold text-xl p-4 rounded-t-lg flex-shrink-0">Chat</div>
        <slot />
    </div>
</template>