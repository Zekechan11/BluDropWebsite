<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        items: [
            { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/views/dashboard' },
            { label: 'Area', icon: 'pi pi-fw pi-id-card', to: '/admin/area' },
            {
                label: 'Customer',
                icon: 'pi pi-user-plus',
                to: '/admin/customer/add-customer', 
            },
           
            { label: 'Agents', icon: 'pi pi-users', to: '/admin/add-agent' },
            { label: 'Staff', icon: 'pi pi-users', to: '/admin/add-staff' },
            { label: 'Remittance', icon: 'pi pi-calendar', to: '/admin/add-remittance' },
            {
                label: 'Manage',
                icon: 'pi pi-stopwatch',
                items: [
                    { 
                        label: 'Inventory', 
                        icon: 'pi pi-th-large',  
                        to: '/admin/add-inventory', 
                        class: 'rotated-icon' 
                    },
                    {
                        label: 'FGS',
                        icon: 'pi pi-list',
                        to: '/admin/fgs-loan'
                    }
                ]
            },
            { label: 'Sales', icon: 'pi pi-money-bill', to: '/admin/sales' },
            // { label: 'Reports', icon: 'pi pi-file', to: '/admin/reports' },
            { label: 'Message', icon: 'pi pi-comment', to: '/admin/message' }
            
        ]
    },
    
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
