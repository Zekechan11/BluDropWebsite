<script setup>
import { useLayout } from "@/layout/composables/layout";
import { ref, onMounted, computed } from 'vue';
import QrcodeVue from 'qrcode.vue';
import axios from 'axios'; // Import axios

const ORDER_URL = 'http://localhost:9090';

const { getPrimary, getSurface, isDarkTheme } = useLayout();

const userData = ref('');
const customerName = localStorage.getItem("firstName");
const customerLastName = localStorage.getItem("lastName");
const customerArea = localStorage.getItem("area");
const visible = ref(false);
const ingredient = ref('Tuesday');
const gallons = ref();


const fullName = computed(() => {
  return `${customerName} ${customerLastName}`;
});


const placeOrder = async () => {
  try {
    const response = await axios.post(`${ORDER_URL}/api/save_order`, {
      num_gallons_order: gallons.value,
      date: ingredient.value
    });

    console.log('Order saved:', response.data);
    visible.value = false;
    gallons.value = '';
  } catch (error) {
    console.error('Error saving order:', error);
  }
};

const qrCodeSize = computed(() => {
  const screenWidth = window.innerWidth;
  if (screenWidth < 768) {
    return 100;
  } else if (screenWidth < 1024) {
    return 120;
  } else {
    return 150;
  }
});

onMounted(() => {

});

// Mock data for customers2
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
          <Button label="Order Now" @click="visible = true" />
        </div>
        <!-- QR Code Section -->
        <div v-if="userData" class="qr-code-container">
          <qrcode-vue :value="userData.username || userData.email" :size="qrCodeSize" level="H" />
        </div>

        <div v-else>
          <p class="text-sm text-red-500">No QR code available.</p>
        </div>
      </div>

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
            <div class="bg-teal-300 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0-3a7 7 0 11-7 7 7 7 0 017-7z" />
              </svg>
            </div>
            <div class="font-semibold">
              <h2 class="text-2xl font-semibold">Zeke</h2>
              <p class="text-sm text-gray-600">Agent</p>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-between p-4 rounded-lg bg-indigo-100 shadow-md">
          <div class="flex items-center space-x-3">
            <div class="bg-indigo-300 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div class="font-semibold">
              <h2 class="text-2xl font-semibold">50</h2>
              <p class="text-sm text-gray-600">COL</p>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-between p-4 rounded-lg bg-pink-100 shadow-md">
          <div class="flex items-center space-x-3">
            <div class="bg-pink-300 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 7h8M8 11h4m-6 4h10a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="font-semibold">
              <h2 class="text-2xl font-semibold">₱ 25.00</h2>
              <p class="text-sm text-gray-600">Price Per. Gallon</p>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-between p-4 rounded-lg bg-pink-100 shadow-md">
          <div class="flex items-center space-x-3">
            <div class="bg-pink-300 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 7h8M8 11h4m-6 4h10a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="font-semibold">
              <h2 class="text-2xl font-semibold">02/11/2020</h2>
              <p class="text-sm text-gray-600">Date</p>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-between p-4 rounded-lg bg-pink-100 shadow-md">
          <div class="flex items-center space-x-3">
            <div class="bg-pink-300 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 7h8M8 11h4m-6 4h10a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="font-semibold">
              <h2 class="text-2xl font-semibold">20</h2>
              <p class="text-sm text-gray-600">Purchased Gallons</p>
            </div>
          </div>
        </div>
        <div style="position: relative;top: 30px;"
          class="flex items-center justify-between p-4 rounded-lg bg-pink-100 shadow-md">
          <div class="flex items-center space-x-3">
            <div class="bg-pink-300 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 7h8M8 11h4m-6 4h10a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="font-semibold">
              <h2 class="text-2xl font-semibold">{{ formatCurrency(16) }}</h2>
              <p class="text-sm text-gray-600">Amount Paid</p>
            </div>
          </div>
        </div>
        <div style="position: relative;top: 30px;"
          class="flex items-center justify-between p-4 rounded-lg bg-pink-100 shadow-md">
          <div class="flex items-center space-x-3">
            <div class="bg-pink-300 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 7h8M8 11h4m-6 4h10a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="font-semibold">
              <h2 class="text-2xl font-semibold">{{ formatCurrency(16) }}</h2>
              <p class="text-sm text-gray-600">Amount Payable</p>
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
  /* Align QR code to the left */
  max-width: 100%;
  /* Ensure it fits within the container */
}
</style>
