<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from "axios";
import { attempt } from "../../service/attemptservice";
import { WATER_API } from '../../config';

const searchQuery = ref('');
const visible = ref(false);
const customerRecords = ref([])

const userData = JSON.parse(localStorage.getItem("user_data"));

const fetchCustomerRecords = async () => {
    const [customerCountResponse, customerCountError] = await attempt(
    axios.get(`${WATER_API}/v2/api/get_client/all?area_id=${userData.area_id}`)
  );
  if (customerCountError) {
    console.error("Error fetching total users:", error);
  }

  customerRecords.value = customerCountResponse.data.data;
}

onMounted(() => {
    fetchCustomerRecords();
});

const filteredCustomers = computed(() => {
    if (!searchQuery.value) {
        return customerRecords.value;
    }
    const query = searchQuery.value.toLowerCase();
    return customerRecords.value.filter((customer) => {
        return (
            (customer.firstname + " " + customer.lastname).toLowerCase().includes(query) ||
            customer.area.toLowerCase().includes(query) ||
            customer.total_payable.toString().toLowerCase().includes(query)
        );
    });
});
</script>

<template>
    <div class="card shadow-md">
        <DataTable :value="filteredCustomers" paginator :rows="10" dataKey="client_id" filterDisplay="row">
            <template #header>
                <div class="flex justify-end items-center space-x-4">
                    <!-- Search input -->
                    <InputText v-model="searchQuery" placeholder="Search..." class="w-48" />
                </div>
            </template>

            <template #empty> No customers found. </template>

            <Column header="Customer Name" filterField="representative" style="min-width: 14rem">
                <template #body="{ data }">
                    <div class="flex items-center gap-2">
                        <span>{{ data.firstname }} {{ data.lastname }}</span>
                    </div>
                </template>
            </Column>

            <Column field="total_payable" header="Total Amount Payable" style="min-width: 12rem">
                <template #body="{ data }">
                    ₱ {{ data.total_payable }}
                </template>
            </Column>

            <Column header="Action" style="min-width: 12rem">
                <template #body="">
                    <i class="pi pi-eye cursor-pointer text-blue-500" @click="visible = true"></i>
                </template>
            </Column>
        </DataTable>

        <!-- Modal -->
        <Dialog v-model:visible="visible" maximizable modal header="Customer" :style="{ width: '50rem' }"
            :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <DataTable :value="products" showGridlines tableStyle="min-width: 40rem">
                <Column field="code" header="Amount Payable"></Column>
                <Column field="code" header="Date"></Column>
                <Column field="name" header="Due Date"></Column>
            </DataTable>
        </Dialog>
    </div>
</template>
