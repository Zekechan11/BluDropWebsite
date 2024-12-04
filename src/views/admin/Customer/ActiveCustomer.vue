<script setup>
import { ref, onMounted } from 'vue';

const products = ref([]);
const selectedProducts = ref([]);

onMounted(() => {
    // Add some manual results for demonstration
    products.value = [
        {
            code: '1',
            name: 'Ezekiel Angelo Pelayo',
            address: 'Guadalupe, Bogo City, Cebu',
        },
        {
            code: '2',
            name: 'Karl Lawrenz Pino',
            address: 'Nailon, Bogo City, Cebu',
        },
        {
            code: '3',
            name: 'Anton Retuya',
            address: 'Lapaz, Bogo City, Cebu',
        },

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
