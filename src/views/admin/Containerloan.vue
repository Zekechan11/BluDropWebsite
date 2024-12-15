<script setup>
import { ref, onMounted } from "vue";
import { FilterMatchMode } from "@primevue/core/api";
import { useToast } from "primevue/usetoast";
import axios from "axios";

const toast = useToast();
const dt = ref();
const agents = ref([]); // List of agents
const agentDialog = ref(false);
const deleteAgentDialog = ref(false);
const deleteAgentsDialog = ref(false);
const agent = ref({});
const selectedAgents = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const submitted = ref(false);

// Fetch agents from the server
const fetchAgents = async () => {
    try {
        const response = await axios.get("http://localhost:9090/agent"); // Update endpoint if needed
        agents.value = response.data; // Store agents directly
    } catch (error) {
        console.error("Error fetching agents:", error);
    }
};

onMounted(async () => {
    await fetchAgents();
});

// Function to hide the agent dialog
const hideDialog = () => {
    agentDialog.value = false;
    submitted.value = false;
};

// Function to save or update an agent
const saveAgent = async () => {
    submitted.value = true;

    // Validate required fields
    if (!agent.value.ContainerOnLoan?.trim()) {
        toast.add({
            severity: "warn",
            summary: "Validation Error",
            detail: "Please provide all required fields.",
            life: 3000,
        });
        return;
    }

    const payload = {
        ContainerOnLoan: agent.value.ContainerOnLoan, // Ensure this matches the backend property name
    };

    try {
        let response;
        if (agent.value.ContainerOnLoan) {
            // Update existing agent
            response = await axios.put(`http://localhost:5089/api/Agent/UpdateAgent/${agent.value.ContainerOnLoan}`, payload);
            agents.value = agents.value.map(a => a.id === agent.value.id ? response.data : a);
        } else {
            // Create new agent
            response = await axios.post('http://localhost:5089/api/Agent/CreateAgent', payload); // Ensure correct endpoint for creation
            agents.value.push(response.data);
        }

        // Close the dialog and reset the form
        agentDialog.value = false;
        agent.value = {};
        toast.add({
            severity: "success",
            summary: "Successful",
            detail: "Container on loan saved successfully",
            life: 3000,
        });
    } catch (error) {
        console.error("Server Error:", error.response?.data || error.message);
        toast.add({
            severity: "error",
            summary: "Error",
            detail: error.response?.data.message || "Failed to save Container.",
            life: 3000,
        });
    }
};


// Function to edit an agent
const editAgent = (prod) => {
    agent.value = { ...prod };
    agentDialog.value = true; // Show the dialog for editing
};

// Confirm deletion of a single agent
const confirmDeleteAgent = (prod) => {
    agent.value = prod;
    deleteAgentDialog.value = true;
};

// Function to delete an agent
const deleteAgent = async () => {
    try {
        await axios.delete(`http://localhost:9090/api/Agent/DeleteAgent/${agent.value.id}`);
        agents.value = agents.value.filter((val) => val.id !== agent.value.id);
        deleteAgentDialog.value = false;
        agent.value = {};
        toast.add({
            severity: "success",
            summary: "Successful",
            detail: "Agent Deleted",
            life: 3000,
        });
    } catch (error) {
        console.error("Error deleting agent:", error.response?.data || error.message);
    }
};

// Confirm deletion of selected agents
const confirmDeleteSelected = () => {
    deleteAgentsDialog.value = true;
};

// Function to delete selected agents
const deleteSelectedAgents = async () => {
    try {
        for (const selectedAgent of selectedAgents.value) {
            await axios.delete(`http://localhost:9090/api/Agent/DeleteAgent/${selectedAgent.id}`);
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

</script>

<template>
    <div class="space">
        <h1 class="text-4xl font-semibold mb-6" style="color: #899499">Manage Agents FGS</h1>
    </div>
    <div>
        <div class="card shadow-md">

            <DataTable ref="dt" v-model:selection="selectedAgents" :value="agents" dataKey="id" :paginator="true"
                :rows="10" :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} agents">
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0 font-semibold">Manage Agent</h4>
                        <InputText v-model="filters['global'].value" placeholder="Search..." />
                    </div>
                </template>

                <Column field="agent_name" header="Agent Name" sortable style="min-width: 12rem"></Column>
                <Column field="ContainerOnLoan" header="Container on Loan" sortable style="min-width: 16rem"></Column>

                <Column :exportable="false" header="Actions" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" v-tooltip.bottom="'Edit'" outlined rounded class="mr-2" @click="editAgent(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="agentDialog" :style="{ width: '450px' }" header="Add Stock" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="ContainerOnLoan" class="block font-semibold mb-3">Container on Loan</label>
                    <InputText id="ContainerOnLoan" v-model.trim="agent.ContainerOnLoan" required :invalid="submitted && !agent.ContainerOnLoan" fluid />
                    <small v-if="submitted && !agent.ContainerOnLoan" class="text-red-500">Container on loan is required.</small>
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
                <Button label="Yes" icon="pi pi-check" @click="deleteAgent" severity="danger" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteAgentsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span>Are you sure you want to delete the selected agents?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteAgentsDialog = false" />
                <Button label="Yes" icon="pi pi-check" @click="deleteSelectedAgents" severity="danger" />
            </template>
        </Dialog>
    </div>
</template>
