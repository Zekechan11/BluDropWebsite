<script setup>
import { defineEmits, defineProps, ref } from 'vue';

const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    },
    refresh: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue', 'update:refresh']);

const isSpinning = ref(false);

const handleRefresh = () => {
    isSpinning.value = true;
    emit('update:refresh', true);
    
    setTimeout(() => {
        isSpinning.value = false;
    }, 2000);
};
</script>

<template>
    <div class="p-4 bg-white flex-shrink-0 flex items-center">
        <div class="relative mr-4 flex-1">
            <input 
                type="text" 
                :value="modelValue" 
                @input="emit('update:modelValue', $event.target.value)"
                placeholder="Search Messenger"
                class="w-full p-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
            <i class="pi pi-search absolute left-3 top-3 w-5 h-5 text-gray-400"></i>
            <button 
                v-if="modelValue" 
                @click="emit('update:modelValue', '')"
                class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
                <i class="pi pi-times w-5 h-5"></i>
            </button>
        </div>
        <button 
            @click="handleRefresh" 
            class="text-gray-400 hover:text-gray-600 relative"
        >
            <i 
                class="pi pi-sync w-5 h-5" 
                :class="{'spin': isSpinning}"
            ></i>
        </button>
    </div>
</template>

<style scoped>
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.spin {
    animation: spin 1s linear infinite;
}
</style>
