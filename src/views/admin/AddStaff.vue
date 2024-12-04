<script setup>
import axios from 'axios';
import { ref, onMounted } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';

const apiBaseUrl = 'http://localhost:5089/api/Staff'; // Replace with your API's base URL

const toast = useToast();
const dt = ref();
const products = ref([]);
const productDialog = ref(false);
const deleteProductDialog = ref(false);
const deleteProductsDialog = ref(false);
const product = ref({});
const selectedProducts = ref([]);
const filters = ref({
    'global': { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const submitted = ref(false);

onMounted(async () => {
    try {
        const response = await axios.get(`${apiBaseUrl}/GetStaffs`);
        products.value = response.data.map(item => ({   
            id: item.staffId,
            staffName: item.staffName,
            address: item.address,
        }));
    } catch (error) {
        console.error("Failed to fetch staff data:", error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load staff data', life: 3000 });
    }
});

const openNew = () => {
    product.value = {};
    submitted.value = false;
    productDialog.value = true;
};

const hideDialog = () => {
    productDialog.value = false;
    submitted.value = false;
};

const saveProduct = async () => {
    submitted.value = true;

    if (product?.value.staffName?.trim()) {
        try {
            if (product.value.id) {
                // Update staff
                await axios.put(`${apiBaseUrl}/UpdateStaff/${product.value.id}`, {
                    staffName: product.value.staffName,
                    address: product.value.address,
                });
                products.value = products.value.map(item =>
                    item.id === product.value.id ? product.value : item
                );
                toast.add({ severity: 'success', summary: 'Successful', detail: 'Staff Updated', life: 3000 });
            } else {
                // Add new staff
                const response = await axios.post(`${apiBaseUrl}/SaveStaff`, {
                    staffName: product.value.staffName,
                    address: product.value.address,
                });
                const newStaff = response.data;
                products.value.push({
                    id: newStaff.staffId,
                    staffName: newStaff.staffName,
                    address: newStaff.address,
                });
                toast.add({ severity: 'success', summary: 'Successful', detail: 'Staff Added', life: 3000 });
            }
            productDialog.value = false;
            product.value = {};
        } catch (error) {
            console.error("Failed to save staff:", error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save staff', life: 3000 });
        }
    }
};

const editProduct = (prod) => {
    product.value = { ...prod };
    productDialog.value = true;
};

const confirmDeleteProduct = (prod) => {
    product.value = prod;
    deleteProductDialog.value = true;
};

const deleteProduct = async () => {
    try {
        await axios.delete(`${apiBaseUrl}/DeleteStaff/${product.value.id}`);
        products.value = products.value.filter(val => val.id !== product.value.id);
        deleteProductDialog.value = false;
        product.value = {};
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Staff Deleted', life: 3000 });
    } catch (error) {
        console.error("Failed to delete staff:", error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete staff', life: 3000 });
    }
};

const confirmDeleteSelected = () => {
    deleteProductsDialog.value = true;
};

const deleteSelectedProducts = async () => {
    try {
        for (const selected of selectedProducts.value) {
            await axios.delete(`${apiBaseUrl}/DeleteStaff/${selected.id}`);
        }
        products.value = products.value.filter(val => !selectedProducts.value.includes(val));
        deleteProductsDialog.value = false;
        selectedProducts.value = null;
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Selected Staff Deleted', life: 3000 });
    } catch (error) {
        console.error("Failed to delete selected staff:", error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete selected staff', life: 3000 });
    }
};
</script>



<template>
    <div class="space">
        <h1 class="text-4xl font-semibold mb-6" style="color: #899499;">
            Add Staff
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
                :value="products"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0 font-semibold">Manage Staff</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Search..." />
                        </IconField>
                    </div>
                </template>

                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>  
                <Column field="staffName" header="Staff Name" sortable style="min-width: 12rem"></Column>
                <Column field="address" header="Address" sortable style="min-width: 16rem"></Column>
  
                <Column :exportable="false" header="Actions" style="min-width: 12rem;">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" v-tooltip.bottom="'Edit'" outlined rounded class="mr-2" @click="editProduct(slotProps.data)" />
                        <Button icon="pi pi-trash" v-tooltip.bottom="'Delete'" outlined rounded severity="danger" @click="confirmDeleteProduct(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="productDialog" :style="{ width: '450px' }" header="Add Staff" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="staffName" class="block font-semibold mb-3">Staff Name</label>
                    <InputText id="staffName" v-model.trim="product.staffName" required="true" autofocus :invalid="submitted && !product.staffName" fluid />
                    <small v-if="submitted && !product.staffName" class="text-red-500">Name is required.</small>
                </div>
                <div>
                    <label for="staffName" class="block font-semibold mb-3">Address</label>
                    <InputText id="staffName" v-model.trim="product.address" required="true" autofocus :invalid="submitted && !product.staffName" fluid />
                    <small v-if="submitted && !product.staffName" class="text-red-500">Name is required.</small>
                </div>

            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Save" icon="pi pi-check" @click="saveProduct" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="product"
                    >Are you sure you want to delete <b>{{ product.staffName }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteProductDialog = false" />
                <Button label="Yes" icon="pi pi-check" @click="deleteProduct" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteProductsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="product">Are you sure you want to delete the selected products?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteProductsDialog = false" />
                <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedProducts" />
            </template>
        </Dialog>
	</div>
</template>

