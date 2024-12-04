<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import axios from 'axios';

const apiUrl = 'http://localhost:5089/api/Inventory'; // Update with your actual API base URL

const toast = useToast();
const dt = ref();
const products = ref([]);
const productDialog = ref(false);
const deleteProductDialog = ref(false);
const deleteProductsDialog = ref(false);
const product = ref({});
const selectedProducts = ref();
const submitted = ref(false);

// Fetch products from the backend on component mount
onMounted(async () => {
    try {
        const response = await axios.get(`${apiUrl}/GetInventory`);
        products.value = response.data.map(item => ({
            id: item.inventoryId,
            Item: item.item,
            noOfItems: item.noOfItems
        }));
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch inventory data.', life: 3000 });
    }
});

// Open dialog to add a new product
const openNew = () => {
    product.value = {};
    submitted.value = false;
    productDialog.value = true;
};

// Close dialog
const hideDialog = () => {
    productDialog.value = false;
    submitted.value = false;
};

// Save product (Add or Update)
const saveProduct = async () => {
    submitted.value = true;

    if (product.value.item?.trim()) {
        try {
            if (product.value.id) {
                // Update existing product
                const response = await axios.put(`${apiUrl}/UpdateInventory/${product.value.id}`, {
                    inventoryId: product.value.id,
                    Item: product.value.item,
                    noOfItems: product.value.noOfItems
                });
                products.value = products.value.map(p => (p.id === response.data.inventoryId ? {
                    id: response.data.inventoryId,
                    Item: response.data.item,
                    noOfItems: response.data.noOfItems
                } : p));
                toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Updated', life: 3000 });
            } else {
                // Add new product
                const response = await axios.post(`${apiUrl}/SaveInventory`, {
                    Item: product.value.item,
                    noOfItems: product.value.noOfItems
                });
                products.value.push({
                    id: response.data.inventoryId,
                    Item: response.data.item,
                    noOfItems: response.data.noOfItems
                });
                toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Created', life: 3000 });
            }

            productDialog.value = false;
            product.value = {};
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save product.', life: 3000 });
        }
    }
};

// Edit an existing product
const editProduct = (prod) => {
    product.value = {
        id: prod.id,
        item: prod.Item, // Map `Item` to `item`
        noOfItems: prod.noOfItems, // Use as is
    };
    productDialog.value = true;
};

// Confirm delete dialog
const confirmDeleteProduct = (prod) => {
    product.value = prod;
    deleteProductDialog.value = true;
};

// Delete a product
const deleteProduct = async () => {
    try {
        await axios.delete(`${apiUrl}/DeleteInventory/${product.value.id}`);
        products.value = products.value.filter(p => p.id !== product.value.id);
        deleteProductDialog.value = false;
        product.value = {};
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete product.', life: 3000 });
    }
};

// Confirm delete selected products
const confirmDeleteSelected = () => {
    deleteProductsDialog.value = true;
};

// Delete selected products
const deleteSelectedProducts = async () => {
    try {
        const promises = selectedProducts.value.map(prod => 
            axios.delete(`${apiUrl}/DeleteInventory/${prod.id}`));
        await Promise.all(promises);
        products.value = products.value.filter(p => !selectedProducts.value.includes(p));
        deleteProductsDialog.value = false;
        selectedProducts.value = null;
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Products Deleted', life: 3000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete selected products.', life: 3000 });
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
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
            >

                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column field="Item" header="Items" sortable style="min-width: 16rem"></Column>
                <Column field="noOfItems" header="No of Items" sortable style="min-width: 16rem"></Column>
  
                <Column :exportable="false" header="Actions" style="min-width: 12rem;">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editProduct(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteProduct(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="productDialog" :style="{ width: '450px' }" header="Inventory" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="Item" class="block font-semibold mb-3">Items</label>
                    <InputText id="item" v-model.trim="product.item" required="true" autofocus :invalid="submitted && !product.item" fluid />
                    <small v-if="submitted && !product.item" class="text-red-500">Item is required.</small>
                </div>
                <div>
                    <label for="noOfItems" class="block font-semibold mb-3">No of Items</label>
                    <InputText id="noOfItems" v-model.trim="product.noOfItems" required="true" autofocus :invalid="submitted && !product.noOfItems" fluid />
                    <small v-if="submitted && !product.noOfItems" class="text-red-500">No of Item is required.</small>
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
                    >Are you sure you want to delete <b>{{ product.item }}</b
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
