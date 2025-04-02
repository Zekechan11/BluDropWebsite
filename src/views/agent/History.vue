<script setup>
import { onMounted, ref } from 'vue';
import { WATER_API } from '../../config';
import axios from 'axios';

const dateFrozen = ref(false);
const orders = ref([]);

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
})

function formatCurrency(value) {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'PHP' });
}

</script>

<template>
  <div class="space">
    <h1 class="text-4xl font-semibold mb-6" style="color: #899499;">
      History
    </h1>
  </div>

  <div class="card shadow-md">
    <ToggleButton v-model="dateFrozen" onIcon="pi pi-lock" offIcon="pi pi-lock-open" onLabel="Date" offLabel="Date" />

    <DataTable :value="orders" scrollable scrollHeight="400px" class="mt-6">
      <Column field="customer_fullname" header="Fullname" style="min-width: 200px"></Column>
      <Column field="num_gallons_order" header="Gallons Collected" style="min-width: 200px"></Column>
      <Column field="payment" header="Amount Collected" :body="formatCurrency" style="min-width: 200px"></Column>
      <Column field="date" header="Date" style="min-width: 200px" alignFrozen="right" :frozen="dateFrozen"></Column>
    </DataTable>
  </div>
</template>

<style scoped lang="scss">
:deep(.p-datatable-frozen-tbody) {
  font-weight: bold;
}

:deep(.p-datatable-scrollable .p-frozen-column) {
  font-weight: bold;
}

h1 {
  color: #4A5568; /* A nice dark gray color */
  margin-bottom: 1.5rem; /* Adds some spacing below the header */
}
</style>
