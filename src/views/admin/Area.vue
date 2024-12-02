<script setup>
import { ref, onMounted } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import axios from 'axios';

// Define the base URL for your API
const BASE_URL = 'http://localhost:9090'; // Replace with your actual API base URL

const toast = useToast();
const dt = ref();
const areas = ref([]);
const areaDialog = ref(false);
const deleteAreaDialog = ref(false);
const deleteAreasDialog = ref(false);
const area = ref({});
const selectedProducts = ref();
const filters = ref({
    'global': { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const submitted = ref(false);

const openNew = () => {
    area.value = {};
    submitted.value = false;
    areaDialog.value = true;
};

const hideDialog = () => {
    areaDialog.value = false;
    submitted.value = false;
};

const fetchAreas = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/area`); // Use the BASE_URL
        console.log('API Response:', response.data);

        if (Array.isArray(response.data)) {
            areas.value = response.data; // Ensure this is an array
        } else {
            console.error('Expected area to be an array, but got:', response.data);
            areas.value = []; // Default to empty array if not
        }
    } catch (error) {
        console.error('Error fetching area:', error);
    }
};

const saveArea = async () => {
    submitted.value = true;

    if (area.value.area && area.value.area.trim()) {
        try {
            if (area.value.id) {
                // Update existing area
                await axios.put(`${BASE_URL}/area/${area.value.id}`, area.value); // Use the BASE_URL
                areas.value[findIndexById(area.value.id)] = area.value; // Update the local state
                toast.add({ severity: 'success', summary: 'Successful', detail: 'Area Updated', life: 3000 });
            } else {
                // Create new area
                const response = await axios.post(`${BASE_URL}/area`, area.value); // Use the BASE_URL
                areas.value.push({ ...area.value, id: response.data.id }); // Add new area to the local state
                toast.add({ severity: 'success', summary: 'Successful', detail: 'Area Created', life: 3000 });
            }
        } catch (error) {
            console.error('Error saving area:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save area', life: 3000 });
        }

        areaDialog.value = false;
        area.value = {};
    }
};

const editArea = (selectedArea) => {
    area.value = { ...selectedArea };
    areaDialog.value = true;
};

const confirmDeleteArea = (selectedArea) => {
    area.value = selectedArea;
    deleteAreaDialog.value = true;
};

const deleteArea = async () => {
    try {
        await axios.delete(`${BASE_URL}/area/${area.value.id}`); // Use the BASE_URL
        areas.value = areas.value.filter(val => val.id !== area.value.id);
        deleteAreaDialog.value = false;
        area.value = {};
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Area Deleted', life: 3000 });
    } catch (error) {
        console.error('Error deleting area:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete area', life: 3000 });
    }
};

const confirmDeleteSelected = () => {
    deleteAreasDialog.value = true;
};

const deleteSelectedAreas = async () => {
    try {
        const deletePromises = selectedProducts.value.map(selected => axios.delete(`${BASE_URL}/area/${selected.id}`)); // Use the BASE_URL
        await Promise.all(deletePromises);
        areas.value = areas.value.filter(val => !selectedProducts.value.includes(val));
        deleteAreasDialog.value = false;
        selectedProducts.value = null;
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Selected Areas Deleted', life: 3000 });
    } catch (error) {
        console.error('Error deleting selected areas:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete selected areas', life: 3000 });
    }
};

const findIndexById = (id) => {
    return areas.value.findIndex(area => area.id === id);
};

// Fetch areas when the component is mounted
onMounted(() => {
    fetchAreas();
});
</script>


0<template>
    <div class="space">
        <h1 class="text-4xl font-semibold mb-6" style="color: #899499;">
            Area Data
        </h1>
    </div>
    <div>
        <div class="card shadow-md">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="New" icon="pi pi-plus" severity="success" class="mr-2" @click="openNew" />
                    <Button label="Delete" icon="pi pi-trash" severity="danger" @click="confirmDeleteSelected" :disabled="!selectedProducts || !selectedProducts.length" />
                </template>
            </Toolbar>

            <DataTable
                ref="dt"
                v-model:selection="selectedProducts"
                :value="areas"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} areas"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0 font-semibold">Manage Areas</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Search..." />
                        </IconField>
                    </div>
                </template>

                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column field="area" header="Area" sortable style="min-width: 16rem"></Column>
                <Column :exportable="false" header="Actions" style="min-width: 12rem;">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" v-tooltip.bottom="'Edit'" outlined rounded class="mr-2" @click="editArea(slotProps.data)" />
                        <Button icon="pi pi-trash" v-tooltip.bottom="'Delete'" outlined rounded severity="danger" @click="confirmDeleteArea(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="areaDialog" :style="{ width: '450px' }" header="Add Area" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="area" class="block font-semibold mb-3">Area</label>
                    <InputText id="area" v-model.trim="area.area" required="true" autofocus :invalid="submitted && !area.area" fluid />
                    <small v-if="submitted && !area.area" class="text-red-500">Area is required.</small>
                </div>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Save" icon="pi pi-check" @click="saveArea" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteAreaDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="area">Are you sure you want to delete <b>{{ area.area }}</b>?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteAreaDialog = false" />
                <Button label="Yes" icon="pi pi-check" @click="deleteArea" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteAreasDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="area">Are you sure you want to delete the selected areas?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteAreasDialog = false" />
                <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedAreas" />
            </template>
        </Dialog>
    </div>
</template>
