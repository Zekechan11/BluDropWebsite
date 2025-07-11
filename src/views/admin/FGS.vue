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
const isEdit = ref(false);
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
};

const editFGS = (fgs_data) => {
    agentDialog.value = true;
    isEdit.value = true;
    addFGSForm.value.count = fgs_data.count
};

onMounted(async () => {
    await fetchAgents();
});

// Function to hide the agent dialog
const hideDialog = () => {
    isEdit.value = false;
    agentDialog.value = false;
    submitted.value = false;
};

const saveAgent = async () => {
    submitted.value = true;

    if (!addFGSForm.value.count) return;

    const payload = {
        fgs_id: parseInt(addFGSForm.value.fgs_id),
        area_id: parseInt(addFGSForm.value.area_id, 10),
        count: parseInt(addFGSForm.value.count, 10)
    };

    let response;

    if (isEdit.value) {
        response = await axios.put(`${WATER_API}/api/fgs/update`, payload);
    } else {
        response = await axios.post(`${WATER_API}/api/fgs/add`, payload);
    }

    if (response && (response.status === 200 || response.status === 201)) {
        await fetchAgents();
        toast.add({
            severity: "success",
            summary: isEdit.value ? "Agent Updated" : "FGS Added",
            detail: isEdit.value ? "Agent FGS updated successfully." : "New FGS added successfully.",
            life: 3000,
        });
        isEdit.value = false;
        agentDialog.value = false;
        addFGSForm.value = { area_id: 0, count: 0 };
        submitted.value = false;
    } else {
        console.error("Failed to add/update FGS", response?.data);
    }
};



</script>

<template>
    <div class="space">
        <h1 class="text-4xl font-semibold mb-6" style="color: #899499;">
            Manage Agent FGS
        </h1>
    </div>
    <div class="container mx-auto px-4">

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card v-for="(agent, index) in agents" :key="index"
                class="rounded-xl border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                <template #header>
                    <div class="relative w-full h-32 bg-cover bg-center rounded-t-xl"
                        :style="`background-image: url('/demo/images/map.webp')`">
                        <div class="absolute inset-0 bg-black/40 rounded-t-xl"></div>
                        <div class="absolute bottom-2 left-4 flex items-center gap-2 z-10">
                            <i class="pi pi-map-marker text-white !text-lg"></i>
                            <h4 class="text-md font-semibold uppercase text-white tracking-wide">
                                {{ agent.area }}
                            </h4>
                        </div>
                    </div>
                </template>


                <template #title>
                    <div class="text-xl font-semibold text-gray-700 text-center mt-2">{{ agent.fullname }}</div>
                </template>

                <template #subtitle>
                    <p class="text-center text-sm text-gray-500 mb-2">FGS: <span class="font-bold">{{ agent.count || 0
                    }}</span></p>
                </template>

                <template #footer>
                    <div class="flex gap-2 px-4 pb-4">
                        <Button label="Update" icon="pi pi-pencil" severity="info" class="w-1/2" outlined @click="editFGS(agent)" />
                        <Button label="Add" icon="pi pi-plus" class="w-1/2" severity="info" @click="addFGS(agent)" />
                    </div>
                </template>
            </Card>
        </div>

        <Dialog v-model:visible="agentDialog" :style="{ width: '400px' }" :modal="true" :closable="false"
            :draggable="false" class="rounded-lg" :header="isEdit ? 'Update FGS' : 'Add FGS'">
            <div class="p-fluid">
                <div class="field mb-4">
                    <label for="count" class="font-medium text-gray-700 mb-2 block">FGS Count</label>
                    <InputText id="count" v-model.trim="addFGSForm.count" required type="number" class="w-full"
                        :invalid="submitted && !addFGSForm.count" />
                    <small v-if="submitted && !addFGSForm.count" class="p-error">FGS count is required.</small>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end gap-2">
                    <Button label="Cancel" icon="pi pi-times" text severity="secondary" class="text-blue-600"
                        @click="hideDialog" />
                    <Button :label="isEdit ? 'Update' : 'Save'" icon="pi pi-check" class="text-white" severity="info"
                        @click="saveAgent" />
                </div>
            </template>
        </Dialog>

    </div>
</template>
