import Vue from 'vue'
import Vuex from 'vuex'
let server = "http://127.0.0.1:8000/";
Vue.use(Vuex)


export default new Vuex.Store({
  state: {
    machines: [],
    models: [],
    os: [],
    machineCount: "",
    modelsCount: "",
    aviable: "",
    machine: [],
  },
  mutations: {
    setMachines(state, data) {
      state.machines = data;
    },
    setMachineCount(state, data) {
      state.machineCount = data;
    },
    setModelCount(state, data) {
      state.modelsCount = data;
    },
    setAviable(state, data) {
      state.aviable = data;
    },
    setModels(state, data) {
      state.models = data;
    },
    setOs(state, data) {
      state.os = data;
    },
  },
  actions: {
    async getMachines(context) {
      const { data } = await axios({
        method: "get",
        url: `${server}api/inventory/machine/`,
      });
      context.commit("setMachines", data);
    },
    async updateMachines(
      context,
      { id, name, serial_number, reference, storage, model, os, assigned }
    ) {
      await axios({
        method: "patch",
        data: {
          name: name,
          serial_number: serial_number,
          reference: reference,
          storage: storage,
          model: model,
          os: os,
          assigned: assigned,
        },
        url: `${server}api/inventory/machine/${id}/`,
      });
      context.dispatch("getMachines");
    },
    async addMachine(
      context,
      { name, serial_number, reference, storage, model, os, assigned }
    ) {
      const { data } = await axios({
        method: "post",
        data: {
          name: name,
          serial_number: serial_number,
          reference: reference,
          storage: storage,
          model: model,
          os: os,
          assigned: assigned,
        },
        url: `${server}api/inventory/machine/`,
      });
      context.dispatch("getMachines");
      context.commit("setMachineCount", this.state["modelsCount"] + 1);
      
    },
    async searchMachines(context, q) {
      const { data } = await axios({
        method: "post",
        url: server + "api/inventory/machine/search/",
        data: {
          query: q,
        },
      }).catch(function(error) {
        if (error.response.status == 404) {
          context.commit("setMachines", []);
        }
      });
      context.commit("setMachines", data);
    },
    async deleteMchine(context, id) {
      await axios({
        method: "delete",
        url: server + "api/inventory/machine/" + id + "/",
      });
      context.commit("setMachineCount", this.state["modelsCount"] - 1);
      context.dispatch("getMachines");
    },
    async filterMachines(
      context,
      { model, ref, sn, cpu, os, ram, stockage, machine }
    ) {
      //console.log(machine, model, ref, sn, cpu, os, ram, stockage)
      const { data } = await axios({
        method: "post",
        url: server + "api/inventory/machine/filter/",
        data: {
          name__icontains: machine,
          model__name__icontains: model,
          reference: ref,
          serial_number: sn,
          model__cpu__icontains: cpu,
          os__name__icontains: os,
          model__ram: ram,
          storage: stockage,
          assigned: "",
        },
      }).catch(function(error) {
        if (error.response.status == 404) {
          context.commit("setMachines", []);
        }
      });
      context.commit("setMachines", data);
    },
    async getMachineCount(context) {
      const { data } = await axios({
        method: "get",
        url: server + "api/inventory/machine/",
      });
      
      context.commit("setMachineCount", data.count);

    },

    async getModels(context) {
      const { data } = await axios({
        method: "get",
        url: server + "api/inventory/model/",
      });
      context.commit("setModels", data);
    },
    async addModel(context, { name, ram, cpu }) {
      const { data } = await axios({
        method: "post",
        data: {
          name: name,
          ram: ram,
          cpu: cpu,
        },
        url: `${server}api/inventory/model/`,
      });
      context.dispatch("getModels");
      context.commit("setModelCount", this.state["modelsCount"] + 1);
    },
    async updateModel(context, { id, name, ram, cpu }) {
      await axios({
        method: "patch",
        data: {
          name: name,
          ram: ram,
          cpu: cpu,
        },
        url: `${server}api/inventory/model/${id}/`,
      });
      context.dispatch("getModels");
    },
    async deleteModel(context, id) {
      await axios({
        method: "delete",
        url: server + "api/inventory/model/" + id + "/",
      });
      context.commit("setModelCount", this.state["modelsCount"] - 1);
      context.dispatch("getModelCount");
    },
    async searchModels(context, q) {
      const { data } = await axios({
        method: "post",
        url: server + "api/inventory/model/search/",
        data: {
          query: q,
        },
      }).catch(function(error) {
        if (error.response.status == 404) {
          context.commit("setModels", []);
        }
      });
      context.commit("setModels", data);
    },
    async filterModels(
      context,
      { name, cpu, ram,  }
    ) {
      //console.log(machine, model, ref, sn, cpu, os, ram, stockage)
      const { data } = await axios({
        method: "post",
        url: server + "api/inventory/model/filter/",
        data: {
          name__icontains: name,
          cpu__icontains: cpu,
          ram: ram,
        },
      }).catch(function(error) {
        if (error.response.status == 404) {
          context.commit("setModels", []);
        }
      });
      context.commit("setModels", data);
    },
    async getModelCount(context) {
      const { data } = await axios({
        method: "get",
        url: server + "api/inventory/model/",
      });
      context.commit("setModelCount", data.count);
    },

    async getAviable(context) {
      const { data } = await axios({
        method: "get",
        url: server + "api/inventory/model/",
      });
      let count = 0;
      data.results.forEach((element) => {
        count += element.c_available;
      });
      context.commit("setAviable", count);
    },

    async getOs(context) {
      const { data } = await axios({
        method: "get",
        url: server + "api/inventory/os/",
      });
      context.commit("setOs", data);
    },
  },
  modules: {},
});
