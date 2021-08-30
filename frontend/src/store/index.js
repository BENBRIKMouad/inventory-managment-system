import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios';
let server = "http://127.0.0.1:8000/";
Vue.use(Vuex)
import Swal from "sweetalert2";
const defaultHeaders ={
          "Accept-Language": "fr-fr",
}

axios.defaults.headers.common["Accept-Language"] = "fr-fr";
if (localStorage.getItem("token"))
  axios.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem("token")}` ;
export default new Vuex.Store({
  state: {
    machines: [],
    models: [],
    os: [],
    machineCount: "",
    modelsCount: "",
    aviable: "",
    machine: [],
    user: {},
    accessToken: null,
    refreshToken: null,
  },
  getters: {
    loggedIn(state) {
      if (localStorage.getItem("token")) {
        state.accessToken = localStorage.getItem("token");
        state.refreshToken = localStorage.getItem("refresh");
        state.user = JSON.parse(localStorage.getItem("user"));
      }
      return state.accessToken != null;
    },
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
    setUser(state, data) {
      state.user = data;
    },
    updateStorage(state, { access, refresh }) {
      state.accessToken = access;
      state.refreshToken = refresh;
      localStorage.setItem("token", access); 
      localStorage.setItem("refresh", refresh); 
    },
    refreshStorage(state, { access }) {
      state.accessToken = access;
      localStorage.setItem("token", access);  
    },
  },
  actions: {
    //login
    async userLogin(context, { username, password }) {
      return await new Promise((resolve, reject) => {
        axios({
          method: "post",
          url: `${server}auth/login/`,
          data: {
            username: username,
            password: password,
          },
        })
          .then((response) => {
            context.commit("updateStorage", {
              access: response.data.access_token,
              refresh: response.data.refresh_token,
            });
            context.commit("setUser", response.data.user);
            localStorage.setItem("user", JSON.stringify(response.data.user)); 
            resolve();
          })
          .catch((error) => {
            let err = "";
            Object.entries(error.response.data).forEach((val) => {
              const [key, value] = val;
              err += `${key} : ${value}<br>`;
            });

            Swal.fire({
              title: err,
              icon: "error",
              confirmButtonColor: "#3085d6",
              confirmButtonText: "ok",
            });
            reject(error);
          });
      });
    },
    async verifyToken(context, { token }) {
      console.log("token"+token)
      return await new Promise((resolve, reject) => {
        axios({
          method: "post",
          url: `${server}auth/token/verify/`,
          data: {
            token: token,
          },
        })
          .then((response) => {
            resolve();
          })
          .catch((err) => {
            reject(err);
          });
      });
    },
    async refreshToken(context, { token }) {
      return await new Promise((resolve, reject) => {
        axios({
          method: "post",
          url: `${server}auth/token/refresh/`,
          data: {
            refresh: token,
          },
        })
          .then((response) => {
            context.commit("updateStorage", {
              access: response.data.access,
            });
            resolve();
          })
          .catch((err) => {
            reject(err);
          });
      });
    },
    //machine

    async getMachines(context) {
      const { data } = await axios({
        method: "get",
        url: `${server}api/inventory/machine/`,
      }).catch(function(error) {
        let err = "";
        Object.entries(error.response.data).forEach((val) => {
          const [key, value] = val;
          err += `${key} : ${value}<br>`;
        });
        Swal.fire({
          title: err,
          icon: "error",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "ok",
        });
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
      }).catch(function(error) {
        let err = "";
        Object.entries(error.response.data).forEach((val) => {
          const [key, value] = val;
          err += `${key} : ${value}<br>`;
        });
        Swal.fire({
          title: err,
          icon: "error",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "ok",
        });
      });
      context.dispatch("getMachines");
      context.dispatch("getAviable");
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
      }).catch(function(error) {
        let err = "";
        Object.entries(error.response.data).forEach((val) => {
          const [key, value] = val;
          err += `${key} : ${value}<br>`;
        });
        Swal.fire({
          title: err,
          icon: "error",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "ok",
        });
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
          Swal.fire({
            title: "aucun résultat pour votre recherche",
            icon: "question",
            showConfirmButton: false,
          });
        }
      });
      context.commit("setMachines", data);
    },

    async deleteMchine(context, id) {
      await axios({
        method: "delete",
        url: server + "api/inventory/machine/" + id + "/",
      }).catch(function(error) {
        let err = "";
        Object.entries(error.response.data).forEach((val) => {
          const [key, value] = val;
          err += `${key} : ${value}<br>`;
        });
        Swal.fire({
          title: err,
          icon: "error",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "ok",
        });
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
          Swal.fire({
            title: "aucun résultat pour votre recherche",
            icon: "question",
            showConfirmButton: false,
          });
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

    //models

    async getModels(context) {
      const { data } = await axios({
        method: "get",
        url: server + "api/inventory/model/",
      });
      context.commit("setModels", data);
    },

    async addModel(context, { name, ram, cpu }) {
      await axios({
        method: "post",
        data: {
          name: name,
          ram: ram,
          cpu: cpu,
        },
        url: `${server}api/inventory/model/`,
      }).catch(function(error) {
        let err = "";
        Object.entries(error.response.data).forEach((val) => {
          const [key, value] = val;
          err += `${key} : ${value}<br>`;
        });
        Swal.fire({
          title: err,
          icon: "error",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "ok",
        });
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
      }).catch(function(error) {
        let err = "";
        Object.entries(error.response.data).forEach((val) => {
          const [key, value] = val;
          err += `${key} : ${value}<br>`;
        });
        Swal.fire({
          title: err,
          icon: "error",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "ok",
        });
      });
      context.dispatch("getModels");
    },

    async deleteModel(context, id) {
      await axios({
        method: "delete",
        url: server + "api/inventory/model/" + id + "/",
      }).catch(function(error) {
        let err = "";
        Object.entries(error.response.data).forEach((val) => {
          const [key, value] = val;
          err += `${key} : ${value}<br>`;
        });
        Swal.fire({
          title: err,
          icon: "error",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "ok",
        });
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
          Swal.fire({
            title: "aucun résultat pour votre recherche",
            icon: "question",
            showConfirmButton: false,
          });
        }
      });
      context.commit("setModels", data);
    },

    async filterModels(context, { name, cpu, ram }) {
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
          Swal.fire({
            title: "aucun résultat pour votre recherche",
            icon: "question",
            showConfirmButton: false,
          });
        }
      });
      context.commit("setModels", data);
    },

    //get number of models
    async getModelCount(context) {
      const { data } = await axios({
        method: "get",
        url: server + "api/inventory/model/",
      });
      context.commit("setModelCount", data.count);
    },

    //get number of free machines
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

    //os

    async getOs(context) {
      const { data } = await axios({
        method: "get",
        url: server + "api/inventory/os/",
      }).catch(function(error) {
        let err = "";
        Object.entries(error.response.data).forEach((val) => {
          const [key, value] = val;
          err += `${key} : ${value}<br>`;
        });
        Swal.fire({
          title: err,
          icon: "error",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "ok",
        });
      });
      context.commit("setOs", data);
    },

    async addOs(context, { name, type }) {
      await axios({
        method: "post",
        data: {
          name: name,
          type: type,
        },
        url: `${server}api/inventory/os/`,
      }).catch(function(error) {
        if (error.response.status == 400) {
          let err = "";
          Object.entries(error.response.data).forEach((val) => {
            const [key, value] = val;
            err += `${key} : ${value}<br>`;
          });
          err = err.replace("name", "nom");
          context.commit("setModels", []);
          Swal.fire({
            title: err,
            icon: "error",
            confirmButtonColor: "#3085d6",
            confirmButtonText: "ok",
          });
        }
      });
      context.dispatch("getOs");
      context.commit("setModelCount", this.state["modelsCount"] + 1);
    },

    async updateOs(context, { id, name, type }) {
      await axios({
        method: "patch",
        data: {
          name: name,
          type: type,
        },
        url: `${server}api/inventory/os/${id}/`,
      }).catch(function(error) {
        let err = "";
        Object.entries(error.response.data).forEach((val) => {
          const [key, value] = val;
          err += `${key} : ${value}<br>`;
        });
        Swal.fire({
          title: err,
          icon: "error",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "ok",
        });
      });
      context.dispatch("getOs");
    },

    async deleteOs(context, id) {
      await axios({
        method: "delete",
        url: server + "api/inventory/os/" + id + "/",
      }).catch(function(error) {
        let err = "";
        Object.entries(error.response.data).forEach((val) => {
          const [key, value] = val;
          err += `${key} : ${value}<br>`;
        });
        Swal.fire({
          title: err,
          icon: "error",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "ok",
        });
      });
      context.dispatch("getOs");
    },

    async searchOs(context, q) {
      const { data } = await axios({
        method: "post",
        url: server + "api/inventory/os/search/",
        data: {
          query: q,
        },
      }).catch(function(error) {
        if (error.response.status == 404) {
          context.commit("setOs", []);
          Swal.fire({
            title: "aucun résultat pour votre recherche",
            icon: "question",
            showConfirmButton: false,
          });
        }
      });
      context.commit("setOs", data);
    },

    async filterOs(context, { name, type }) {
      //console.log(machine, model, ref, sn, cpu, os, ram, stockage)
      const { data } = await axios({
        method: "post",
        url: server + "api/inventory/os/filter/",
        data: {
          name__icontains: name,
          type__icontains: type,
        },
      }).catch(function(error) {
        if (error.response.status == 404) {
          context.commit("setOs", []);
          Swal.fire({
            title: "aucun résultat pour votre recherche",
            icon: "question",
            showConfirmButton: false,
          });
        }
      });
      context.commit("setOs", data);
    },
  },
  modules: {},
});
