<script setup>
import { ref } from 'vue';

import MenuItem from './MenuItem.vue';

const model = ref([
    {
        items: [
        
        { 
            label: 'Dashboard', 
            icon: 'pi pi-fw pi-home', 
            to: '/user/dashboard' 
        },

        { 
            label: 'Message', 
            icon: 'pi pi-fw pi-comment', 
            to: '/user/messages' 
        }
        
        ]
    },
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <menu-item v-if="!item.separator" :item="item" :index="i"></menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
