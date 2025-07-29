<script setup>
import axios from "axios";
import QrcodeVue from "qrcode.vue";
import { computed, onMounted, ref, watchEffect } from "vue";
import { WATER_API } from "../../config";
import { attempt } from "../../service/attempt";

const user_data = JSON.parse(localStorage.getItem("user_data"));

const visible = ref(false);
const qrCodeModal = ref(false);
const ingredient = ref("");
const latestOrder = ref(null);
const userData = ref(null);
const days = ref({});
const pricePerGallon = ref(0.0);
const gallons = ref(0);
const agentName = ref("");
const dashboardData = ref("");
const customers2 = ref([]);
const selectedOrder = ref(null);
const selectedOrderModal = ref(false);

const customerArea = user_data.area;
const fullName = computed(() => {
  return `${user_data.firstname} ${user_data.lastname}`;
});

const fetchLatestOrder = async () => {
  try {
    const response = await axios.get(`${WATER_API}/api/get_order`, {
      params: {
        customer_id: user_data.uid,
        status: "Pending",
      },
    });

    const orderData = Array.isArray(response.data)
      ? response.data[0]
      : response.data;

    if (orderData && orderData.CustomerID === parseInt(user_data.uid)) {
      updateUserData(orderData);
    } else {
      resetOrderData();
    }
  } catch (error) {
    console.error("Error fetching latest order:", error);
    resetOrderData();
  }
};

const updateUserData = (orderData) => {
  latestOrder.value = orderData;
  userData.value = {
    orderId: orderData.ID, // Make sure to map from the ID field
    customerId: orderData.CustomerID,
    customerFirstName: orderData.CustomerFirstName,
    customerLastName: orderData.CustomerLastName,
    gallons: orderData.Num_gallons_order,
    date: orderData.Date,
    dateCreated: orderData.Date_created,
    totalPrice: orderData.Total_price,
    status: orderData.Status,
    customerArea: customerArea,
    type: orderData.Type,
    col: orderData.COL,
  };
};

const resetOrderData = () => {
  latestOrder.value = null;
  userData.value = null;
};

const getDashboardData = async () => {
  const [agentResponse, agentError] = await attempt(
    axios.get(`${WATER_API}/v2/api/agent/assigned/${user_data.area_id}`)
  );
  if (agentError) {
    console.error("Field at ", agentError);
  } else {
    agentName.value = agentResponse.data.data;
  }

  const [dayResponse, dayError] = await attempt(
    axios.get(`${WATER_API}/api/get_schedule`)
  );
  if (dayError) {
    console.error("Field at ", dayError);
  } else {
    days.value = dayResponse.data.days;
  }

  const [countResponse, countError] = await attempt(
    axios.get(`${WATER_API}/v2/api/dashboard/${user_data.uid}`)
  );
  if (countError) {
    console.error("Field at ", countError);
  } else {
    dashboardData.value = countResponse.data;
  }

  const [transactionResponse, transactionError] = await attempt(
    axios.get(`${WATER_API}/v2/api/orders/${user_data.uid}`)
  );
  if (transactionError) {
    console.error("Field at ", transactionError);
  } else {
    customers2.value = transactionResponse.data;
  }

  const [priceResponse, priceError] = await attempt(
    axios.get(`${WATER_API}/api/price/${user_data.type}`)
  );
  if (priceError) {
    console.error("Field at ", priceError);
  } else {
    pricePerGallon.value = priceResponse.data;
  }
};

const placeOrder = async () => {
  try {
    const response = await axios.post(`${WATER_API}/api/save_order`, {
      customer_id: user_data.uid,
      num_gallons_order: parseInt(gallons.value),
      date: ingredient.value,
      area_id: parseInt(user_data.area_id),
      type: user_data.type,
    });

    console.log("Order saved:", response.data);

    if (response.data) {
      const newOrderData = {
        ID: response.data.order_id, // Map from the API response
        CustomerID: parseInt(user_data.uid),
        CustomerFirstName: user_data.firstname,
        CustomerLastName: user_data.lastname,
        Num_gallons_order: parseInt(gallons.value),
        Date: ingredient.value,
        Date_created: new Date().toISOString(),
        Total_price: response.data.total_price,
        Status: "Pending",
        Type: response.data.order.type,
        COL: response.data.col,
      };

      updateUserData(newOrderData);
      console.log("QR Code Data:", JSON.stringify(newOrderData));
    }

    visible.value = false;
    qrCodeModal.value = true;
    gallons.value = "";
  } catch (error) {
    console.error("Error saving order:", error);
  }
};

// Watch for changes in the order data
watchEffect(() => {
  if (latestOrder.value && !userData.value) {
    updateUserData(latestOrder.value);
  }
});

onMounted(() => {
  getDashboardData();
  fetchLatestOrder();
});

const qrCodeSize = computed(() => {
  const screenWidth = window.innerWidth;
  if (screenWidth < 768) return 250;
  if (screenWidth < 1024) return 300;
  return 350;
});

function formatCurrency(value) {
  return value.toLocaleString("en-US", { style: "currency", currency: "PHP" });
}

const validateGallons = () => {
  if (gallons.value > 80) {
    gallons.value = 80;
  } else if (gallons.value < 0) {
    gallons.value = 0;
  }
};

const viewQR = (order) => {
  selectedOrder.value = {
    orderId: order.id,
    customerId: user_data.uid,
    customerFirstName: user_data.firstname,
    customerLastName: user_data.lastname,
    gallons: order.num_gallons_order,
    date: order.date,
    dateCreated: order.date_created,
    totalPrice: order.total_price,
    status: order.status,
    customerArea: customerArea,
    type: user_data.type,
    col: order.total_containers_on_loan,
  };
  selectedOrderModal.value = true;
};

const totalPayment = computed(() => {
  return gallons.value * pricePerGallon.value;
});
</script>

<template>
  <div class="flex flex-col space-y-8 p-2 md:flex-row md:space-x-8 md:space-y-2">
    <div class="w-full space-y-8 md:w-2/3">
      <div class="relative rounded-lg shadow-md overflow-hidden min-h-[180px]" style="
          background-image: url(&quot;/demo/images/bg.jpg&quot;);
          background-size: cover;
          background-position: center;
        ">
        <!-- Overlay for better readability -->
        <div class="absolute inset-0 bg-gradient-to-r from-blue-900/60 to-blue-600/40"></div>

        <div class="relative z-10 p-6 text-white flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-2xl font-bold text-blue-200">
              Welcome, {{ fullName }}!
            </h1>
            <p class="mt-1 text-sm font-medium">
              <i class="pi pi-map-marker mr-2"></i>{{ customerArea }}
            </p>
            <div class="flex flex-wrap gap-3 mt-4">
              <Button icon="pi pi-shopping-cart" label="Order Now" class="p-button-sm p-button-raised"
                @click="visible = true" />
              <Button v-if="userData && userData.status === 'Pending'" label="View QR Code" severity="secondary"
                icon="pi pi-qrcode" class="p-button-sm p-button-outlined !text-white border-white hover:!text-black"
                @click="qrCodeModal = true" />
            </div>
          </div>
        </div>
      </div>

      <!-- Order Dialog -->
      <Dialog v-model:visible="visible" modal header="Place Your Order" :style="{ width: '100%', maxWidth: '32rem' }"
        class="p-dialog-modern">
        <!-- Delivery Day Selection -->
        <div class="mb-6">
          <h3 class="font-semibold mb-3 text-lg text-gray-800">Choose Delivery Day</h3>
          <div class="space-y-3">
            <div v-for="day in days" :key="day.date"
              class="flex items-center gap-3 p-3 rounded-md hover:bg-gray-50 transition cursor-pointer">
              <RadioButton v-model="ingredient" :inputId="'day-' + day.date" name="deliveryDay" :value="day.date" />
              <label :for="'day-' + day.date" class="text-gray-700 font-medium">
                {{ day.day }} — {{ day.date }}
              </label>
            </div>
          </div>
        </div>

        <div class="mb-6 space-y-2">
          <label for="gallons" class="font-semibold text-gray-800">Gallons to Order</label>
          <InputText id="gallons" v-model="gallons" class="w-full" autocomplete="off" type="number" min="0" max="80"
            placeholder="Enter quantity (max 80)" @input="validateGallons" />
          <div class="text-sm text-red-500 font-medium">
            <i class="pi pi-exclamation-circle"></i> Only 80 gallons available per order.
          </div>
        </div>

        <div class="mb-6 p-3 rounded-md bg-gray-100">
          <div class="text-sm text-gray-600">Price per gallon:</div>
          <div class="text-lg font-bold text-green-600 mb-1">₱{{ pricePerGallon.toFixed(2) }}</div>
          <div class="text-sm text-gray-600">Amount to pay:</div>
          <div class="text-xl font-bold text-blue-700">₱{{ totalPayment.toFixed(2) }}</div>
        </div>

        <div class="flex justify-end gap-3">
          <Button type="button" label="Cancel" severity="secondary" icon="pi pi-times" @click="visible = false" />
          <Button type="button" label="Confirm Order" icon="pi pi-check" @click="placeOrder"
            :disabled="!ingredient || gallons <= 0" />
        </div>
      </Dialog>

      <!-- QR Code Modal -->
      <Dialog v-model:visible="qrCodeModal" modal header="Your Order QR Code"
        :style="{ width: '100%', maxWidth: '26rem' }" class="p-dialog-modern">
        <div v-if="userData" class="flex flex-col items-center justify-center space-y-4 p-4">
          <qrcode-vue :value="JSON.stringify(userData)" :size="qrCodeSize" level="H" />
          <p class="text-sm text-gray-600 text-center">
            Show this QR code during delivery for faster verification.
          </p>
        </div>

        <div v-else class="flex flex-col items-center justify-center text-center text-red-500 py-6 space-y-2">
          <i class="pi pi-exclamation-triangle text-3xl"></i>
          <p class="font-semibold text-lg">No QR Code Available</p>
          <p class="text-sm text-gray-500">We couldn't retrieve your data. Try again later.</p>
        </div>
      </Dialog>

      <!-- DataTable Card for Customers -->
      <div class="card shadow-md">
        <DataTable :value="customers2" scrollable scrollHeight="400px" stripedRows rowHover
          tableStyle="min-width: 600px">
          <template #header>

            <h4 class="text-lg font-semibold flex items-center gap-2">
              <i class="pi pi-list"></i> Recent Orders
            </h4>

          </template>

          <Column field="num_gallons_order" header="Purchase Gallons" style="min-width: 180px">
            <template #body="{ data }">
              <span class="font-medium text-gray-800 flex items-center gap-1">
                <i class="pi pi-shopping-cart text-gray-500" />
                {{ data.num_gallons_order }} gal
              </span>
            </template>
          </Column>

          <Column field="returned_gallons" header="Returned Gallons" style="min-width: 180px">
            <template #body="{ data }">
              <span class="text-gray-600 flex items-center gap-1">
                <i class="pi pi-refresh text-gray-400" />
                {{ data.returned_gallons || 0 }} gal
              </span>
            </template>
          </Column>

          <Column field="payment" header="Amount Paid" style="min-width: 180px">
            <template #body="{ data }">
              <span class="text-green-600 font-semibold flex items-center gap-1">
                <i class="pi pi-wallet" /> ₱{{ data.payment }}
              </span>
            </template>
          </Column>

          <Column field="date" header="Date" style="min-width: 180px">
            <template #body="{ data }">
              <span class="text-sm text-gray-500 flex items-center gap-1">
                <i class="pi pi-calendar" />
                {{ new Date(data.date).toLocaleDateString() }}
              </span>
            </template>
          </Column>

          <Column field="status" header="Status" style="min-width: 180px">
            <template #body="{ data }">
              <Button v-if="data.status === 'Completed'" label="Order Complete" severity="secondary"
                icon="pi pi-check-circle" class="p-button-sm p-button-outlined !border-green-500 !text-green-500"
                disabled />
              <Button v-else label="View QR Code" severity="secondary"
                icon="pi pi-qrcode" class="p-button-sm p-button-outlined border-black hover:!text-blue-500"
                @click="viewQR(data) " />
            </template>
          </Column>

          <template #empty>
            <div class="flex flex-col items-center justify-center py-12 text-gray-500 space-y-4">
              <i class="pi pi-inbox text-4xl text-blue-400" />
              <h3 class="text-xl font-semibold">No Orders Found</h3>
              <p class="text-center max-w-xs text-sm">
                You haven't placed any orders yet. Get started by creating a new order.
              </p>
              <Button label="Create Order" icon="pi pi-plus" class="mt-2 px-4 py-2" severity="primary"
                @click="visible = true" />
            </div>
          </template>

        </DataTable>
      </div>

    <Dialog v-model:visible="selectedOrderModal" modal header="Your Order QR Code"
        :style="{ width: '100%', maxWidth: '26rem' }" class="p-dialog-modern">
        <div v-if="selectedOrder" class="flex flex-col items-center justify-center space-y-4 p-4">
          <qrcode-vue :value="JSON.stringify(selectedOrder)" :size="qrCodeSize" level="H" />
          <p class="text-sm text-gray-600 text-center">
            Show this QR code during delivery for faster verification.
          </p>
        </div>

        <div v-else class="flex flex-col items-center justify-center text-center text-red-500 py-6 space-y-2">
          <i class="pi pi-exclamation-triangle text-3xl"></i>
          <p class="font-semibold text-lg">No QR Code Available</p>
          <p class="text-sm text-gray-500">We couldn't retrieve your data. Try again later.</p>
        </div>
      </Dialog>

    </div>

    <div class="w-full space-y-8 md:w-1/3">
      <div class="space-y-4">

        <div class="flex items-center justify-between p-5 rounded-xl bg-white shadow-lg border border-gray-100">
          <div class="flex items-center space-x-4">
            <div
              class="bg-gradient-to-br from-emerald-400 to-teal-500 text-white rounded-full flex items-center justify-center"
              style="height: 70px; width: 70px">
              <i class="pi pi-user !text-2xl"></i>
            </div>
            <div class="font-semibold">
              <h2 class="text-xl font-bold text-gray-800">
                {{ agentName || "Agent is Dead 💀" }}
              </h2>
              <p class="text-sm text-gray-500">Assigned Agent</p>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between p-5 rounded-xl bg-white shadow-lg border border-gray-100">
          <div class="flex items-center space-x-4">
            <div
              class="bg-gradient-to-br from-indigo-400 to-violet-500 text-white rounded-full flex items-center justify-center"
              style="height: 70px; width: 70px">
              <i class="pi pi-box !text-2xl"></i>
            </div>
            <div class="font-semibold">
              <h2 class="text-xl font-bold text-gray-800">
                {{ dashboardData.col || 0 }}
              </h2>
              <p class="text-sm text-gray-500">Containers on Hold</p>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between p-5 rounded-xl bg-white shadow-lg border border-gray-100">
          <div class="flex items-center space-x-4">
            <div
              class="bg-gradient-to-br from-rose-400 to-pink-500 text-white rounded-full flex items-center justify-center"
              style="height: 70px; width: 70px">
              <i class="pi pi-wallet !text-2xl"></i>
            </div>
            <div class="font-semibold">
              <h2 class="text-xl font-bold text-gray-800">
                {{ formatCurrency(dashboardData.loan || 0) }}
              </h2>
              <p class="text-sm text-gray-500">Total Amount Payable</p>
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
