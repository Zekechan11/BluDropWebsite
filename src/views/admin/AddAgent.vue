<script setup>
import { FilterMatchMode } from "@primevue/core/api";
import axios from "axios";
import { useToast } from "primevue/usetoast";
import { onMounted, ref } from "vue";
import { WATER_API } from "../../config";
import { attempt } from "../../service/attempt";

const toast = useToast();
const dt = ref();
const agent = ref({});
const area = ref({});
const agents = ref([]);
const agentDialog = ref(false);
const deleteAgentDialog = ref(false);
const deleteAgentsDialog = ref(false);
const selectedAgents = ref();
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const submitted = ref(false);
const op = ref();

const openNew = () => {
  agent.value = {};
  area.value = {};
  submitted.value = false;
  agentDialog.value = true;
};

const hideDialog = () => {
  agentDialog.value = false;
  submitted.value = false;
};

const areas = ref([]);

const fetchAreas = async () => {
  try {
    const response = await axios.get(`${WATER_API}/area`);
    const data = response.data;

    areas.value = data.map((area) => {
      return {
        ...area,
      };
    });
  } catch (error) {
    console.error("Error fetching areas:", error);
  }
};

const fetchAgents = async () => {
  try {
    const response = await axios.get(`${WATER_API}/v2/api/get_staff/all/Agent`);
    const data = response.data;

    agents.value = data.map((agent) => {
      return {
        ...agent,
      };
    });
  } catch (error) {
    console.error("Error fetching agents:", error);
  }
};

onMounted(async () => {
  await fetchAreas();
  await fetchAgents();
});

const createAgent = async () => {
  try {
    const payload = {
      firstname: agent.value.firstname,
      lastname: agent.value.lastname,
      email: agent.value.email,
      password: agent.value.password,
      area_id: Number(agent.value.area_id),
    };

    const response = await axios.post(
      `${WATER_API}/v2/api/create_staff/Agent`,
      payload
    );
    agents.value.push({
      staff_id: response.data.data.staff_id,
      firstname: agent.value.firstname,
      lastname: agent.value.lastname,
      email: agent.value.email,
      password: agent.value.password,
      area: areas.value.find((a) => a.value === agent.value.area)?.area,
      area_id: agent.value.area_name,
    });
    toast.add({
      severity: "success",
      summary: "Successful",
      detail: "Agent Created",
      life: 3000,
    });
  } catch (error) {
    console.error("Failed to create agent:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Failed to create agent",
      life: 3000,
    });
  }
};

const updateAgent = async () => {
  try {
    const payload = {
      firstname: agent.value.firstname,
      lastname: agent.value.lastname,
      email: agent.value.email,
      password: agent.value.password,
      area_id: Number(agent.value.area_id),
    };

    await axios.put(
      `${WATER_API}/v2/api/update_staff/${agent.value.staff_id}`,
      payload
    );
    const index =
      agents.value.findIndex((a) => a.staff_id === agent.value.staff_id);
    if (index !== -1) {
      agents.value[index] = {
        ...agents.value[index],
        firstname: agent.value.firstname,
        lastname: agent.value.lastname,
        email: agent.value.email,
        password: agent.value.password,
        area: areas.value.find((a) => a.id === agent.value.area_id)?.area,
        area_id: agent.value.area_name,
      };
    }
    toast.add({
      severity: "success",
      summary: "Successful",
      detail: "Agent Updated",
      life: 3000,
    });
  } catch (error) {
    console.error("Failed to update agent:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Failed to update agent",
      life: 3000,
    });
  }
};

const saveAgent = async () => {
  submitted.value = true;

  if (
    !agent.value.firstname ||
    !agent.value.lastname ||
    !agent.value.email ||
    !agent.value.password ||
    !agent.value.area_id
  ) {
    toast.add({
      severity: 'warn',
      summary: 'Incomplete Form',
      detail: 'Please fill in all required fields.',
      life: 3000,
    });
    return;
  }

  if (agent.value.staff_id) {
    await updateAgent();
  } else {
    await createAgent();
  }

  agentDialog.value = false;
  agent.value = {};
  area.value = {};
};

const editAgent = (selectedAgent) => {
  agent.value = { ...selectedAgent };
  agentDialog.value = true;
};

// Confirm and delete a single agent
const confirmDeleteAgent = (selectedAgent) => {
  agent.value = selectedAgent;
  deleteAgentDialog.value = true;
};

const deleteAgent = async () => {
  try {
    await axios.delete(
      `${WATER_API}/v2/api/delete_staff/${agent.value.staff_id}`
    );
    agents.value = agents.value.filter(
      (existingAgent) => existingAgent.staff_id !== agent.value.staff_id
    );
    deleteAgentDialog.value = false;
    toast.add({
      severity: "success",
      summary: "Agent Deleted",
      detail: "Successfully deleted agent",
      life: 3000,
    });
  } catch (error) {
    console.error("Error deleting agent:", error);
  }
};

const confirmDeleteSelected = () => {
  deleteAgentsDialog.value = true;
};

const deleteSelectedAgents = async () => {
  try {
    for (const selectedAgent of selectedAgents.value) {
      await axios.delete(
        `${WATER_API}/v2/api/delete_staff/${selectedAgent.staff_id}`
      );
    }
    agents.value = agents.value.filter(
      (agent) =>
        !selectedAgents.value.some(
          (selected) => selected.staff_id === agent.staff_id
        )
    );
    selectedAgents.value = null;
    deleteAgentsDialog.value = false;
    toast.add({
      severity: "success",
      summary: "Successful",
      detail: "Selected Agents Deleted",
      life: 3000,
    });
  } catch (error) {
    console.error("Error deleting selected agents:", error);
  }
};

const updateRoute = async (slotProps, areaId) => {
  if (!slotProps || !slotProps.staff_id) {
    console.error("Invalid id object passed:", slotProps);
    return;
  }
  op.value.hide();

  const payload = {
    area_id: areaId,
  };

  const [_, error] = await attempt(
    axios.put(`${WATER_API}/v2/api/update_staff/area/${slotProps.staff_id}`, payload)
  );

  toast.add({
    severity: "success",
    summary: "Successful",
    detail: "Agent area has been changed",
    life: 3000,
  });

  if (error) {
    console.error("API error:", error);
    return;
  }
  const index = agents.value.findIndex((a) => a.staff_id === slotProps.staff_id);
  console.log(index)

  if (index !== -1) {
    agents.value[index] = {
      ...agents.value[index],
      area: areas.value.find((a) => a.id === areaId)?.area,
      area_id: areaId,
    };
  } else {
    console.warn("Agent not found for staff_id:", id.staff_id);
  }
};

const toggle = (event) => {
  op.value.toggle(event);
}
</script>

<template>
  <div class="space">
    <h1 class="text-4xl font-semibold mb-6" style="color: #899499">
      Add Agent
    </h1>
  </div>
  <div>
    <div class="card shadow-md">
      <Toolbar class="mb-6">
        <template #start>
          <Button label="New" icon="pi pi-plus" severity="success" class="mr-2" @click="openNew" />
          <Button label="Delete" icon="pi pi-trash" severity="danger" @click="confirmDeleteSelected"
            :disabled="!selectedAgents || !selectedAgents.length" />
        </template>
      </Toolbar>

      <DataTable ref="dt" v-model:selection="selectedAgents" :value="agents" dataKey="id" :paginator="true" :rows="10"
        :filters="filters"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[5, 10, 25]"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} agents">
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0 font-semibold">Manage Agent</h4>
            <IconField>
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText v-model="filters['global'].value" placeholder="Search..." />
            </IconField>
          </div>
        </template>

        <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
        <Column field="firstname" header="First Name" sortable style="min-width: 12rem"></Column>
        <Column field="lastname" header="Last Name" sortable style="min-width: 12rem"></Column>
        <Column field="area" header="Area" sortable style="min-width: 16rem"></Column>

        <Column :exportable="false" header="Actions" style="min-width: 12rem">
          <template #body="slotProps">
            <Button icon="pi pi-pencil" v-tooltip.bottom="'Edit'" outlined rounded class="mr-2"
              @click="editAgent(slotProps.data)" />
            <Button icon="pi pi-trash" v-tooltip.bottom="'Delete'" outlined rounded class="mr-2" severity="danger"
              @click="confirmDeleteAgent(slotProps.data)" />

            <Button icon="pi pi-map-marker" v-tooltip.bottom="'Change Area'" outlined rounded class="mr-2"
              severity="info" @click="toggle" />

            <OverlayPanel ref="op">
              <div class="flex flex-col gap-6 p-4">
                <div v-for="(area) in areas" :key="area.id"
                  class="flex items-center justify-between rounded-lg hover:bg-gray-100">
                  <button class="text-gray-700" @click="updateRoute(slotProps.data, area.id)">{{ area.area }}</button>
                </div>
              </div>
            </OverlayPanel>
          </template>
        </Column>
        <template #empty>
          <div class="text-center text-gray-500 py-4">
            <i class="pi pi-info-circle mr-2" />
            No agent 47 found.
          </div>
        </template>
      </DataTable>
    </div>

    <Dialog v-model:visible="agentDialog" :style="{ width: '450px' }" header="Add Agent" :modal="true">
      <div class="flex flex-col gap-6">
        <div>
          <label for="firstname" class="block font-semibold mb-3">First Name</label>
          <InputText id="firstname" v-model.trim="agent.firstname" required="true" autofocus
            :invalid="submitted && !agent.firstname" fluid />
          <small v-if="submitted && !agent.firstname" class="text-red-500">First Name is required.</small>
        </div>
        <div>
          <label for="lastname" class="block font-semibold mb-3">Last Name</label>
          <InputText id="lastname" v-model.trim="agent.lastname" required="true" autofocus
            :invalid="submitted && !agent.lastname" fluid />
          <small v-if="submitted && !agent.lastname" class="text-red-500">Last Name is required.</small>
        </div>
        <div>
          <label for="email" class="block font-semibold mb-3">Email</label>
          <InputText id="email" v-model.trim="agent.email" required="true" autofocus
            :invalid="submitted && !agent.email" fluid />
          <small v-if="submitted && !agent.email" class="text-red-500">Email is required.</small>
        </div>
        <div>
          <label for="area" class="block mb-2 font-semibold text-gray-700">Area</label>
          <Dropdown id="area" v-model="agent.area_id" :options="areas" optionLabel="area" optionValue="id"
            placeholder="Select an Area" class="w-full" />
          <small v-if="submitted && !agent.area" class="text-red-600 text-xs mt-1 block">
            Area is required.
          </small>
        </div>
        <div>
          <label for="password" class="block font-semibold mb-3">Password</label>
          <InputText id="password" v-model.trim="agent.password" required="true" autofocus
            :invalid="submitted && !agent.password" fluid />
          <small v-if="submitted && !agent.password" class="text-red-500">Password is required.</small>
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Save" icon="pi pi-check" @click="saveAgent" />
      </template>
    </Dialog>

    <Dialog v-model:visible="deleteAgentDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl" />
        <span v-if="agent">Are you sure you want to delete <b>{{ agent.firstname }} {{ agent.lastname }}</b>?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteAgentDialog = false" />
        <Button label="Yes" icon="pi pi-check" @click="deleteAgent" />
      </template>
    </Dialog>

    <Dialog v-model:visible="deleteAgentsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl" />
        <span v-if="agent">Are you sure you want to delete the selected agents?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteAgentsDialog = false" />
        <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedAgents" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
/* Optional: Add styles if you want to customize dropdown appearance */
.dropdown-menu {
  position: absolute;
  z-index: 1000;
}
</style>