<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import axios from 'axios';

const apiUrl = 'http://localhost:9090'; // Update with your actual API base URL

const toast = useToast();
const dt = ref();
const inventorys = ref([]);
const inventoryDialog = ref(false);
const deleteInventoryDialog = ref(false);
const deleteInventorysDialog = ref(false);
const inventory = ref({});
const selectedInventorys = ref();
const submitted = ref(false);

const fetchInventory = async () => {
    try {
        const response = await axios.get(`${apiUrl}/api/get_inventory`);
        if (Array.isArray(response.data)) {
            inventorys.value = response.data.map(item => ({
                id: item.inventory_id,
                item: item.item,
                noOfItems: item.no_of_items,
            }));
        } else {
            inventorys.value = [];
        }
    } catch (error) {
        console.error('Error fetching inventory:', error);
    }
};

onMounted(() => {
    fetchInventory();
});

const saveInventory = async () => {
    
};

const openNew = () => {
    inventory.value = {};
    submitted.value = false;
    inventoryDialog.value = true;
};

const hideDialog = () => {
    inventoryDialog.value = false;
    submitted.value = false;
};

const editInventory = (prod) => {
    inventory.value = {
        id: prod.id,
        item: prod.Item, // Map `Item` to `item`
        noOfItems: prod.noOfItems, // Use as is
    };
    inventoryDialog.value = true;
};

// Confirm delete dialog
const confirmDeleteInventory = (prod) => {
    inventory.value = prod;
    deleteInventoryDialog.value = true;
};

const deleteInventory = async () => {
    try {
        await axios.delete(`${apiUrl}/DeleteInventory/${inventory.value.id}`);
        inventorys.value = inventorys.value.filter(p => p.id !== inventory.value.id);
        deleteInventoryDialog.value = false;
        inventory.value = {};
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Inventory Deleted', life: 3000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete inventory.', life: 3000 });
    }
};

const confirmDeleteSelected = () => {
    deleteInventorysDialog.value = true;
};

const deleteSelectedInventorys = async () => {
    try {
        const promises = selectedInventorys.value.map(prod => 
            axios.delete(`${apiUrl}/DeleteInventory/${prod.id}`));
        await Promise.all(promises);
        inventorys.value = inventorys.value.filter(p => !selectedInventorys.value.includes(p));
        deleteInventorysDialog.value = false;
        selectedInventorys.value = null;
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Inventorys Deleted', life: 3000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete selected inventorys.', life: 3000 });
    }
};
</script>

<template>
    <div class="space">
        <h1 class="text-4xl font-semibold mb-6" style="color: #899499;">
            Inventory
        </h1>
    </div>
    <div>
        <div class="card shadow-md">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="New" icon="pi pi-plus" severity="success" class="mr-2" @click="openNew" />
                    <Button label="Delete" icon="pi pi-trash" severity="danger" @click="confirmDeleteSelected" :disabled="!selectedInventorys || !selectedInventorys.length" />
                </template>
            </Toolbar>

            <DataTable
                ref="dt"
                v-model:selection="selectedInventorys"
                :value="inventorys"
                dataKey="id"
                :paginator="true"
                :rows="10"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} inventorys"
            >

                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column field="item" header="Items" sortable style="min-width: 16rem"></Column>
                <Column field="noOfItems" header="No of Items" sortable style="min-width: 16rem"></Column>
  
                <Column :exportable="false" header="Actions" style="min-width: 12rem;">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editInventory(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteInventory(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="inventoryDialog" :style="{ width: '450px' }" header="Inventory" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="Item" class="block font-semibold mb-3">Items</label>
                    <InputText id="item" v-model.trim="inventory.item" required="true" autofocus :invalid="submitted && !inventory.item" fluid />
                    <small v-if="submitted && !inventory.item" class="text-red-500">Item is required.</small>
                </div>
                <div>
                    <label for="noOfItems" class="block font-semibold mb-3">No of Items</label>
                    <InputText id="noOfItems" v-model.trim="inventory.noOfItems" required="true" autofocus :invalid="submitted && !inventory.noOfItems" fluid />
                    <small v-if="submitted && !inventory.noOfItems" class="text-red-500">No of Item is required.</small>
                </div>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Save" icon="pi pi-check" @click="saveInventory" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteInventoryDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="inventory"
                    >Are you sure you want to delete <b>{{ inventory.item }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteInventoryDialog = false" />
                <Button label="Yes" icon="pi pi-check" @click="deleteInventory" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteInventorysDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="inventory">Are you sure you want to delete the selected inventorys?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteInventorysDialog = false" />
                <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedInventorys" />
            </template>
        </Dialog>
	</div>
</template>
