<script setup>
import { ref, onMounted, computed } from 'vue';
import { CustomerService } from '@/service/CustomerService';

const customers = ref([]);
const searchQuery = ref(''); // Search term
const loading = ref(true);
const visible = ref(false);

const options = [
    { label: 'Daily', value: 'Daily' },
    { label: 'Weekly', value: 'Weekly' },
    { label: 'Monthly', value: 'Monthly' },
    { label: 'Yearly', value: 'Yearly' }
];

onMounted(() => {
    CustomerService.getCustomersMedium().then((data) => {
        customers.value = getCustomers(data);
        loading.value = false;
    });
});

const getCustomers = (data) => {
    return [...(data || [])].map((d) => {
        d.date = new Date(d.date); // Convert to Date object
        return d;
    });
};

// Function to format date to MM/DD/YYYY
const formatDate = (date) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Intl.DateTimeFormat('en-US', options).format(date);
};

// Computed property to filter customers based on the search query
const filteredCustomers = computed(() => {
    if (!searchQuery.value) {
        return customers.value; // No search query, return all customers
    }
    const query = searchQuery.value.toLowerCase();
    return customers.value.filter((customer) => {
        return (
            customer.representative.name.toLowerCase().includes(query) ||
            customer.area.toLowerCase().includes(query) ||
            customer.collected.toString().toLowerCase().includes(query)
        );
    });
});
</script>

<template>
    <div class="card shadow-md">
        <DataTable :value="filteredCustomers" paginator :rows="10" dataKey="id" filterDisplay="row" :loading="loading">

            <template #header>
                <div class="flex justify-end items-center space-x-4">
                    <!-- Search input -->
                    <InputText v-model="searchQuery" placeholder="Search..." class="w-48" />
                </div>
            </template>

            <template #empty> No customers found. </template>
            <template #loading> Loading customers data. Please wait. </template>

            <Column header="Customer Name" filterField="representative" style="min-width: 14rem">
                <template #body="{ data }">
                    <div class="flex items-center gap-2">
                        <span>{{ data.representative.name }}</span>
                    </div>
                </template>
            </Column>

            <Column field="collected" header="Total Amount Payable" style="min-width: 12rem">
                <template #body="{ data }">
                    ₱ {{ data.collected }}
                </template>
            </Column>

            <Column header="Action" style="min-width: 12rem">
                <template #body="{ data }">
                    <i class="pi pi-eye cursor-pointer text-blue-500" @click="visible = true"></i>
                </template>
            </Column>
        </DataTable>

        <!-- Modal -->
        <Dialog v-model:visible="visible" maximizable modal header="Customer" :style="{ width: '50rem' }"
            :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <DataTable :value="products" showGridlines tableStyle="min-width: 40rem">
                <Column field="code" header="Amount Payable"></Column>
                <Column field="code" header="Date"></Column>
                <Column field="name" header="Due Date"></Column>
            </DataTable>
        </Dialog>

    </div>
</template>
