<script setup>
import { ref, onMounted } from "vue";
import { FilterMatchMode } from "@primevue/core/api";
import { useToast } from "primevue/usetoast";
import axios from "axios";

onMounted(() => {
  getCustomers();

});

const toast = useToast();
const dt = ref();
const products = ref();
const productDialog = ref(false);
const deleteProductDialog = ref(false);
const deleteProductsDialog = ref(false);
const product = ref({});
const selectedProducts = ref();
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const submitted = ref(false);
const customers = ref([]);

const openNew = () => {
  product.value = {};
  submitted.value = false;
  productDialog.value = true;
};
const hideDialog = () => {
  productDialog.value = false;
  submitted.value = false;
};

const getCustomers = async () => {
  const response = await axios.get("http://localhost:9090/api/customers");
  customers.value = response.data;
}


const saveProduct = () => {
  submitted.value = true;

  if (product?.value.name?.trim()) {
    if (product.value.id) {
      product.value.inventoryStatus = product.value.inventoryStatus.value
        ? product.value.inventoryStatus.value
        : product.value.inventoryStatus;
      products.value[findIndexById(product.value.id)] = product.value;
      toast.add({
        severity: "success",
        summary: "Successful",
        detail: "Product Updated",
        life: 3000,
      });
    } else {
      product.value.id = createId();
      product.value.code = createId();
      product.value.inventoryStatus = product.value.inventoryStatus
        ? product.value.inventoryStatus.value
        : "INSTOCK";
      products.value.push(product.value);
      toast.add({
        severity: "success",
        summary: "Successful",
        detail: "Product Created",
        life: 3000,
      });
    }

    productDialog.value = false;
    product.value = {};
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
const deleteProduct = () => {
  products.value = products.value.filter((val) => val.id !== product.value.id);
  deleteProductDialog.value = false;
  product.value = {};
  toast.add({
    severity: "success",
    summary: "Successful",
    detail: "Product Deleted",
    life: 3000,
  });
};
const findIndexById = (id) => {
  let index = -1;
  for (let i = 0; i < products.value.length; i++) {
    if (products.value[i].id === id) {
      index = i;
      break;
    }
  }

  return index;
};
const createId = () => {
  let id = "";
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 5; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

const confirmDeleteSelected = () => {
  deleteProductsDialog.value = true;
};
const deleteSelectedProducts = () => {
  products.value = products.value.filter(
    (val) => !selectedProducts.value.includes(val)
  );
  deleteProductsDialog.value = false;
  selectedProducts.value = null;
  toast.add({
    severity: "success",
    summary: "Successful",
    detail: "Products Deleted",
    life: 3000,
  });
};
</script>

<template>
  <div class="space">
    <h1 class="text-4xl font-semibold mb-6" style="color: #899499">
      Manage Customer
    </h1>
  </div>

  <div>
    <Tabs value="0" class="shadow-lg">
      <TabList>
        <Tab value="0">Manage Customer</Tab>
        <Tab value="1">Inactive</Tab>
      </TabList>

      <TabPanels>
        <TabPanel value="0">

          <Toolbar class="mb-6">
            <template #start>
              <Button label="New" icon="pi pi-plus" severity="success" class="mr-2" @click="openNew" />
              <Button label="Delete" icon="pi pi-trash" severity="danger" @click="confirmDeleteSelected"
                :disabled="!selectedProducts || !selectedProducts.length" />
            </template>
          </Toolbar>

          <DataTable ref="dt" v-model:selection="selectedProducts" :value="customers" dataKey="id" :paginator="true"
            :rows="10" :filters="filters"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products">
            <template #header>
              <div class="flex flex-wrap gap-2 items-center justify-between">
                <h4 class="m-0 font-semibold">Customer's</h4>
                <IconField>
                  <InputIcon>
                    <i class="pi pi-search" />
                  </InputIcon>
                  <InputText v-model="filters['global'].value" placeholder="Search..." />
                </IconField>
              </div>
            </template>

            <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
            <Column field="FirstName" header="FirstName" sortable style="min-width: 16rem"></Column>
            <Column field="LastName" header="LastName" sortable style="min-width: 16rem"></Column>
            <Column field="Area" header="Address" sortable style="min-width: 18rem"></Column>
            <Column field="status" header="Status" sortable style="min-width: 12rem">
              <template #body="slotProps">
                <span class="px-2 py-1 rounded text-white" :style="{
                  backgroundColor:
                    slotProps.data.status === 'Dealer' ? '#4CAF50' : '#FF5722',
                }">
                  {{ slotProps.data.status }}
                </span>
              </template>
            </Column>
            <!-- <Column field="price" header="Price" sortable style="min-width: 12rem"></Column> -->

            <Column :exportable="false" header="Actions" style="min-width: 10rem">
              <template #body="slotProps">
                <Button icon="pi pi-pencil" v-tooltip.bottom="'Edit'" outlined rounded class="mr-2"
                  @click="editProduct(slotProps.data)" />
                <Button icon="pi pi-trash" v-tooltip.bottom="'Delete'" outlined rounded severity="danger"
                  @click="confirmDeleteProduct(slotProps.data)" />
              </template>
            </Column>
          </DataTable>

        </TabPanel>
        <TabPanel value="1">
          <DataTable ref="dt" v-model:selection="selectedProducts" :value="customers" dataKey="id" :paginator="true"
            :rows="10" :filters="filters"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products">
            <template #header>
              <div class="flex flex-wrap gap-2 items-center justify-between">
                <h4 class="m-0 font-semibold">Inactive Customer</h4>
                <IconField>
                  <InputIcon>
                    <i class="pi pi-search" />
                  </InputIcon>
                  <InputText v-model="filters['global'].value" placeholder="Search..." />
                </IconField>
              </div>
            </template>

            <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
            <Column field="FirstName" header="FirstName" sortable style="min-width: 16rem"></Column>
            <Column field="LastName" header="LastName" sortable style="min-width: 16rem"></Column>
            <Column field="Area" header="Address" sortable style="min-width: 18rem"></Column>
            <Column field="col" header="COL" sortable style="min-width: 12rem"></Column>
            <Column field="status" header="Status" sortable style="min-width: 12rem">
              <template #body="slotProps">
                <span class="px-2 py-1 rounded text-white" :style="{
                  backgroundColor:
                    slotProps.data.status === 'Dealer' ? '#4CAF50' : '#FF5722',
                }">
                  {{ slotProps.data.status }}
                </span>
              </template>
            </Column>
            <!-- <Column field="price" header="Price" sortable style="min-width: 12rem"></Column> -->

            <Column :exportable="false" header="Actions" style="min-width: 10rem">
              <template #body="slotProps">
                <Button icon="pi pi-pencil" v-tooltip.bottom="'Edit'" outlined rounded class="mr-2"
                  @click="editProduct(slotProps.data)" />
                <Button icon="pi pi-trash" v-tooltip.bottom="'Delete'" outlined rounded severity="danger"
                  @click="confirmDeleteProduct(slotProps.data)" />
              </template>
            </Column>
          </DataTable>
        </TabPanel>
      </TabPanels>
    </Tabs>


    <Dialog v-model:visible="productDialog" :style="{ width: '450px' }" header="Add Customer" :modal="true">
      <div class="flex flex-col gap-6">
        <!-- Name Input -->
        <div>
          <label for="name" class="block font-semibold mb-3">Name</label>
          <InputText id="name" v-model.trim="product.name" required="true" autofocus
            :invalid="submitted && !product.name" fluid />
          <small v-if="submitted && !product.name" class="text-red-500">Name is required.</small>
        </div>

        <!-- Address Input -->
        <div>
          <label for="address" class="block font-semibold mb-3">Address</label>
          <InputText id="address" v-model.trim="product.address" required="true"
            :invalid="submitted && !product.address" fluid />
          <small v-if="submitted && !product.address" class="text-red-500">Address is required.</small>
        </div>

        <!-- Dropdowns Container -->
        <div class="flex gap-4">
          <!-- Status Dropdown -->
          <div class="w-full md:w-56">
            <label for="status" class="block font-semibold mb-3">Status</label>
            <Select v-model="product.status" id="status" :options="[
              { label: 'Dealer', value: 'dealer' },
              { label: 'Regular', value: 'regular' }
            ]" optionLabel="label" placeholder="Select a Status" class="w-full border rounded" required />
            <small v-if="submitted && !product.status" class="text-red-500">Status is required.</small>
          </div>

          <!-- Category Dropdown -->
          <div class="w-full md:w-56">
            <label for="category" class="block font-semibold mb-3">Price</label>
            <Select v-model="product.category" id="category" :options="[
              { label: '₱ 20', value: 'Dealer' },
              { label: '₱ 25', value: 'Regular' },
            ]" optionLabel="label" placeholder="Select Price" class="w-full border rounded" required />
            <small v-if="submitted && !product.category" class="text-red-500">Category is required.</small>
          </div>
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
        <span v-if="product">Are you sure you want to delete <b>{{ product.name }}</b>?</span>
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
