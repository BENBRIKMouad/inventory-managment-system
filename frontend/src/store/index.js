import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";
let server = "http://127.0.0.1:8000/";
Vue.use(Vuex);
import Swal from "sweetalert2";
const defaultHeaders = {
  "Accept-Language": "fr-fr",
};

function fireError(error) {
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
}
function fireNotFound() {
  Swal.fire({
    title: "aucun resultat n'est trouvé",
    icon: "error",
    confirmButtonColor: "#3085d6",
    confirmButtonText: "ok",
  });
}
axios.defaults.headers.common["Accept-Language"] = "fr-fr";
if (localStorage.getItem("token"))
  axios.defaults.headers.common[
    "Authorization"
  ] = `Bearer ${localStorage.getItem("token")}`;
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
    employee: "",
    software: "",
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
    setEmployee(state, data) {
      state.employee = data;
    },
    setSoftware(state, data) {
      state.software = data;
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
      axios.defaults.headers.common["Authorization"] = `Bearer ${access}`;
    },
  },
  actions: {
    //login
    async userLogin(context, { username, password }) {
      axios.defaults.headers.common["Authorization"] = ``;
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
            axios.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${response.data.access_token}`;
            resolve();
          })
          .catch((error) => {
            let err = "";
            if (error.response)
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
      console.log("token" + token);
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
            context.commit("refreshStorage", {
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
    async verifyRefreshToken(context) {
      return await new Promise((resolve, reject) => {
        context
          .dispatch("verifyToken", { token: localStorage.getItem("token") })
          .then(() => {
            resolve();
          })
          .catch((err) => {
            context
              .dispatch("refreshToken", {
                token: localStorage.getItem("refresh"),
              })
              .then(() => {
                resolve();
              })
              .catch((err) => {
                context.commit("updateStorage", { access: "", refresh: "" });
                localStorage.clear();
                reject(err);
              });
          });
      });
    },
    async getMachines(context) {
      context
        .dispatch("verifyRefreshToken")
        .then(async () => {
          await axios({
            method: "get",
            url: `${server}api/inventory/machine/`,
          })
            .then((response) => {
              context.commit("setMachines", response.data);
              context.dispatch("getAviable");
            })
            .catch((error) => {
              fireError(error);
            });
        })
        .catch((err) => {
          fireError(err);
        });
    },

    async updateMachines(
      context,
      {
        id,
        name,
        serial_number,
        reference,
        storage,
        model,
        os,
        assigned,
        employee,
      }
    ) {
      context
        .dispatch("verifyRefreshToken")
        .then(async () => {
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
              employee: employee,
            },
            url: `${server}api/inventory/machine/${id}/`,
          })
            .then((response) => {
              context.dispatch("getMachines");
            })
            .catch(function(error) {
              fireError(err);
            });
        })
        .catch((err) => {
          fireError(err);
        });
    },

    async addMachine(
      context,
      { name, serial_number, reference, storage, model, os, assigned, employee }
    ) {
      context
        .dispatch("verifyRefreshToken")
        .then(async () => {
          await axios({
            method: "post",
            data: {
              name: name,
              serial_number: serial_number,
              reference: reference,
              storage: storage,
              model: model,
              os: os,
              assigned: assigned,
              employee: employee,
            },
            url: `${server}api/inventory/machine/`,
          })
            .then(() => {
              context.dispatch("getMachines");
              context.commit("setMachineCount", this.state["modelsCount"] + 1);
            })
            .catch(function(error) {
              fireError(error);
            });
        })
        .catch((error) => {
          console.log(error);
          fireError(error);
        });
    },

    async searchMachines(context, q) {
      context
        .dispatch("verifyRefreshToken")
        .then(async () => {
          await axios({
            method: "post",
            url: server + "api/inventory/machine/search/",
            data: {
              query: q,
            },
          })
            .then((response) => {
              context.commit("setMachines", response.data);
            })
            .catch((error) => {
              if (error.response.status == 404) {
                context.commit("setMachines", []);
                fireNotFound();
              } else fireError(error);
            });
        })
        .catch((err) => {
          fireError(err);
        });
    },

    async deleteMchine(context, id) {
      context
        .dispatch("verifyRefreshToken")
        .then(async () => {
          await axios({
            method: "delete",
            url: server + "api/inventory/machine/" + id + "/",
          })
            .then((response) => {
              context.commit("setMachineCount", this.state["modelsCount"] - 1);
              context.dispatch("getMachines");
            })
            .catch((error) => {
              fireError(error);
            });
        })
        .catch((err) => {
          fireError(err);
        });
    },

    async filterMachines(
      context,
      { model, ref, sn, cpu, os, ram, stockage, machine }
    ) {
      context
        .dispatch("verifyRefreshToken")
        .then(async () => {
          await axios({
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
          })
            .then((response) => {
              context.commit("setMachines", response.data);
            })
            .catch((error) => {
              if (error.response.status == 404) {
                context.commit("setMachines", []);
                fireNotFound();
              }
            });
        })
        .catch((err) => {
          fireError(err);
        });
    },

    async getMachineCount(context) {
      context
        .dispatch("verifyRefreshToken")
        .then(async () => {
          await axios({
            method: "get",
            url: server + "api/inventory/machine/",
          }).then((response) => {
            context.commit("setMachineCount",response.data.count);
          })
        })
        .catch((err) => {
          fireError(err);
        });

    },

    //get number of free machines
    async getAviable(context) {
      context
        .dispatch("verifyRefreshToken")
        .then(async () => {
          await axios({
            method: "get",
            url: server + "api/inventory/model/",
          }).then((response) => {
            let count = 0;
            response.data.results.forEach((element) => {
              count += element.c_available;
            });
            context.commit("setAviable", count);
          })
        })
        .catch((err) => {
          fireError(err);
        });
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

    //employee

    async getEmployee(context) {
      const { data } = await axios({
        method: "get",
        url: server + "api/inventory/employee/",
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
      context.commit("setEmployee", data);
    },

    async addEmployee(context, { email, first_name, last_name, identifier }) {
      await axios({
        method: "post",
        data: {
          email: email,
          first_name: first_name,
          lst_name: last_name,
          identifier: identifier,
        },
        url: `${server}api/inventory/employee/`,
      }).catch(function(error) {
        if (error.response.status == 400) {
          let err = "";
          Object.entries(error.response.data).forEach((val) => {
            const [key, value] = val;
            err += `${key} : ${value}<br>`;
          });
          err = err.replace("last_name", "nom");
          err = err.replace("first_name", "prenom");
          context.commit("setEmployee", []);
          Swal.fire({
            title: err,
            icon: "error",
            confirmButtonColor: "#3085d6",
            confirmButtonText: "ok",
          });
        }
      });
      context.dispatch("getEmployee");
    },

    async updateEmployee(
      context,
      { id, email, first_name, last_name, identifier }
    ) {
      await axios({
        method: "patch",
        data: {
          email: email,
          first_name: first_name,
          last_name: last_name,
          identifier: identifier,
        },
        url: `${server}api/inventory/employee/${id}/`,
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
      context.dispatch("getEmployee");
    },

    async deleteEmployee(context, id) {
      await axios({
        method: "delete",
        url: server + "api/inventory/employee/" + id + "/",
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
      context.dispatch("getEmployee");
    },

    async searchEmployee(context, q) {
      const { data } = await axios({
        method: "post",
        url: server + "api/inventory/employee/search/",
        data: {
          query: q,
        },
      }).catch(function(error) {
        if (error.response.status == 404) {
          context.commit("setEmployee", []);
          Swal.fire({
            title: "aucun résultat pour votre recherche",
            icon: "question",
            showConfirmButton: false,
          });
        }
      });
      context.commit("setEmployee", data);
    },

    async filterEmployee(
      context,
      { email, first_name, last_name, identifier }
    ) {
      //console.log(machine, model, ref, sn, cpu, os, ram, stockage)
      const { data } = await axios({
        method: "post",
        url: server + "api/inventory/employee/filter/",
        data: {
          email__icontains: email,
          first_name__icontains: first_name,
          last_name__icontains: last_name,
          identifier__icontains: identifier,
        },
      }).catch(function(error) {
        if (error.response.status == 404) {
          context.commit("setEmployee", []);
          Swal.fire({
            title: "aucun résultat pour votre recherche",
            icon: "question",
            showConfirmButton: false,
          });
        }
      });
      context.commit("setEmployee", data);
    },

    //software
    async getSoftware(context) {
      const { data } = await axios({
        method: "get",
        url: server + "api/inventory/software/",
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
      context.commit("setSoftware", data);
    },
  },
  modules: {},
});
