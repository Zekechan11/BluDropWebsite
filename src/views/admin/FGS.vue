<script setup>
import { ref, onMounted } from "vue";
import { FilterMatchMode } from "@primevue/core/api";
import { useToast } from "primevue/usetoast";
import axios from "axios";
import { WATER_API } from "../../config";

const toast = useToast();
const dt = ref();
const agents = ref([]);
const agentDialog = ref(false);
const agent = ref({});
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const submitted = ref(false);
const addFGSForm = ref({
    fgs_id: null,
    area_id: 0,
    count: 0
})


// Fetch agents from the server
const fetchAgents = async () => {
    try {
        const response = await axios.get(`${WATER_API}/api/fgs/agent`);
        agents.value = response.data; // Store agents directly
    } catch (error) {
        console.error("Error fetching agents:", error);
    }
};

const addFGS = async (fgs_data) => {
    agentDialog.value = true;
    addFGSForm.value = {
        fgs_id: fgs_data.fgs_id,
        area_id: fgs_data.id,
    }
}

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
    const payload = {
        fgs_id: parseInt(addFGSForm.value.fgs_id),
        area_id: parseInt(addFGSForm.value.area_id, 10),
        count: parseInt(addFGSForm.value.count, 10)
    }

    const response = await axios.post(`${WATER_API}/api/fgs/add`, payload);
    if (response) {
        fetchAgents();
        toast.add({
            severity: "success",
            summary: "I'm tired boss",
            detail: "Oh no",
            life: 3000,
        });
        agentDialog.value = false;
        addFGSForm.value = { area_id: 0, count: 0 };
        submitted.value = false;
    } else {
        console.error("Failed to add FGS", response.data);
    }
};

const editAgent = (prod) => {
    agent.value = { ...prod };
    agentDialog.value = true; // Show the dialog for editing
};

</script>

<template>
    <div class="space">
        <h1 class="text-4xl font-semibold mb-6" style="color: #899499">Manage Agents FGS</h1>
    </div>

    <div style="display: flex; flex-wrap: wrap; gap: 1rem;">
    <Card
        v-for="(agent, index) in agents"
        :key="index"
        style="width: 25rem; overflow: hidden;"
        class="shadow-lg">
        <template #header>
            <h4 class="m-2 pt-2 text-center w-full">{{ agent.area }}</h4>
        </template>

        <template #title>{{ agent.fullname }}</template>

        <template #subtitle>
            <p>FGS: {{ agent.count || 0 }}</p>
        </template>

        <template #footer>
            <div class="flex gap-4 mt-1">
                <Button label="Edit" severity="info" class="w-full" @click="editAgent(agent)" />
                <Button label="Add" class="w-full" @click="addFGS(agent)" />
            </div>
        </template>
    </Card>

    <Dialog v-model:visible="agentDialog" :style="{ width: '450px' }" header="Add Stock" :modal="true">
        <div class="flex flex-col gap-6">
            <div>
                <label for="count" class="block font-semibold mb-3">FGS</label>
                <InputText id="count" v-model.trim="addFGSForm.count" required
                    :invalid="submitted && !addFGSForm.count" fluid />
                <small v-if="submitted && !addFGSForm.count" class="text-red-500">Container on loan is required.</small>
            </div>
        </div>

        <template #footer>
            <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
            <Button label="Save" icon="pi pi-check" @click="saveAgent" />
        </template>
    </Dialog>
</div>

</template>
