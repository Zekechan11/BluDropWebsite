<script setup>
import { ref, onMounted } from "vue";
import { FilterMatchMode } from "@primevue/core/api";
import { useToast } from "primevue/usetoast";
import axios from "axios";


const AGENT_URL = 'http://localhost:9090';
const AREA_URL = 'http://localhost:9090';

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
        const response = await axios.get(`${AREA_URL}/area`);
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
        const response = await axios.get(`${AGENT_URL}/api/agents`);
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
            agent_name: agent.value.agent_name,
            area_id: area.value.area_name,
        };

        const response = await axios.post(`${AGENT_URL}/api/agent`, payload);
        agents.value.push({
            id: response.data.id,
            agent_name: agent.value.agent_name,
            area_name: areas.value.find(a => a.id === area.value.area_name)?.area,
            area_id: area.value.area_name,
        });
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Agent Created', life: 3000 });
    } catch (error) {
        console.error("Failed to create agent:", error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to create agent', life: 3000 });
    }
}

const updateAgent = async () => {
    try {
        const payload = {
            id: agent.value.id,
            area_id: area.value.area_name,
        };

        await axios.put(`${AGENT_URL}/agent/${agent.value.id}`, payload);
        const index = agents.value[findIndexById(a => a.id === agent.value.id)];
        if (index !== -1) {
            agents.value[index] = {
                ...agents.value[index],
                agent_name: agent.value.agent_name,
                area_name: areas.value.find(a => a.id === area.value.area_name)?.area,
                area_id: area.value.area_name,
            };
        }
        toast.add({severity: 'success',summary: 'Successful',detail: 'Agent Updated',life: 3000
        });
    } catch (error) {
        console.error("Failed to update agent:", error);
        toast.add({severity: 'error',summary: 'Error',detail: 'Failed to update agent',life: 3000
        });
    }
};


const saveAgent = async () => {
    submitted.value = true;

    if (!agent.value.agent_name || !area.value.area_name) {
        return;
    }

    if (agent.value.id) {
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
const confirmDeleteAgent = selectedAgent => {
    agent.value = selectedAgent;
    deleteAgentDialog.value = true;
};

const deleteAgent = async () => {
    try {
        await axios.delete(`${AGENT_URL}/agent/${agent.value.id}`);
        agents.value = agents.value.filter(agent => agent.id !== agent.value.id);
        toast.add({severity: "success",summary: "Agent Deleted",detail: "Successfully deleted agent",life: 3000,});
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
            await axios.delete(`http://localhost:9090/agent/${selectedAgent.id}`);
        }
        agents.value = agents.value.filter(
            agent => !selectedAgents.value.some(selected => selected.id === agent.id)
        );
        selectedAgents.value = null
        deleteAgentsDialog.value = false;
        toast.add({severity: "success",summary: "Successful",detail: "Selected Agents Deleted",life: 3000,});
    } catch (error) {
        console.error("Error deleting selected agents:", error);
    }
};

const findIndexById = (id) => {
    return agents.value.findIndex(agent => agent.id === id);
};

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
                    <Button label="Delete" icon="pi pi-trash" severity="danger" @click="confirmDeleteSelected"
                        :disabled="!selectedAgents || !selectedAgents.length" />
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
                <Column field="FirstName" header="First Name" sortable style="min-width: 12rem"></Column>
                <Column field="LastName" header="Last Name" sortable style="min-width: 12rem"></Column>
                <Column field="Area" header="Area" sortable style="min-width: 16rem"></Column>

                <Column :exportable="false" header="Actions" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" v-tooltip.bottom="'Edit'" outlined rounded class="mr-2"
                            @click="editAgent(slotProps.data)" />
                        <Button icon="pi pi-trash" v-tooltip.bottom="'Delete'" outlined rounded severity="danger"
                            @click="confirmDeleteAgent(slotProps.data)" />
                    </template>
                </Column>
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
                    <label for="area" class="block font-semibold mb-3">Area</label>
                    <Dropdown id="area" v-model.trim="area.area_name" :options="areas" optionLabel="area"
                        optionValue="id" placeholder="Select an Area" />
                    <small v-if="submitted && !area.area_name" class="text-red-500">Area is required.</small>
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
                <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedAgents" />
            </template>
        </Dialog>
    </div>
</template>
