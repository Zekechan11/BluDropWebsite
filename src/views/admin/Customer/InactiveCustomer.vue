<script setup>
import { ref, onMounted, computed } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';

const customers = ref([]);
const filters = ref({
    name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    representative: { value: null, matchMode: FilterMatchMode.IN },
    status: { value: null, matchMode: FilterMatchMode.EQUALS },
    days: { value: null }  // New filter for days
});

const statuses = ref(['This Week', 'This Month', 'This Year']);
const loading = ref(true);
const daysOptions = Array.from({ length: 12 }, (_, i) => i + 2); // Days from 1 to 12

// Sample manual data for testing
const manualCustomers = [
    {
        id: 1,
        representative: { name: 'Jemar Diamante' },
        address: "Gairan, Bogo City, Cebu",
        status: 'Inactive',
        col: '10',
        date: new Date('2024-10-09') // Inactive this week
    },
    {
        id: 2,
        representative: { name: 'Bob Johnson' },
        address: "Lapaz, Bogo City, Cebu",
        status: 'Inactive',
        col: '2',
        date: new Date('2024-10-11') // Inactive this week
    },
    {
        id: 3,
        representative: { name: 'Charlie Brown' },
        address: "Lapaz, Bogo City, Cebu",
        status: 'Inactive',
        col: '5',
        date: new Date('2024-10-13') // Not inactive this week
    }
];

onMounted(() => {
    customers.value = manualCustomers; // Load manual data directly
    loading.value = false;
});

// Helper function to determine if a date is within the current week
const isDateInCurrentWeek = (date) => {
    const startOfWeek = new Date('2024-10-08'); // Set to the first day of the week you want to check (Tuesday)
    const endOfWeek = new Date('2024-10-12'); // Set to the last day of the week (Saturday)

    return date >= startOfWeek && date <= endOfWeek;
};

// Computed property to filter customers based on status and days
const filteredCustomers = computed(() => {
    let result = customers.value;

    // Filter by status if specified
    if (filters.value.status.value) {
        result = result.filter(customer => customer.status === filters.value.status.value);
    }

    // Filter by days specifically for this week
    if (filters.value.days.value) {
        result = result.filter(customer => isDateInCurrentWeek(customer.date));
    }

    return result;
});

// Define the getSeverity function
const getSeverity = (status) => {
    switch (status) {
        case 'Inactive':
            return 'danger';
        default:
            return null; // Or handle other statuses
    }
};

// Define filterCallback method (optional)
const filterCallback = () => {
    // Optional: Handle additional filtering logic here if needed
    console.log("Filter updated:", filters.value);
};
</script>

<template>
    <div class="space">
        <h1 class="text-4xl font-semibold mb-6" style="color: #899499;">
            Inactive Customer
        </h1>
    </div>
    <div class="card shadow-md">
        <DataTable v-model:filters="filters" :value="filteredCustomers" paginator :rows="10" dataKey="id" filterDisplay="row" :loading="loading">
            <template #header>
                <div class="flex justify-between items-center">
                    <div class="flex">
                        <Select v-model="filters['status'].value" @change="filterCallback" :options="statuses" placeholder="Select Status" style="min-width: 12rem" :showClear="true">
                            <template #option="slotProps">
                                <Tag :value="slotProps.option" :severity="getSeverity(slotProps.option)" />
                            </template>
                        </Select>
                        <Select v-model="filters['days'].value" @change="filterCallback" :options="daysOptions" placeholder="Weeks" style="min-width: 10rem" :showClear="true">
                            <template #option="slotProps">
                                <span>{{ slotProps.option }} Weeks</span>
                            </template>
                        </Select>
                    </div>
                </div>
            </template>
            <template #empty> No customers found. </template>
            <template #loading> Loading customers data. Please wait. </template>

            <Column header="Customer" filterField="representative" :showFilterMenu="false" style="min-width: 14rem">
                <template #body="{ data }">
                    <div class="flex items-center gap-2">
                        <span>{{ data.representative.name }}</span>
                    </div>
                </template>
            </Column>

            <!-- Corrected Address Column -->
            <Column header="Address" filterField="address" :showFilterMenu="false" style="min-width: 14rem">
                <template #body="{ data }">
                    <div class="flex items-center gap-2">
                        <span>{{ data.address }}</span>
                    </div>
                </template>
            </Column>

            <Column header="COL" filterField="address" :showFilterMenu="false" style="min-width: 14rem">
                <template #body="{ data }">
                    <Tag :value="data.col" :severity="getSeverity(data.col)" />
                </template>
            </Column>

            <Column field="status" header="Status" :showFilterMenu="false" style="min-width: 12rem">
                <template #body="{ data }">
                    <Tag :value="data.status" :severity="getSeverity(data.status)" />
                </template>
            </Column>
        </DataTable>
    </div>
</template>

