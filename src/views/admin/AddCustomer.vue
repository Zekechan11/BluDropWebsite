<script setup>
import { ref, onMounted } from "vue";
import { FilterMatchMode } from "@primevue/core/api";
import { useToast } from "primevue/usetoast";
import axios from "axios";
import { WATER_API } from "../../config";

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
const clientStatus = ref('Active');
const area = ref({});
const areas = ref([]);

const openNew = () => {
  product.value = {};
  submitted.value = false;
  productDialog.value = true;
};
const hideDialog = () => {
  productDialog.value = false;
  submitted.value = false;
};

const getCustomers = async (status) => {
  clientStatus.value = status;
  const response = await axios.get(`${WATER_API}/v2/api/get_client/all/${clientStatus.value}`);
  customers.value = response.data.data;
}
const fetchAreas = async () => {
  try {
    const response = await axios.get(`${WATER_API}/area`);
    const data = response.data;

    areas.value = data.map((area) => {
      return {
        ...area,
        label: area.area,
        value: area.id
      };
    });
  } catch (error) {
    console.error("Error fetching areas:", error);
  }
};


const saveProduct = async () => {
  submitted.value = true;

  if (product.value.staff_id) {
    // await updateAgent();
  } else {
    await createClient();
  }
  
  productDialog.value = false;
  product.value = {};
  
};


const createClient = async () => {
  try {
    const payload = {
      firstname: product.value.firstname,
      lastname: product.value.lastname,
      email: product.value.email,
      username: product.value.username,
      password: product.value.password,
      area_id: product.value.area,
      type: product.value.type.label,
    };

    const response = await axios.post(
      `${WATER_API}/v2/api/create_client`,
      payload
    );
    customers.value.push({
      client_id: response.data.data.client_id,
      firstname: product.value.firstname,
      lastname: product.value.lastname,
      email: product.value.email,
      password: product.value.password,
      area: areas.value.find((a) => a.value === product.value.area)?.area,
      area_id: product.value.area_name,
      status: "S*x Active"
    });
    toast.add({
      severity: "success",
      summary: "Successful",
      detail: "Agent Created",
      life: 3000,
    });
  } catch (error) {
    console.error("Failed to create agent:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Failed to create agent",
      life: 3000,
    });
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
  await axios.delete(
      `${WATER_API}/v2/api/delete_client/${product.value.client_id}`
  );
  customers.value = customers.value.filter((val) => val.client_id !== product.value.client_id);
  deleteProductDialog.value = false;
  product.value = {};
  toast.add({
    severity: "success",
    summary: "Successful",
    detail: "Product Deleted",
    life: 3000,
  });
};

const confirmDeleteSelected = () => {
  deleteProductsDialog.value = true;
};
const deleteSelectedProducts = () => {
   customers.value = customers.value.filter(
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

onMounted(() => {
  getCustomers(clientStatus.value);
  fetchAreas();
});
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
        <Tab
          value="0"
          @click="getCustomers('Active')"
        >Manage Customer
      </Tab>
        <Tab
        value="1"
        @click="getCustomers('Inactive')"
        >Inactive
        </Tab>
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
            <Column field="firstname" header="FirstName" sortable style="min-width: 16rem"></Column>
            <Column field="lastname" header="LastName" sortable style="min-width: 16rem"></Column>
            <Column field="area" header="Address" sortable style="min-width: 18rem"></Column>
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
        <!-- FirstName Input -->
        <div>
          <label for="firstname" class="block font-semibold mb-3">First Name</label>
          <InputText id="firstname" v-model.trim="product.firstname" required="true" autofocus
            :invalid="submitted && !product.firstname" fluid />
          <small v-if="submitted && !product.firstname" class="text-red-500">Name is required.</small>
        </div>

        <!-- LastName Input -->
        <div>
          <label for="lastname" class="block font-semibold mb-3">Last Name</label>
          <InputText id="lastname" v-model.trim="product.lastname" required="true" autofocus
            :invalid="submitted && !product.lastname" fluid />
          <small v-if="submitted && !product.lastname" class="text-red-500">Name is required.</small>
        </div>

        <!-- Email Input -->
        <div>
          <label for="email" class="block font-semibold mb-3">Email</label>
          <InputText id="email" v-model.trim="product.email" required="true" autofocus
            :invalid="submitted && !product.email" fluid />
          <small v-if="submitted && !product.email" class="text-red-500">Email is required.</small>
        </div>

        <!-- Username Input -->
        <div>
          <label for="username" class="block font-semibold mb-3">Username</label>
          <InputText id="username" v-model.trim="product.username" required="true"
            :invalid="submitted && !product.username" fluid />
          <small v-if="submitted && !product.username" class="text-red-500">Username is required.</small>
        </div>

        <!-- Password Input -->
        <div>
          <label for="password" class="block font-semibold mb-3">Password</label>
          <InputText id="password" v-model.trim="product.password" required="true"
            :invalid="submitted && !product.password" fluid />
          <small v-if="submitted && !product.password" class="text-red-500">Password is required.</small>
        </div>

        <!-- Confirm Pass Input -->
        <!-- <div>
          <label for="password" class="block font-semibold mb-3">Confirm Password</label>
          <InputText id="password" v-model.trim="product.password" required="true"
            :invalid="submitted && !product.password" fluid />
          <small v-if="submitted && !product.password" class="text-red-500">Password is required.</small>
        </div> -->

        <!-- Dropdowns Container -->
        <div class="flex gap-4">
          <!-- Type Dropdown -->
          <div class="w-full md:w-56">
            <label for="type" class="block font-semibold mb-3">Type</label>
            <Select v-model="product.type" id="type" :options="[
              { label: 'Dealer', value: 'Dealer' },
              { label: 'Regular', value: 'Regular' }
            ]" optionLabel="label" placeholder="Select a Type" class="w-full border rounded" required />
            <small v-if="submitted && !product.type" class="text-red-500">Type is required.</small>
          </div>

          <!-- Area Dropdown -->
          <div class="w-full md:w-56">
            <label for="area" class="block font-semibold mb-3">Address</label>
            <Select
              v-model="product.area"
              id="area"
              :options="areas"
              optionLabel="label"
              optionValue="value"
              placeholder="Select Area"
              class="w-full border rounded"
              required />
            <small v-if="submitted && !product.area" class="text-red-500">Area is required.</small>
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
