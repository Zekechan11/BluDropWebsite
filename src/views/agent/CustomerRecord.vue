<script setup>
import axios from "axios";
import { computed, onMounted, ref } from "vue";
import Badge from 'primevue/badge';
import { WATER_API } from "../../config";
import { attempt } from "../../service/attempt";
import { formatCurrency } from "../../service/formatcurrency";
import { useToast } from "primevue/usetoast";

const searchQuery = ref("");
const visible = ref(false);
const orderModalVisible = ref(false);
const receiptModalVisible = ref(false);
const selectedCustomer = ref(null);
const pricePerGallon = ref(0);

const receiptData = ref(null);

const newOrder = ref({
  customerId: null,
  name: "",
  area: "",
  type: "",
  date: new Date().toISOString().split("T")[0],
  gallonsToOrder: 0,
  col: 0,
  totalPrice: 0,
  payment: 0,
  payables: 0,
  payPayable: true,
  gallonsToReturn: 0,
});

const userData = JSON.parse(localStorage.getItem("user_data"));

const customerRecords = ref([]);

const toast = useToast();

const fetchCustomerRecords = async () => {
  const [customerCountResponse, customerCountError] = await attempt(
    axios.get(`${WATER_API}/v2/api/get_client/all?area_id=${userData.area_id}`)
  );
  if (customerCountError) {
    console.error("Error fetching customer records:", customerCountError);
  } else {
    customerRecords.value = customerCountResponse.data.data;
  }
};

onMounted(() => {
  fetchCustomerRecords();
});

const filteredCustomers = computed(() => {
  if (!searchQuery.value) return customerRecords.value;
  const query = searchQuery.value.toLowerCase();
  return customerRecords.value.filter((customer) => {
    return (
      (customer.firstname + " " + customer.lastname).toLowerCase().includes(query) ||
      customer.area.toLowerCase().includes(query) ||
      customer.total_payable.toString().toLowerCase().includes(query)
    );
  });
});

const openDetailsModal = (customer) => {
  selectedCustomer.value = customer;
  visible.value = true;
};

const openOrderModal = async (customer) => {

  const [priceResponse, priceError] = await attempt(
    axios.get(`${WATER_API}/api/price/${customer.type}`)
  );
  if (!priceError) {
    pricePerGallon.value = priceResponse.data;
  }

  selectedCustomer.value = customer;
  newOrder.value = {
    customerId: customer.client_id,
    name: `${customer.firstname} ${customer.lastname}`,
    area: customer.area,
    type: customer.type,
    date: new Date().toISOString().split("T")[0],
    col: customer.total_containers_on_loan,
    gallonsToOrder: 0,
    totalPrice: 0,
    payment: 0,
    payables: customer.total_payable,
    payPayable: true,
    gallonsToReturn: 0,
  };
  orderModalVisible.value = true;
};

const calculateTotalPrice = () => {
  newOrder.value.totalPrice = newOrder.value.gallonsToOrder * pricePerGallon.value;
};

const submitOrder = async () => {
  const { customerId, gallonsToOrder, payment, gallonsToReturn, type, col, payPayable } = newOrder.value;

  if (!gallonsToOrder || gallonsToOrder <= 0) {
    toast.add({ severity: 'error', summary: 'Error', detail: "Please enter a valid number of gallons to order.", life: 3000 });
    return;
  }

  if (gallonsToReturn > col) {
    toast.add({ severity: 'error', summary: 'Error', detail: `You cannot return more than the current COL (${col}).`, life: 3000 });
    return;
  }

  try {
    const response = await axios.post(`${WATER_API}/api/process-manual-order`, {
      customerId,
      gallonsToOrder,
      payment,
      gallonsToReturn,
      type,
      payPayable
    });

    receiptData.value = response.data;
    orderModalVisible.value = false;
    receiptModalVisible.value = true;

    fetchCustomerRecords();
  } catch (error) {
    console.error("Error processing order:", error);
    toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.error || "Failed to process order.", life: 3000 });
  }
};

const handlePrint = () => {
  if (typeof window !== "undefined" && typeof window.print === "function") {
    window.print();
  } else {
    toast.add({ severity: 'error', summary: 'Error', detail: "Can't print right now", life: 3000 });
  }
};
</script>

<template>
  <div class="space mb-6">
    <h1 class="text-4xl font-semibold text-gray-700 flex items-center gap-3">
      <i class="pi pi-users text-blue-500 !text-4xl"></i>
      Customer Record
    </h1>
  </div>

  <div class="card shadow-md">
    <!-- DataTable -->
    <DataTable :value="filteredCustomers" paginator :rows="10" dataKey="client_id" scrollable scrollHeight="400px"
      class="mt-4" stripedRows>
      <template #header>
        <IconField>
          <InputIcon>
            <i class="pi pi-search" />
          </InputIcon>
          <InputText v-model="searchQuery" placeholder="Search..." class="w-full" />
        </IconField>
      </template>

      <Column header="Customer Name" style="min-width: 14rem">
        <template #body="{ data }">
          <i class="pi pi-user mr-2"></i>
          <span class="pr-4">{{ data.firstname }} {{ data.lastname }}</span>
          <Badge :severity="data.type === 'Dealer' ? 'info' : null">{{ data.type }}</Badge>
        </template>
      </Column>

      <Column field="total_payable" header="Total Amount Payable" style="min-width: 12rem">
        <template #body="{ data }">
          <span class="text-green-600 font-semibold">
            <i class="pi pi-wallet mr-1 text-green-500"></i>
            ₱ {{ data.total_payable }}
          </span>
        </template>
      </Column>

      <Column header="Action" style="min-width: 12rem">
        <template #body="{ data }">
          <i v-tooltip.bottom="'View More'" class="pi pi-eye cursor-pointer !text-xl text-blue-500 mr-4"
            @click="openDetailsModal(data)"></i>
          <i v-tooltip.bottom="'Manual Order'" class="pi pi-shopping-cart cursor-pointer !text-xl text-green-500 mr-4"
            @click="openOrderModal(data)"></i>
        </template>
      </Column>
      <template #empty>
        <div class="text-center text-gray-500 py-12">
          <i class="pi pi-info-circle mr-2" />
          No history found.
        </div>
      </template>
    </DataTable>

    <!-- Customer Details Modal -->
    <Dialog v-model:visible="visible" maximizable modal header="Customer Details" :style="{ width: '30rem' }">
      <div>
        <p><strong>Name:</strong> {{ selectedCustomer.firstname }} {{ selectedCustomer.lastname }}</p>
        <p><strong>Area:</strong> {{ selectedCustomer.area }}</p>
        <p><strong>Total Payable:</strong> ₱{{ selectedCustomer.total_payable }}</p>
      </div>
    </Dialog>

    <!-- Order Modal -->
    <Dialog v-model:visible="orderModalVisible" modal header="Create New Order" :style="{ width: '40rem' }"
      class="rounded-lg shadow-xl">
      <div class="p-6 space-y-6 bg-white">
        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 class="text-lg font-semibold text-gray-700 mb-3">Customer Information</h3>
          <div class="grid grid-cols-2 gap-y-2 text-gray-600">
            <p><strong>ID:</strong> {{ newOrder.customerId }}</p>
            <p><strong>Name:</strong> {{ newOrder.name }}</p>
            <p><strong>Area:</strong> {{ newOrder.area }}</p>
            <p><strong>Date:</strong> {{ newOrder.date }}</p>
            <p><strong>COL:</strong> {{ newOrder.col }}</p>
            <p>
              <strong>Payables:</strong>
              <span class="text-green-600 font-semibold">{{ formatCurrency(newOrder.payables) }}</span>
            </p>
          </div>
        </div>
        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 class="text-lg font-semibold text-gray-700 mb-4">Order Details</h3>
          <div class="space-y-4">
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-600 mb-1">Gallons to Order</label>
              <input type="number" class="p-3 border rounded-lg text-lg focus:ring-2 focus:ring-blue-400 outline-none"
                v-model.number="newOrder.gallonsToOrder" min="0" @input="calculateTotalPrice" />
            </div>

            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-gray-600">Total Price</span>
              <span class="text-xl font-bold text-blue-600">₱{{ newOrder.totalPrice }}</span>
            </div>

            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-600 mb-1">Payment</label>
              <input type="number" class="p-3 border rounded-lg text-lg focus:ring-2 focus:ring-blue-400 outline-none"
                v-model.number="newOrder.payment" min="0" />
            </div>

            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-600 mb-1">Gallons to Return</label>
              <input type="number" class="p-3 border rounded-lg text-lg focus:ring-2 focus:ring-blue-400 outline-none"
                v-model.number="newOrder.gallonsToReturn" min="0" />
            </div>

            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-600 mb-1">Enable Payment Payable</label>
              <ToggleButton v-model="newOrder.payPayable" onLabel="Yes" offLabel="No" class="p-button-sm" />
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button class="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
            @click="orderModalVisible = false">
            Cancel
          </button>
          <button @click="submitOrder"
            class="px-5 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium shadow">
            Submit Order
          </button>
        </div>
      </div>
    </Dialog>

    <!-- Receipt Modal -->
    <Dialog v-model:visible="receiptModalVisible" modal header="Order Receipt" :style="{ width: '30rem' }"
      class="rounded-lg shadow-xl">
      <div class="p-6 space-y-4 bg-white">
        <h2 class="text-2xl font-bold text-green-600"><i class="pi pi-check-circle pr-2 !text-2xl" />Order Successful!
        </h2>
        <div class="text-gray-700 space-y-2">
          <p><strong>Customer ID:</strong> {{ receiptData?.customerId }}</p>
          <p><strong>Total Price:</strong> {{ formatCurrency(receiptData?.totalPrice) }}</p>
          <p><strong>Payment:</strong> {{ formatCurrency(receiptData?.payment) }}</p>
          <p v-if="receiptData.payPayable"><strong>Payables Paid:</strong> {{ formatCurrency(receiptData?.overpaidAmount) }}</p>
          <p v-if="receiptData?.overpay > 0" class="text-green-600 font-semibold">
            <strong>Change:</strong> {{ formatCurrency(receiptData?.overpay) }}
          </p>
          <p><strong class="pr-2">Status:</strong>
            <span :class="[
              'inline-block px-2 py-1 rounded text-sm font-semibold',
              {
                'bg-yellow-100 text-yellow-800': receiptData.status === 'Pending',
                'bg-green-100 text-green-800': receiptData.status === 'Completed',
                'bg-gray-100 text-gray-800': !receiptData.status || receiptData.status === 'None'
              }
            ]">
              {{ receiptData?.status }}
            </span>
          </p>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <button class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
            @click="receiptModalVisible = false">
            Close
          </button>
          <button class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg" @click="handlePrint()">
            Print Receipt
          </button>
        </div>
      </template>
    </Dialog>
  </div>
</template>
