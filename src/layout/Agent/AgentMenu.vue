<script setup>
import { ref } from 'vue';
import AgentMenuItem from './AgentMenuItem.vue';


const model = ref([
    {
        items: [
        
        { 
            label: 'Dashboard', 
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
        },
        { 
            label: 'Create Customer', 
            icon: 'pi pi-user-plus', 
            to: '/agent/create-customer' 
        },
        { 
            label: 'Customer Record', 
            icon: 'pi pi-users', 
            to: '/agent/record' 
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
