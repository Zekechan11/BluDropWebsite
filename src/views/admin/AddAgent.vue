<script setup>
import { ref, onMounted } from "vue";
import { FilterMatchMode } from "@primevue/core/api";
import { useToast } from "primevue/usetoast";
import axios from "axios";

const toast = useToast();
const dt = ref();
const agents = ref([]);
const agentDialog = ref(false);
const deleteAgentDialog = ref(false);
const deleteAgentsDialog = ref(false);
const agent = ref({});
const area = ref({});
const selectedAgents = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const submitted = ref(false);

// Dropdown options for areas
const areas = ref([]);

const fetchAreas = async () => {
    try {
        const response = await axios.get("http://localhost:9090/area");
        const data = response.data;

        areas.value = data.map((area) => {
            return {
                ...area,
            };
        })
    } catch (error) {
        console.error("Error fetching areas:", error);
    }
};

const fetchAgents = async () => {
    try {
        const response = await axios.get("http://localhost:9090/agent");
        const data = response.data;

        // Add area name to each agent based on area_id
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

// Function to open the dialog for adding a new agent
const openNew = () => {
    agent.value = {};
    submitted.value = false;
    agentDialog.value = true;
};

// Function to hide the agent dialog
const hideDialog = () => {
    agentDialog.value = false;
    submitted.value = false;
};

const saveAgent = async () => {
    submitted.value = true;

    if (!agent.value.agent_name?.trim() || !area.value.area_name) {
        toast.add({
            severity: "warn",
            summary: "Validation Error",
            detail: "Please provide all required fields.",
            life: 3000,
        });
        return;
    }

    const payload = {
        agent_name: agent.value.agent_name,
        area_id: area.value.area_name,
    };

    console.log("Payload being sent:", payload);

    try {
        const response = await axios.post("http://localhost:9090/agent", payload);
        agents.value.push(response.data);
        agentDialog.value = false;
        agent.value = {};
        toast.add({
            severity: "success",
            summary: "Successful",
            detail: "Agent Created",
            life: 3000,
        });
        
    } catch (error) {
        console.error("Server Error:", error.response?.data || error.message);
        toast.add({
            severity: "error",
            summary: "Error",
            detail: error.response?.data.message || "Failed to save agent.",
            life: 3000,
        });
    }
};

// Function to edit an agent
const editAgent = (selectedAgent) => {
    agent.value = { ...selectedAgent };
    agentDialog.value = true;
};

// Confirm deletion of a single agent
const confirmDeleteAgent = (selectedAgent) => {
    agent.value = selectedAgent;
    deleteAgentDialog.value = true;
};

const deleteAgent = async () => {
    try {
        await axios.delete(`http://localhost:9090/agent/${agent.value.id}`); // Send DELETE request
        agents.value = agents.value.filter(val => val.id !== agent.value.id); // Remove from local list
        deleteAgentDialog.value = false; // Close the dialog
        agent.value = {}; // Reset the agent object
        toast.add({
            severity: "success",
            summary: "Successful",
            detail: "Agent Deleted",
            life: 3000,
        });
    } catch (error) {
        console.error("Error deleting agent:", error.response?.data || error.message);
        toast.add({
            severity: "error",
            summary: "Error",
            detail: "Failed to delete the agent. Please try again.",
            life: 3000,
        });
    }
};


// Confirm deletion of selected agents
const confirmDeleteSelected = () => {
    deleteAgentsDialog.value = true;
};

// Function to delete selected agents
const deleteselectedAgents = async () => {
    try {
        for (const selectedAgent of selectedAgents.value) {
            await axios.delete(`http://localhost:9090/agent/${selectedAgent.id}`);
        }
        agents.value = agents.value.filter(
            (agent) => !selectedAgents.value.some((selected) => selected.id === agent.id)
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
        console.error("Error deleting selected agents:", error.response?.data || error.message);
    }
};

// Additional functions like createId() if needed...
</script>


<template>
    <div class="space">
        <h1 class="text-4xl font-semibold mb-6" style="color: #899499">Add Agent</h1>
    </div>
    <div>
        <div class="card shadow-md">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="New" icon="pi pi-plus" severity="success" class="mr-2" @click="openNew" />
                    <Button label="Delete" icon="pi pi-trash" severity="danger" @click="confirmDeleteSelected" :disabled="!selectedAgents || !selectedAgents.length" />
                </template>
            </Toolbar>

            <DataTable ref="dt" v-model:selection="selectedAgents" :value="agents" dataKey="id" :paginator="true"
                :rows="10" :filters="filters"
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
                <Column field="agent_name" header="Agent Name" sortable style="min-width: 12rem"></Column>
                <Column field="area_name" header="Area" sortable style="min-width: 16rem"></Column>

                <Column :exportable="false" header="Actions" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" v-tooltip.bottom="'Edit'" outlined rounded class="mr-2" @click="editAgent(slotProps.data)" />
                        <Button icon="pi pi-trash" v-tooltip.bottom="'Delete'" outlined rounded severity="danger" @click="confirmDeleteAgent(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="agentDialog" :style="{ width: '450px' }" header="Add Agent" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="agent_name" class="block font-semibold mb-3">Agent Name</label>
                    <InputText id="agent_name" v-model.trim="agent.agent_name" required="true" autofocus :invalid="submitted && !agent.agent_name" fluid />
                    <small v-if="submitted && !agent.agent_name" class="text-red-500">Name is required.</small>
                </div>
                <div>
                    <label for="area" class="block font-semibold mb-3">Area</label>
                    <Dropdown id="area" v-model="area.area_name" :options="areas" optionLabel="area" optionValue="id" placeholder="Select an Area" />
                    <small v-if="submitted && !area.area_name" class="text-red-500">Area is required.</small>
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
                <span v-if="agent">Are you sure you want to delete <b>{{ agent.agent_name }}</b>?</span>
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
                <Button label="Yes" icon="pi pi-check" text @click="deleteselectedAgents" />
            </template>
        </Dialog>
    </div>
</template>
