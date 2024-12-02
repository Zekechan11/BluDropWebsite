<script setup>
import { ref, onMounted } from 'vue';

const products = ref([]);
const selectedProducts = ref([]);

onMounted(() => {
    // Add some manual results for demonstration
    products.value = [
        {
            code: '1',
            name: 'Zeke',
            address: 'Guadalupe Bogo City',
        },
        {
            code: '2',
            name: 'Joe',
            address: 'Nailon Bogo City',
        },
        {
            code: '3',
            name: 'Sakura',
            address: 'Lapaz Bogo City',
        },
        {
            code: '4',
            name: 'Liam',
            address: 'San Francisco, Cebu',
        },
        {
            code: '5',
            name: 'Mia',
            address: 'Talamban, Cebu City',
        },
        {
            code: '6',
            name: 'Noah',
            address: 'Mandaue City',
        },
        {
            code: '7',
            name: 'Olivia',
            address: 'Baclayon, Bohol',
        }
    ];
});

const dt = ref();
</script>


<template>
    <div class="space">
        <h1 class="text-4xl font-semibold mb-6" style="color: #899499;">
            Active Customer
        </h1>
    </div>
    <div>
        <div class="card shadow-md">
            <DataTable
                ref="dt"
                v-model:selection="selectedProducts"
                :value="products"
                dataKey="code"
                :paginator="true"
                :rows="10"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
            >
                <Column field="name" header="Name" sortable style="min-width: 12rem"></Column>
                <Column field="address" header="Address" sortable style="min-width: 16rem"></Column>
                <Column header="Status" style="min-width: 12rem">
                    <template #body="{ data }">
                        <span class="status-active font-semibold">Active</span>
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>
</template>

<style scoped>
.status-active {
    background-color: #28a745; /* Green background */
    color: white; /* White text color */
    padding: 0.5em 1em; /* Add some padding */
    border-radius: 0.25em; /* Rounded corners */
}
</style>
