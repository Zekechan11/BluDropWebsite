<script setup>
import { useLayout } from "@/layout/composables/layout";
import DatePicker from "primevue/datepicker";

import { ref, onMounted } from "vue";

const products = ref();
const visible = ref(false);

const { getPrimary, getSurface, isDarkTheme } = useLayout();

onMounted(() => {
  products.value = [
    {
      name: "Zeke",
      category: "Gudalupe",
      status: "complete",
      profileImage: "/demo/images/user.jpg",
    },
    {
      name: "Jemar",
      category: "Malingin",
      status: "complete",
      profileImage: "/demo/images/user.jpg",
    },
    {
      name: "Edison",
      category: "Nailon",
      status: "delayed",
      profileImage: "/demo/images/user.jpg",
    },
    {
      name: "Leonardo",
      category: "Siocon",
      status: "ongoing",
      profileImage: "/demo/images/user.jpg",
    },
    {
      name: "Joe",
      category: "Odlot",
      status: "complete",
      profileImage: "/demo/images/user.jpg",
    },
    {
      name: "Joe",
      category: "Odlot",
      status: "complete",
      profileImage: "/demo/images/user.jpg",
    },
    {
      name: "Joe",
      category: "Odlot",
      status: "complete",
      profileImage: "/demo/images/user.jpg",
    },
    {
      name: "Joe",
      category: "Odlot",
      status: "complete",
      profileImage: "/demo/images/user.jpg",
    },
    {
      name: "Joe",
      category: "Odlot",
      status: "complete",
      profileImage: "/demo/images/user.jpg",
    },
    {
      name: "Joe",
      category: "Odlot",
      status: "complete",
      profileImage: "/demo/images/user.jpg",
    },
    {
      name: "Joe",
      category: "Odlot",
      status: "complete",
      profileImage: "/demo/images/user.jpg",
    },
    {
      name: "Joe",
      category: "Odlot",
      status: "complete",
      profileImage: "/demo/images/user.jpg",
    },
  ];
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


const selectedDay = ref(null); // For the selected day in the DatePicker
const selectedArea = ref(""); // For the input area

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
    visible.value = false;
    selectedDay.value = null;
    selectedArea.value = "";
  }
};

// Function to remove a schedule
const removeSchedule = (index) => {
  schedules.value.splice(index, 1); // Remove the schedule at the given index
};

const formatCurrency = (value) => {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
};
</script>

<template>
  <div class="grid grid-cols-12 gap-8">
    <div class="col-span-12 lg:col-span-6 xl:col-span-4">
      <div class="card mb-0 shadow-md">
        <div class="flex justify-between mb-4">
          <div>
            <span class="block text-muted-color font-medium mb-4"
              >TOTAL CUSTOMERS</span
            >
            <div
              class="text-surface-900 dark:text-surface-0 font-medium text-xl"
            >
              500
            </div>
          </div>
          <div
            class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border"
            style="width: 5rem; height: 5rem"
          >
            <i class="pi pi-users text-orange-500 !text-4xl"></i>
          </div>
        </div>
      </div>
    </div>
    <div class="col-span-12 lg:col-span-6 xl:col-span-4">
      <div class="card mb-0 shadow-md">
        <div class="flex justify-between mb-4">
          <div>
            <span class="block text-muted-color font-medium mb-4"
              >NEW CUSTOMERS</span
            >
            <div
              class="text-surface-900 dark:text-surface-0 font-medium text-xl"
            >
              100
            </div>
          </div>
          <div
            class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border"
            style="width: 5rem; height: 5rem"
          >
            <i class="pi pi-users text-cyan-500 !text-4xl"></i>
          </div>
        </div>
      </div>
    </div>
    <div class="col-span-12 lg:col-span-6 xl:col-span-4">
      <div class="card mb-0 shadow-md">
        <div class="flex justify-between mb-4">
          <div>
            <span class="block text-muted-color font-medium mb-4"
              >MONTHLY SALES</span
            >
            <div
              class="text-surface-900 dark:text-surface-0 font-medium text-xl"
            >
              20,000
            </div>
          </div>
          <div
            class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border"
            style="width: 5rem; height: 5rem"
          >
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
          <DataTable
            :value="products"
            resizableColumns
            columnResizeMode="fit"
            showGridlines
            tableStyle="min-width: 50rem"
            class="mt-4"
          >
            <Column header="Name">
              <template #body="slotProps">
                <div class="flex items-center">
                  <img
                    :src="slotProps.data.profileImage"
                    alt="Profile"
                    class="w-8 h-8 object-cover rounded-full mr-2"
                  />
                  {{ slotProps.data.name }}
                </div>
              </template>
            </Column>
            <Column field="category" header="Area"></Column>
            <Column header="Status">
              <template #body="slotProps">
                <span
                  :class="{
                    'bg-green-500 text-white font-semibold rounded py-1 px-2':
                      slotProps.data.status === 'complete',
                    'bg-yellow-500 text-white font-semibold rounded py-1 px-2':
                      slotProps.data.status === 'delayed',
                    'bg-blue-500 text-white font-semibold rounded py-1 px-2':
                      slotProps.data.status === 'ongoing',
                  }"
                >
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

    <div class="col-span-12 xl:col-span-4">
      <div class="card shadow-md" style="background-color: #fbfcfc">
        <div class="flex items-center justify-between mb-6">
          <div class="font-semibold text-xl">SCHEDULES</div>
          <div>
            <Button
              label="Add Schedule"
              icon="pi pi-fw pi-plus"
              @click="visible = true"
            />
          </div>
        </div>

        <ul class="p-0 mx-0 mt-0 mb-6 list-none">
          <li
            v-for="(schedule, index) in schedules"
            :key="index"
            class="flex items-center justify-between py-2"
          >
            <span
              class="leading-normal p-2 rounded w-full text-xl font-medium"
              :class="schedule.color,{
                'bg-blue-300': schedule.type === 'regular',
                'bg-yellow-200': schedule.type === 'priority',
              }"
            >
              {{ schedule.day }} - {{ schedule.area }}
            </span>
            <i
              class="pi pi-times text-red-500 cursor-pointer ml-4"
              @click="removeSchedule(index)"
            ></i>
          </li>
        </ul>
      </div>

      <!-- Modal -->
      <Dialog
  v-model:visible="visible"
  modal
  header="Add Schedule"
  :style="{ width: '25rem' }"
>
  <div class="flex items-center gap-4 mb-4">
    <label for="day" class="font-semibold w-24">Day</label>
    <DatePicker
      id="day"
      v-model="selectedDay"
      class="flex-auto"
      dateFormat="dd/mm/yy"
      placeholder="Select a date"
    />
  </div>
  <div class="flex items-center gap-4 mb-8">
    <label for="area" class="font-semibold w-24">Area</label>
    <InputText id="area" v-model="selectedArea" class="flex-auto" autocomplete="off" />
  </div>
  <div class="flex justify-end gap-2">
    <Button
      type="button"
      label="Cancel"
      severity="secondary"
      @click="visible = false"
    ></Button>
    <Button type="button" label="Save" @click="saveSchedule"></Button>
  </div>
</Dialog>

    </div>
  </div>
</template>
