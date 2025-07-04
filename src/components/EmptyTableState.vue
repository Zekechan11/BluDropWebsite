<script setup>
defineProps({
    icon: {
        type: String,
        default: 'pi-info-circle'
    },
    title: {
        type: String,
        default: 'No results found.'
    },
    description: {
        type: String,
        default: ''
    }
})
</script>

<template>
    <div class="flex flex-col items-center justify-center text-gray-500 py-8 space-y-2">
        <i :class="`pi ${icon} text-3xl`"></i>
        <span class="text-lg font-semibold">{{ title }}</span>
        <span v-if="description" class="text-sm max-w-xs text-center">
            {{ description }}
        </span>
    </div>
</template>
