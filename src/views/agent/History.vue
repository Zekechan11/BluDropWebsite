<script setup>
import { onBeforeMount, ref } from 'vue';

const customers2 = ref([]);
const dateFrozen = ref(false);

// Mock data to simulate manual process
onBeforeMount(() => {
  customers2.value = [
    {
      representative: { name: 'John Doe' },
      gallonsCollected: 100,
      amountCollected: 5000,
      date: '2024-10-14'
    },
    {
      representative: { name: 'Jane Smith' },
      gallonsCollected: 80,
      amountCollected: 4000,
      date: '2024-10-13'
    },
    {
      representative: { name: 'Michael Johnson' },
      gallonsCollected: 120,
      amountCollected: 6000,
      date: '2024-10-12'
    }
  ];
});

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

    <DataTable :value="customers2" scrollable scrollHeight="400px" class="mt-6">
      <Column field="gallonsCollected" header="Gallons Collected" style="min-width: 200px"></Column>
      <Column field="amountCollected" header="Amount Collected" :body="formatCurrency" style="min-width: 200px"></Column>
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
