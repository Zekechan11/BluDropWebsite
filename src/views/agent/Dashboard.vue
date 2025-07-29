<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { WATER_API } from "../../config";
import { formatCurrency } from "../../service/formatcurrency";
import { attempt } from "../../service/attempt";
import { useRouter } from 'vue-router';

const router = useRouter();

const userData = JSON.parse(localStorage.getItem("user_data"));

const orders = ref([]);
const visible = ref(false);
const dashData = ref([]);
const totalCustomers = ref();

const fetchOrders = async () => {
  try {
    const response = await axios.get(
      `${WATER_API}/api/get_order?area_id=${userData.area_id}&status=Pending`
    );
    orders.value = response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
  }
};

const fetchDashData = async () => {
  try {
    const response = await axios.get(
      `${WATER_API}/v2/api/agent/dashboard/${userData.area_id}`
    );
    dashData.value = response.data;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
  }
};

const fetchTotalCustomer = async () => {
  const [response, error] = await attempt(
    axios.get(`${WATER_API}/v2/api/get_client/all?area_id=${userData.area_id}`)
  )
  if (error) {
    console.error("Field at ", error);
  } else {
    totalCustomers.value = response.data.data.length;
  }
}

onMounted(() => {
  fetchDashData();
  fetchOrders();
  fetchTotalCustomer();
});

const orderCount = computed(() => orders.value.length);

const cards = computed(() => [
  {
    label: "FGS",
    value: dashData.value.fgs || 0,
    icon: "pi-box",
    color: "text-orange-500",
    bg: "bg-orange-100",
  },
  {
    label: "Gallons Delivered",
    value: dashData.value.gallons_delivered || 0,
    icon: "pi-truck",
    color: "text-cyan-500",
    bg: "bg-cyan-100",
  },
  {
    label: "Gallons Returned",
    value: dashData.value.gallons_returned || 0,
    icon: "pi-directions",
    color: "text-purple-500",
    bg: "bg-purple-100",
  },
  {
    label: "Amount Collected",
    value: formatCurrency(dashData.value.collected_ammount || 0),
    icon: "pi-chart-line",
    color: "text-green-500",
    bg: "bg-green-100",
  },
  {
    label: "Customer Orders",
    value: orderCount.value,
    icon: "pi-shopping-cart",
    color: "text-blue-500",
    bg: "bg-blue-100",
    onClick: () => (visible.value = true),
    tooltip: {
      value: "View Customers Order",
      pt: {
        arrow: {
          style: {
            borderBottomColor: 'var(--p-primary-color)',
          },
        },
        text: '!bg-primary !text-primary-contrast !font-medium',
      },
    },
  },
  {
    label: "Total Customers",
    value: totalCustomers.value || 0,
    icon: "pi-users",
    color: "text-pink-500",
    bg: "bg-pink-100",
    onClick: () => router.push('/agent/record'),
    tooltip: {
      value: "View All Customers",
      pt: {
        arrow: {
          style: {
            borderBottomColor: 'var(--p-primary-color)',
          },
        },
        text: '!bg-primary !text-primary-contrast !font-medium',
      },
    },
  },
]);

</script>

<template>
  <div class="space mb-8">
    <h1 class="text-center font-semibold text-gray-600 text-4xl">
      <i class="pi pi-map-marker text-blue-500 mr-2 !text-4xl"></i> {{ userData.area || "No Area Assigned" }}
    </h1>
  </div>

  <div class="grid grid-cols-12 gap-6">
    <div v-for="(card, index) in cards" :key="index" v-tooltip.bottom="card.tooltip ? card.tooltip : null"
      class="col-span-12 sm:col-span-6 xl:col-span-4 transition-transform transform hover:scale-[1.02] cursor-pointer"
      @click="card.onClick && card.onClick()">

      <div
        class="bg-white dark:bg-surface-800 rounded-lg shadow-lg p-6 h-full flex justify-between items-center hover:shadow-xl transition-shadow duration-200">
        <div>
          <p class="text-gray-500 text-sm mb-2 font-semibold tracking-wide uppercase">{{ card.label }}</p>
          <h2 class="text-gray-800 dark:text-white text-2xl font-bold">
            {{ card.value }}
          </h2>
        </div>
        <div class="w-14 h-14 rounded-full flex items-center justify-center" :class="card.bg">
          <i :class="['pi', card.icon, 'text-2xl', card.color]"></i>
        </div>
      </div>
    </div>

    <Dialog v-model:visible="visible" modal header="Customer Orders" :style="{ width: '50rem' }"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
      <DataTable :value="orders" showGridlines tableStyle="min-width: 40rem">
        <Column field="customer_fullname" header="Fullname"></Column>
        <Column field="num_gallons_order" header="Quantity"></Column>
        <Column field="col" header="COL"></Column>
        <Column field="payable_amount" header="Payables">
          <template #body="slotProps">
            <span class="text-red-600">{{ formatCurrency(slotProps.data.payable_amount) }}</span>
          </template>
        </Column>
        <Column field="total_price" header="Total Payment">
          <template #body="slotProps">
            <span class="text-green-600">{{ formatCurrency(slotProps.data.total_price) }}</span>
          </template>
        </Column>
        <Column field="date" header="Date"></Column>
      </DataTable>
    </Dialog>
  </div>
</template>

<style scoped>
.p-dialog {
  transition: all 0.3s ease-in-out;
}
</style>
