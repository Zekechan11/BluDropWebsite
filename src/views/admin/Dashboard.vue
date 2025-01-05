<script setup>
import { useLayout } from "@/layout/composables/layout";
import DatePicker from "primevue/datepicker";
import axios from "axios"; // Import Axios
import { ref, onMounted, computed } from "vue";

const { getPrimary, getSurface, isDarkTheme } = useLayout();
const CUSTOMER_URL = "http://localhost:9090";
const ORDER_URL = "http://localhost:9090";

const products = ref();
const schedule = ref(false);
const selectedCity1 = ref();
const totalCustomer = ref(0);
const orders = ref([]);
const visible = ref(false);
const customers = ref(false);

const orderCount = computed(() => orders.value.length);

const fetchOrders = async () => {
  try {
    const response = await axios.get(`${ORDER_URL}/api/get_order`);
    orders.value = response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
  }
};

const fetchTotalCustomer = async () => {
  try {
    const response = await axios.get(`${CUSTOMER_URL}/users/count`);
    totalCustomer.value = response.data.total_users;
  } catch (error) {
    console.error("Error fetching total users:", error);
  }
};

onMounted(() => {
  products.value = [
    {
      name: "Zeke",
      area: "Guadalupe",
      status: "complete",
      profileImage: "/demo/images/user.jpg",
    },
  ];
  fetchTotalCustomer();
  fetchOrders();
});

// Schedules data
const schedules = ref([
  { day: "Monday", area: "Cogon", type: "regular" },
  { day: "Tuesday", area: "Cogon", type: "priority" },
  { day: "Wednesday", area: "Cogon", type: "regular" },
  { day: "Thursday", area: "Cogon", type: "priority" },
  { day: "Friday", area: "Cogon", type: "regular" },
  { day: "Saturday", area: "Cogon", type: "priority" },
]);

const selectedDay = ref(null);
const selectedArea = ref("");

const saveSchedule = () => {
  if (selectedDay.value && selectedArea.value) {
    const date = new Date(selectedDay.value);

    // Convert the selected date to the day name
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });

    // Determine the color class based on the day
    const colorClass = ["Monday", "Wednesday", "Friday"].includes(dayName)
      ? "bg-blue-300" // Blue for Mon, Wed, Fri
      : ["Tuesday", "Thursday", "Saturday"].includes(dayName)
        ? "bg-yellow-200" // Yellow for Tue, Thu, Sat
        : "bg-gray-200"; // Default for Sunday or if not recognized

    schedules.value.push({
      day: dayName,
      area: selectedArea.value,
      type: "regular", // Default to 'regular'
      color: colorClass, // Add the color class to the schedule
    });

    // Reset and close modal
    selectedDay.value = null;
    selectedArea.value = "";
  }
};

const removeSchedule = (index) => {
  schedules.value.splice(index, 1);
};

const formatCurrency = (value) => {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
};
</script>

<template>
  <div class="grid grid-cols-12 gap-8">
    <div class="col-span-12 lg:col-span-6 xl:col-span-4 cursor-pointer" @click="customers = true">
      <div class="card mb-0 shadow-md">
        <div class="flex justify-between mb-4">
          <div>
            <span class="block text-muted-color font-medium mb-4">TOTAL CUSTOMERS</span>
            <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
              {{ totalCustomer }}
            </div>
          </div>
          <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border"
            style="width: 5rem; height: 5rem">
            <i class="pi pi-users text-orange-500 !text-4xl"></i>
          </div>
        </div>
      </div>
      <Dialog v-model:visible="customers" modal header="Total Customer's" :style="{ width: '50rem' }"
        :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">

        <div class="flex justify-end mb-4">
          <div class="flex items-center gap-2 w-auto">
            <label for="areaFilter" class="font-semibold">Filter Area:</label>
            <Dropdown id="areaFilter" v-model="selectedArea" :options="areaOptions" optionLabel="label"
              placeholder="Select an area" style="width: 12rem;" />
          </div>
        </div>

        <DataTable :value="filteredCustomers" showGridlines tableStyle="min-width: 40rem">
          <Column field="name" header="Name"></Column>
          <Column field="area" header="Area"></Column>
          <Column field="payables" header="Payables"></Column>
          <Column field="col" header="COL"></Column>
        </DataTable>
      </Dialog>

    </div>

    <div class="col-span-12 lg:col-span-6 xl:col-span-4 cursor-pointer" @click="visible = true">
      <div class="card mb-0 shadow-md">
        <div class="flex justify-between mb-4">
          <div>
            <span class="block text-muted-color font-medium mb-4">DELIVERY</span>
            <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
              {{ orderCount }}
            </div>
          </div>
          <div class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border"
            style="width: 5rem; height: 5rem">
            <i class="pi pi-users text-cyan-500 !text-4xl"></i>
          </div>
        </div>
      </div>
      <Dialog v-model:visible="visible" modal header="Customer's Order" :style="{ width: '50rem' }"
        :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
        <DataTable :value="orders" showGridlines tableStyle="min-width: 40rem">
          <Column field="name" header="Name"></Column>
          <Column field="Num_gallons_order" header="Quantity"></Column>
          <Column field="payable" header="Payables"></Column>
          <Column field="Date" header="Date"></Column>
        </DataTable>
      </Dialog>
    </div>

    <div class="col-span-12 lg:col-span-6 xl:col-span-4">
      <div class="card mb-0 shadow-md">
        <div class="flex justify-between mb-4">
          <div>
            <span class="block text-muted-color font-medium mb-4">MONTHLY SALES</span>
            <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
              20,000
            </div>
          </div>
          <div class="flex items-center justify-center bg-green-100 dark:bg-purple-400/10 rounded-border"
            style="width: 5rem; height: 5rem">
            <i class="pi pi-paypal text-purple-500 !text-4xl"></i>
          </div>
        </div>
      </div>
    </div>

    <div class="col-span-12 xl:col-span-8">
      <div class="card shadow-md" style="background-color: #fbfcfc">
        <div class="font-semibold text-xl">AGENTS</div>
        <!-- Add a wrapper for scrollable table -->
        <div style="max-height: 400px; overflow-y: auto">
          <!-- Set your desired height here -->
          <DataTable :value="products" resizableColumns columnResizeMode="fit" showGridlines
            tableStyle="min-width: 50rem" class="mt-4">
            <Column header="Name">
              <template #body="slotProps">
                <div class="flex items-center">
                  <img :src="slotProps.data.profileImage" alt="Profile"
                    class="w-8 h-8 object-cover rounded-full mr-2" />
                  {{ slotProps.data.name }}
                </div>
              </template>
            </Column>
            <Column field="area" header="Area"></Column>
            <Column header="Status">
              <template #body="slotProps">
                <span :class="{
                  'bg-green-500 text-white font-semibold rounded py-1 px-2':
                    slotProps.data.status === 'complete',
                  'bg-yellow-500 text-white font-semibold rounded py-1 px-2':
                    slotProps.data.status === 'delayed',
                  'bg-blue-500 text-white font-semibold rounded py-1 px-2':
                    slotProps.data.status === 'ongoing',
                }">
                  {{
                    slotProps.data.status === "complete"
                      ? "Complete"
                      : slotProps.data.status === "delayed"
                        ? "Delayed"
                        : "Ongoing"
                  }}
                </span>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>

    <div class="col-span-12 lg:col-span-6 xl:col-span-4">
      <div class="col-span-12 xl:col-span-4">
        <div class="card shadow-md" style="background-color: #fbfcfc">
          <div class="flex items-center justify-between mb-6">
            <div class="font-semibold text-xl">SCHEDULES</div>
            <div>
              <Button label="Add Schedule" icon="pi pi-fw pi-plus" @click="schedule = true" />
            </div>
          </div>

          <ul class="p-0 mx-0 mt-0 mb-6 list-none">
            <li v-for="(schedule, index) in schedules" :key="index" class="flex items-center justify-between py-2">
              <span class="leading-normal p-2 rounded w-full text-xl font-medium" :class="(schedule.color,
              {
                'bg-blue-300': schedule.type === 'regular',
                'bg-yellow-200': schedule.type === 'priority',
              })
                ">
                {{ schedule.day }} - {{ schedule.area }}
              </span>
              <i class="pi pi-times text-red-500 cursor-pointer ml-4" @click="removeSchedule(index)"></i>
            </li>
          </ul>
        </div>

        <!-- Modal -->
        <Dialog v-model:visible="schedule" modal header="Add Schedule" :style="{ width: '25rem' }">
          <div class="flex items-center gap-4 mb-4">
            <label for="day" class="font-semibold w-24">Day</label>
            <DatePicker id="day" v-model="selectedDay" class="flex-auto" dateFormat="dd/mm/yy"
              placeholder="Select a date" />
          </div>
          <div class="flex items-center gap-4 mb-8">
            <label for="area" class="font-semibold w-24">Area</label>
            <Select v-model="selectedCity1" placeholder="Select Area" class="w-full md:w-56" />
          </div>
          <div class="flex justify-end gap-2">
            <Button type="button" label="Cancel" severity="secondary" @click="schedule = false"></Button>
            <Button type="button" label="Save" @click="saveSchedule"></Button>
          </div>
        </Dialog>
      </div>
    </div>
  </div>
</template>
