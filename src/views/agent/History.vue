<script setup>
import { onMounted, ref, computed } from 'vue';
import { WATER_API } from '../../config';
import axios from 'axios';

const orders = ref([]);
const searchQuery = ref('');

const userData = JSON.parse(localStorage.getItem("user_data"));

const fetchOrders = async () => {
  try {
    const response = await axios.get(`${WATER_API}/api/get_order?area_id=${userData.area_id}&status=Completed`);
    orders.value = response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
  }
};

onMounted(() => {
  fetchOrders();
});

function formatCurrency(value) {
  return value?.toLocaleString('en-US', { style: 'currency', currency: 'PHP' }) || '₱0.00';
}

const filteredOrders = computed(() => {
  if (!searchQuery.value) return orders.value;
  return orders.value.filter(order =>
    order.customer_fullname.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});
</script>

<template>
  <div class="space mb-6">
    <h1 class="text-4xl font-semibold text-gray-700 flex items-center gap-3">
      <i class="pi pi-history text-blue-500 !text-4xl"></i>
      Order History
    </h1>
  </div>

  <div class="card shadow-lg p-6 bg-white rounded-lg space-y-4">

    <DataTable :value="filteredOrders" paginator :rows="10" dataKey="id" scrollable scrollHeight="400px" class="mt-4" stripedRows>
      <template #header>
        <IconField>
          <InputIcon>
            <i class="pi pi-search" />
          </InputIcon>
          <InputText v-model="searchQuery" placeholder="Search..." class="w-full" />
        </IconField>
      </template>
      <Column field="customer_fullname" header="Fullname" style="min-width: 200px">
        <template #body="slotProps">
          <span>
            <i class="pi pi-user mr-1"></i>
            {{ formatCurrency(slotProps.data.customer_fullname) }}
          </span>
        </template>
      </Column>
      <Column field="num_gallons_order" header="Gallons Collected" style="min-width: 200px" />
      <Column header="Amount Collected" style="min-width: 200px">
        <template #body="slotProps">
          <span class="text-green-600 font-semibold">
            <i class="pi pi-wallet mr-1 text-green-500"></i>
            {{ formatCurrency(slotProps.data.payment) }}
          </span>
        </template>
      </Column>
      <template #empty>
        <div class="text-center text-gray-500 py-12">
          <i class="pi pi-info-circle mr-2" />
          No history found.
        </div>
      </template>
    </DataTable>
  </div>
</template>


<style scoped lang="scss">
:deep(.p-datatable-frozen-tbody),
:deep(.p-datatable-scrollable .p-frozen-column) {
  font-weight: bold;
}

h1 {
  color: #4a5568;
}
</style>
