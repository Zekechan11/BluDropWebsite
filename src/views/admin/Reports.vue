<script setup>
import { ref, onMounted, computed } from 'vue';
import { CustomerService } from '@/service/CustomerService';

const customers = ref([]);
const dateFilter = ref('All'); // Dropdown value
const loading = ref(true);

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

// Function to calculate the start date based on the selected filter
const getStartDateFromFilter = (filter) => {
    const now = new Date();
    if (filter === 'Weekly') {
        return new Date(now.setDate(now.getDate() - 7));
    } else if (filter === 'Monthly') {
        return new Date(now.setMonth(now.getMonth() - 1));
    } else if (filter === 'Yearly') {
        return new Date(now.setFullYear(now.getFullYear() - 1));
    }
    return null; // 'All' or no filter
};

// Computed property to filter customers based on the date filter
const filteredCustomers = computed(() => {
    if (dateFilter.value === 'All') {
        return customers.value;
    }
    const startDate = getStartDateFromFilter(dateFilter.value);
    return customers.value.filter((customer) => {
        const customerDate = new Date(customer.date);
        return customerDate >= startDate;
    });
});
</script>

<template>
    <div class="card shadow-md">
        <DataTable  
            :value="filteredCustomers" 
            paginator 
            :rows="10" 
            dataKey="id" 
            filterDisplay="row" 
            :loading="loading">
            
            <template #header>
                <div class="flex justify-end items-center space-x-4">
                    <!-- Left Dropdown -->
                    <Select  
                        v-model="agentFilter" 
                        :options="agentOptions" 
                        optionLabel="label" 
                        optionValue="value" 
                        placeholder="Select Agent" 
                        class="w-48" />

                    <!-- Right Dropdown -->
                    <Select  
                        v-model="dateFilter" 
                        :options="options" 
                        optionLabel="label" 
                        optionValue="value" 
                        placeholder="Select Day" 
                        class="w-48" />
                </div>
            </template>
            
            <template #empty> No customers found. </template>
            <template #loading> Loading customers data. Please wait. </template>

            <Column header="Agent Name" filterField="representative" style="min-width: 14rem">
                <template #body="{ data }">
                    <div class="flex items-center gap-2">
                        <span>{{ data.representative.name }}</span>
                    </div>
                </template>
            </Column>

            <Column field="area" header="Area" style="min-width: 12rem">
                <template #body="{ data }">
                    {{ data.area }}
                </template>
            </Column>

            <Column field="collected" header="Gallons Collected" style="min-width: 12rem">
                <template #body="{ data }">
                    {{ Math.round(data.collected) }}
                </template>
            </Column>

            <Column field="collected" header="Gallons Delivered" style="min-width: 12rem">
                <template #body="{ data }">
                    {{ Math.round(data.collected) }}
                </template>
            </Column>

            <Column field="collected" header="Collected Amount" style="min-width: 12rem">
                <template #body="{ data }">
                    ₱ {{ data.collected }}
                </template>
            </Column>

            <Column header="Date" style="min-width: 12rem">
                <template #body="{ data }">
                    {{ formatDate(data.date) }}
                </template>
            </Column>
        </DataTable>

    </div>
</template>
