<script setup>
import { useLayout } from "@/layout/composables/layout";
import axios from 'axios';
import QrcodeVue from 'qrcode.vue';
import { computed, onMounted, ref, watchEffect } from 'vue';

const ORDER_URL = 'http://localhost:9090';

const { getPrimary, getSurface, isDarkTheme } = useLayout();

const customer_id = localStorage.getItem("id");
const customerName = localStorage.getItem("firstName");
const customerLastName = localStorage.getItem("lastName");
const customerArea = localStorage.getItem("area");
const visible = ref(false);
const qrCodeModal = ref(false);
const ingredient = ref('Tuesday');
const gallons = ref();
const latestOrder = ref(null);
const userData = ref(null);

const fullName = computed(() => {
  return `${customerName} ${customerLastName}`;
});

const fetchLatestOrder = async () => {
  try {
    const response = await axios.get(`${ORDER_URL}/api/get_order`, {
      params: { 
        customer_id: customer_id,
        status: 'Pending'
      }
    });

    const orderData = Array.isArray(response.data) ? response.data[0] : response.data;

    if (orderData && orderData.CustomerID === parseInt(customer_id)) {
      updateUserData(orderData);
    } else {
      resetOrderData();
    }
  } catch (error) {
    console.error('Error fetching latest order:', error);
    resetOrderData();
  }
};

const updateUserData = (orderData) => {
  latestOrder.value = orderData;
  userData.value = {
    orderId: orderData.ID,
    customerId: orderData.CustomerID,
    customerFirstName: orderData.CustomerFirstName,
    customerLastName: orderData.CustomerLastName,
    gallons: orderData.Num_gallons_order,
    date: orderData.Date,
    dateCreated: orderData.Date_created,
    totalPrice: orderData.Total_price,
    status: orderData.Status,
    customerArea: customerArea
  };
};

const resetOrderData = () => {
  latestOrder.value = null;
  userData.value = null;
};

const placeOrder = async () => {
  try {
    const response = await axios.post(`${ORDER_URL}/api/save_order`, {
      customer_id: customer_id,
      num_gallons_order: gallons.value,
      date: ingredient.value
    });

    console.log('Order saved:', response.data);

    if (response.data) {
      const newOrderData = {
        orderId: response.data.ID, // Correctly map the capitalized ID field
        CustomerID: parseInt(customer_id),
        CustomerFirstName: customerName,
        CustomerLastName: customerLastName,
        Num_gallons_order: gallons.value,
        Date: ingredient.value,
        Date_created: new Date().toISOString(),
        Total_price: response.data.total_price || 0,
        Status: 'Pending'
      };
      
      updateUserData(newOrderData);
      console.log('QR Code Data:', JSON.stringify(newOrderData));
      console.log('API Response:', response.data);
    }

    visible.value = false;
    qrCodeModal.value = true;
    gallons.value = '';
  } catch (error) {
    console.error('Error saving order:', error);
  }
};;

// Watch for changes in the order data
watchEffect(() => {
  if (latestOrder.value && !userData.value) {
    updateUserData(latestOrder.value);
  }
});

onMounted(fetchLatestOrder);

const qrCodeSize = computed(() => {
  const screenWidth = window.innerWidth;
  if (screenWidth < 768) return 250;
  if (screenWidth < 1024) return 300;
  return 350;
});

const customers2 = ref([
  {
    activity: 10,
    representative: { name: "5" },
    amountPaid: "₱ 500.00",
    date: "2024-10-12",
  },
  {
    activity: 15,
    representative: { name: "2" },
    amountPaid: "₱ 750.00",
    date: "2024-10-11",
  },
  {
    activity: 8,
    representative: { name: "3" },
    amountPaid: "₱ 400.00",
    date: "2024-10-10",
  },
  {
    activity: 15,
    representative: { name: "2" },
    amountPaid: "₱ 750.00",
    date: "2024-10-11",
  },
  {
    activity: 8,
    representative: { name: "3" },
    amountPaid: "₱ 400.00",
    date: "2024-10-10",
  },
  {
    activity: 15,
    representative: { name: "2" },
    amountPaid: "₱ 750.00",
    date: "2024-10-11",
  },
  {
    activity: 8,
    representative: { name: "3" },
    amountPaid: "₱ 400.00",
    date: "2024-10-10",
  },

]);

function formatCurrency(value) {
  return value.toLocaleString("en-US", { style: "currency", currency: "PHP" });
}
</script>

<template>
  <div class="flex flex-col space-y-8 p-2 md:flex-row md:space-x-8 md:space-y-2">
    <div class="w-full space-y-8 md:w-2/3">
      <div class="flex items-center justify-between rounded-lg bg-blue-400 p-6 shadow-md">
        <div>
          <h1 class="text-2xl font-semibold"> {{ fullName }}! </h1>
          <p class="mt-2 text-gray-800 font-semibold"> {{ customerArea }} </p>
          <div class="flex space-x-4">
            <Button label="Order Now" @click="visible = true" />
            <Button 
              v-if="userData && userData.status === 'Pending'" 
              label="View QR Code" 
              severity="secondary" 
              @click="qrCodeModal = true" 
            />
          </div>
        </div>
      </div>

      <!-- Order Dialog -->
      <Dialog v-model:visible="visible" modal header="Order Now" :style="{ width: '25rem' }">
        <div class="flex items-center gap-4 mb-4">
          <div class="flex items-center gap-2">
            <RadioButton v-model="ingredient" inputId="ingredient1" name="day" value="Tuesday" />
            <label for="ingredient1">Tuesday</label>
          </div>
          <div class="flex items-center gap-2">
            <RadioButton v-model="ingredient" inputId="ingredient2" name="day" value="Thursday" />
            <label for="ingredient2">Thursday</label>
          </div>
        </div>
        <div class="flex items-center gap-4 mb-8">
          <label for="gallons" class="font-semibold w-25">Order Gallons : </label>
          <InputText id="gallons" v-model="gallons" class="flex-auto" autocomplete="off" />
        </div>
        <div class="flex justify-end gap-2">
          <Button type="button" label="Cancel" severity="secondary" @click="visible = false"></Button>
          <Button type="button" label="Order" @click="placeOrder"></Button>
        </div>
      </Dialog>

      <!-- QR Code Modal -->
      <Dialog v-model:visible="qrCodeModal" modal header="Your Order QR Code" :style="{ width: '25rem' }">
        <div v-if="userData" class="flex justify-center">
          <qrcode-vue :value="JSON.stringify(userData)" :size="qrCodeSize" level="H" />
        </div>
        <div v-else class="text-center">
          <p class="text-red-500">No QR code available.</p>
        </div>
      </Dialog>

      <!-- DataTable Card for Customers -->
      <div class="card shadow-md">
        <DataTable :value="customers2" scrollable scrollHeight="400px" class="mt-6">
          <Column field="activity" header="Purchase Gallons" style="min-width: 200px"></Column>
          <Column field="representative.name" header="Gallons on Hold" style="min-width: 200px"></Column>
          <Column field="amountPaid" header="Amount Paid" :body="formatCurrency" style="min-width: 200px"></Column>
          <Column field="date" header="Date" style="min-width: 200px" alignFrozen="right"></Column>
        </DataTable>
      </div>
    </div>

    <div class="w-full space-y-8 md:w-1/3">
      <div class="space-y-4">

        <div class="flex items-center justify-between p-4 rounded-lg bg-teal-100 shadow-md">
          <div class="flex items-center space-x-3">
            <div class="bg-teal-300 p-5 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-white" viewBox="0 0 24 24" fill="none"
                stroke="currentColor">
                <!-- Head -->
                <circle cx="12" cy="8" r="4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></circle>
                <!-- Body -->
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M6 20v-4a4 4 0 014-4h4a4 4 0 014 4v4"></path>
              </svg>
            </div>
            <div class="font-semibold">
              <h2 class="text-2xl font-semibold">[Name of Agent]</h2>
              <p class="text-sm text-gray-600">Assigned Agent</p>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between p-4 rounded-lg bg-indigo-100 shadow-md">
          <div class="flex items-center space-x-3">
            <div class="bg-indigo-300 p-5 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-white" viewBox="0 0 24 24" fill="none"
                stroke="currentColor">
                <!-- Bottle Body -->
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 6c-1 0-2 .8-2 2v10c0 1.2 1 2 2 2h6c1 0 2-.8 2-2V8c0-1.2-1-2-2-2H9z" />
                <!-- Bottle Neck -->
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M10 2h4c.6 0 1 .4 1 1v3H9V3c0-.6.4-1 1-1z" />
                <!-- Water Lines -->
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 11h4M10 14h4M10 17h4" />
              </svg>
            </div>
            <div class="font-semibold">
              <h2 class="text-2xl font-semibold">50</h2>
              <p class="text-sm text-gray-600">Containers on Hold</p>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between p-4 rounded-lg bg-pink-100 shadow-md">
          <div class="flex items-center space-x-3">
            <div class="bg-pink-300  p-5 rounded-full text-white text-4xl flex items-center justify-center" style="height: 75px;width: 75px;">
                ₱
            </div>
            <div class="font-semibold">
              <h2 class="text-2xl font-semibold">{{ formatCurrency(16) }}</h2>
              <p class="text-sm text-gray-600">Total Amount Payable</p>
            </div>
          </div>
        </div>


      </div>
    </div>
  </div>
</template>

<style scoped>
.qr-code-container {
  margin-left: 100px;
  text-align: left;
  max-width: 100%;
}
</style>