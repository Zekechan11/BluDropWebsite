<script setup>
import { ref } from 'vue';
import AgentMenuItem from './AgentMenuItem.vue';


const model = ref([
    {
        items: [
        
        { 
            label: 'Container on Loan', 
            icon: 'pi pi-fw pi-home', 
            to: '/agent/dashboard' 
        },

        { 
            label: 'Message', 
            icon: 'pi pi-fw pi-comment', 
            to: '/agent/message' 
        },

        { 
            label: 'History', 
            icon: 'pi pi-history', 
            to: '/agent/history' 
        },
        { 
            label: 'Scanner', 
            icon: 'pi pi-qrcode', 
            to: '/agent/scanner' 
        }
        
        ]
    },
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <AgentMenuItem v-if="!item.separator" :item="item" :index="i"></AgentMenuItem>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
