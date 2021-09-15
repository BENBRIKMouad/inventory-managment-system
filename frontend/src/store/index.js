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
  if (error.response)
    Object.entries(error.response.data).forEach((val) => {
      const [key, value] = val;
      err += `${key} : ${value}<br>`;
    });
  else err = "Impossible de se connecter au serveur";
  err = err.replace("last_name", "nom");
  err = err.replace("first_name", "prenom");
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
    poles: "",
    divisions: "",
    functions: "",
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
    setPoles(state, data) {
      state.poles = data;
    },
    setDivisions(state, data) {
      state.divisions = data;
    },
    setFunctions(state, data) {
      state.functions = data;
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
            fireError(error);
            reject(error);
          });
      });
    },

    async verifyToken(context, { token }) {
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

    async getMachines(context,url) {
      context
        .dispatch("verifyRefreshToken")
        .then(async () => {
          await axios({
            method: "get",
            url: url ? url : `${server}api/inventory/machine/`,
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
            context.commit("setMachineCount", response.data.count);
          });
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
          });
        })
        .catch((err) => {
          fireError(err);
        });
    },

    //models

    async getModels(context,url) {
      context
        .dispatch("verifyRefreshToken")
        .then(async () => {
          await axios({
            method: "get",
            url: url ? url : server + "api/inventory/model/",
          }).then((response) => {
            context.commit("setModels", response.data);
          });
        })
        .catch((err) => {
          fireError(err);
        });
    },

    async addModel(context, { name, ram, cpu }) {
      context
        .dispatch("verifyRefreshToken")
        .then(async () => {
          await axios({
            method: "post",
            data: {
              name: name,
              ram: ram,
              cpu: cpu,
            },
            url: `${server}api/inventory/model/`,
          })
            .then(() => {
              context.dispatch("getModels");
              context.commit("setModelCount", this.state["modelsCount"] + 1);
            })
            .catch(function(error) {
              fireError(error);
            });
        })
        .catch((err) => {
          fireError(err);
        });
    },

    async updateModel(context, { id, name, ram, cpu }) {
      context
        .dispatch("verifyRefreshToken")
        .then(async () => {
          await axios({
            method: "patch",
            data: {
              name: name,
              ram: ram,
              cpu: cpu,
            },
            url: `${server}api/inventory/model/${id}/`,
          })
            .then(() => {
              context.dispatch("getModels");
            })
            .catch(function(error) {
              fireError(error);
            });
        })
        .catch((err) => {
          fireError(err);
        });
    },

    async deleteModel(context, id) {
      context
        .dispatch("verifyRefreshToken")
        .then(async () => {
          await axios({
            method: "delete",
            url: server + "api/inventory/model/" + id + "/",
          })
            .then(() => {
              context.commit("setModelCount", this.state["modelsCount"] - 1);
              context.dispatch("getModelCount");
              context.dispatch("getModels");
            })
            .catch((error) => {
              fireError(error);
            });
        })
        .catch((err) => {
          fireError(err);
        });
    },

    async searchModels(context, q) {
      context
        .dispatch("verifyRefreshToken")
        .then(async () => {
          await axios({
            method: "post",
            url: server + "api/inventory/model/search/",
            data: {
              query: q,
            },
          })
            .then((response) => {
              context.commit("setModels", response.data);
            })
            .catch((error) => {
              if (error.response.status == 404) {
                context.commit("setModels", []);
                fireNotFound();
              }
            });
        })
        .catch((err) => {
          fireError(err);
        });
    },

    async filterModels(context, { name, cpu, ram }) {
      context
        .dispatch("verifyRefreshToken")
        .then(async () => {
          await axios({
            method: "post",
            url: server + "api/inventory/model/filter/",
            data: {
              name__icontains: name,
              cpu__icontains: cpu,
              ram: ram,
            },
          })
            .then((response) => {
              context.commit("setModels", response.data);
            })
            .catch(function(error) {
              if (error.response.status == 404) {
                context.commit("setModels", []);
                fireNotFound();
              }
            });
        })
        .catch((err) => {
          fireError(err);
        });
    },

    //get number of models
    async getModelCount(context) {
      context
        .dispatch("verifyRefreshToken")
        .then(async () => {
          await axios({
            method: "get",
            url: server + "api/inventory/model/",
          }).then((response) => {
            context.commit("setModelCount", response.data.count);
          });
        })
        .catch((err) => {
          fireError(err);
        });
    },

    //os

    async getOs(context,url) {
      context
        .dispatch("verifyRefreshToken")
        .then(async () => {
          await axios({
            method: "get",
            url: url ? url : server + "api/inventory/os/",
          })
            .then((response) => {
              context.commit("setOs", response.data);
            })
            .catch((error) => {
              fireError(error);
            });
        })
        .catch((err) => {
          fireError(err);
        });
    },

    async addOs(context, { name, type }) {
      context
        .dispatch("verifyRefreshToken")
        .then(async () => {
          await axios({
            method: "post",
            data: {
              name: name,
              type: type,
            },
            url: `${server}api/inventory/os/`,
          })
            .then((response) => {
              context.dispatch("getOs");
              context.commit("setModelCount", this.state["modelsCount"] + 1);
            })
            .catch((error) => {
              fireError(error);
            });
        })
        .catch((err) => {
          fireError(err);
        });
    },

    async updateOs(context, { id, name, type }) {
      context
        .dispatch("verifyRefreshToken")
        .then(async () => {
          await axios({
            method: "patch",
            data: {
              name: name,
              type: type,
            },
            url: `${server}api/inventory/os/${id}/`,
          }).catch(function(error) {
            fireError(error);
          });
          context.dispatch("getOs");
        })
        .catch((err) => {
          fireError(err);
        });
    },

    async deleteOs(context, id) {
      context
        .dispatch("verifyRefreshToken")
        .then(async () => {
          await axios({
            method: "delete",
            url: server + "api/inventory/os/" + id + "/",
          })
            .then((response) => {
              context.dispatch("getOs");
            })
            .catch(function(error) {
              fireError(error);
            });
        })
        .catch((err) => {
          fireError(err);
        });
    },

    async searchOs(context, q) {
      context
        .dispatch("verifyRefreshToken")
        .then(async () => {
          await axios({
            method: "post",
            url: server + "api/inventory/os/search/",
            data: {
              query: q,
            },
          })
            .then((response) => {
              context.commit("setOs", response.data);
            })
            .catch(function(error) {
              if (error.response.status == 404) {
                context.commit("setOs", []);
                fireNotFound();
              }
            });
        })
        .catch((error) => {
          fireError(error);
          console.log("ee");
        });
    },

    async filterOs(context, { name, type }) {
      context
        .dispatch("verifyRefreshToken")
        .then(async () => {
          await axios({
            method: "post",
            url: server + "api/inventory/os/filter/",
            data: {
              name__icontains: name,
              type__icontains: type,
            },
          })
            .then((response) => {
              context.commit("setOs", response.data);
            })
            .catch((error) => {
              if (error.response.status == 404) {
                context.commit("setOs", []);
                fireNotFound();
              }
            });
        })
        .catch((error) => {
          fireError(error);
        });
    },

    //employee

    async getEmployee(context,url) {
      context
        .dispatch("verifyRefreshToken")
        .then(async () => {
          await axios({
            method: "get",
            url: url ? url : server + "api/inventory/employee/",
          })
            .then((response) => {
              context.commit("setEmployee", response.data);
            })
            .catch(function(error) {
              fireError(error);
            });
        })
        .catch((err) => {
          fireError(err);
        });
    },

    async addEmployee(
      context,
      { email, first_name, last_name, identifier, division, pole, _function }
    ) {
      context
        .dispatch("verifyRefreshToken")
        .then(async () => {
          await axios({
            method: "post",
            data: {
              email: email,
              first_name: first_name,
              last_name: last_name,
              identifier: identifier,
              division: division,
              pole: pole,
              function: _function,
            },
            url: `${server}api/inventory/employee/`,
          })
            .then((response) => {
              context.dispatch("getEmployee");
            })
            .catch(function(error) {
              if (error.response.status == 400) {
                fireError(error);
              }
            });
        })
        .catch((err) => {
          fireError(err);
        });
    },

    async updateEmployee(
      context,
      {
        id,
        email,
        first_name,
        last_name,
        identifier,
        division,
        pole,
        _function,
      }
    ) {
      context
        .dispatch("verifyRefreshToken")
        .then(async () => {
          await axios({
            method: "patch",
            data: {
              email: email,
              first_name: first_name,
              last_name: last_name,
              identifier: identifier,
              division: division,
              pole: pole,
              function: _function,
            },
            url: `${server}api/inventory/employee/${id}/`,
          }).catch(function(error) {
            fireError(error);
          });
          context.dispatch("getEmployee");
        })
        .catch((err) => {
          fireError(err);
        });
    },

    async deleteEmployee(context, id) {
      context
        .dispatch("verifyRefreshToken")
        .then(async () => {
          await axios({
            method: "delete",
            url: server + "api/inventory/employee/" + id + "/",
          })
            .then((response) => {
              context.dispatch("getEmployee");
            })
            .catch(function(error) {
              fireError(error);
            });
        })
        .catch((err) => {
          fireError(err);
        });
    },

    async searchEmployee(context, q) {
      context
        .dispatch("verifyRefreshToken")
        .then(async () => {
          await axios({
            method: "post",
            url: server + "api/inventory/employee/search/",
            data: {
              query: q,
            },
          })
            .then((response) => {
              context.commit("setEmployee", response.data);
            })
            .catch(function(error) {
              if (error.response.status == 404) {
                context.commit("setEmployee", []);
                fireNotFound();
              }
            });
        })
        .catch((err) => {
          fireError(err);
        });
    },

    async filterEmployee(
      context,
      { email, first_name, last_name, identifier }
    ) {
      context
        .dispatch("verifyRefreshToken")
        .then(async () => {
          await axios({
            method: "post",
            url: server + "api/inventory/employee/filter/",
            data: {
              email__icontains: email,
              first_name__icontains: first_name,
              last_name__icontains: last_name,
              identifier: identifier,
            },
          })
            .then((response) => {
              context.commit("setEmployee", response.data);
            })
            .catch(function(error) {
              if (error.response.status == 404) {
                context.commit("setEmployee", []);
                fireNotFound();
              }
            });
        })
        .catch((err) => {
          fireError(err);
        });
    },

    async addSoftwareToEmployee(context, { software, employee }) {
      context
        .dispatch("verifyRefreshToken")
        .then(async () => {
          await axios({
            method: "post",
            data: {
              software: software,
            },
            url: `${server}api/inventory/employee/${employee}/add_software/`,
          })
            .then((response) => {
              context.dispatch("getEmployee");
              return response.data;
            })
            .catch((error) => {
              fireError(error);
            });
        })
        .catch((err) => {
          fireError(err);
        });
    },

    async removeSoftwareToEmployee(context, { software, employee }) {
      context
        .dispatch("verifyRefreshToken")
        .then(async () => {
          await axios({
            method: "post",
            data: {
              software: software,
            },
            url: `${server}api/inventory/employee/${employee}/remove_software/`,
          })
            .then((response) => {
              context.dispatch("getEmployee");
              return response.data;
            })
            .catch((error) => {
              fireError(error);
            });
        })
        .catch((err) => {
          fireError(err);
        });
    },

    //software

    async getSoftware(context, url) {
      context
        .dispatch("verifyRefreshToken")
        .then(async () => {
          await axios({
            method: "get",
            url: url ? url : server + "api/inventory/software/",
          })
            .then((response) => {
              context.commit("setSoftware", response.data);
            })
            .catch(function(error) {
              fireError(error);
            });
        })
        .catch((err) => {
          fireError(err);
        });
    },

    async addSoftware(context, { name, editor, version }) {
      context
        .dispatch("verifyRefreshToken")
        .then(async () => {
          await axios({
            method: "post",
            data: {
              name: name,
              editor: editor,
              version: version,
            },
            url: `${server}api/inventory/software/`,
          })
            .then((response) => {
              context.dispatch("getSoftware");
            })
            .catch(function(error) {
              fireError(error);
            });
        })
        .catch((err) => {
          fireError(err);
        });
    },

    async updateSoftware(context, { id, name, editor, version }) {
      context
        .dispatch("verifyRefreshToken")
        .then(async () => {
          await axios({
            method: "patch",
            data: {
              name: name,
              editor: editor,
              version: version,
            },
            url: `${server}api/inventory/software/${id}/`,
          }).catch(function(error) {
            fireError(error);
          });
          context.dispatch("getSoftware");
        })
        .catch((err) => {
          fireError(err);
        });
    },

    async deleteSoftware(context, id) {
      context
        .dispatch("verifyRefreshToken")
        .then(async () => {
          await axios({
            method: "delete",
            url: server + "api/inventory/software/" + id + "/",
          })
            .then((response) => {
              context.dispatch("getSoftware");
            })
            .catch(function(error) {
              fireError(error);
            });
        })
        .catch((err) => {
          fireError(err);
        });
    },

    async searchSoftware(context, q) {
      context
        .dispatch("verifyRefreshToken")
        .then(async () => {
          await axios({
            method: "post",
            url: server + "api/inventory/software/search/",
            data: {
              query: q,
            },
          })
            .then((response) => {
              context.commit("setSoftware", response.data);
            })
            .catch(function(error) {
              if (error.response.status == 404) {
                context.commit("setSoftware", []);
                fireNotFound();
              }
            });
        })
        .catch((err) => {
          fireError(err);
        });
    },

    async filterSoftware(context, { name, editor, version }) {
      context
        .dispatch("verifyRefreshToken")
        .then(async () => {
          await axios({
            method: "post",
            url: server + "api/inventory/software/filter/",
            data: {
              name__icontains: name,
              editor__icontains: editor,
              version: version,
            },
          })
            .then((response) => {
              context.commit("setSoftware", response.data);
            })
            .catch(function(error) {
              if (error.response.status == 404) {
                context.commit("setSoftware", []);
                fireNotFound();
              }
            });
        })
        .catch((err) => {
          fireError(err);
        });
    },

    //poles
    async getPoles(context) {
      context
        .dispatch("verifyRefreshToken")
        .then(async () => {
          await axios({
            method: "get",
            url: server + "api/inventory/pole/",
          })
            .then((response) => {
              context.commit("setPoles", response.data);
            })
            .catch(function(error) {
              fireError(error);
            });
        })
        .catch((err) => {
          fireError(err);
        });
    },

    //divisions
    async getDivisions(context) {
      context
        .dispatch("verifyRefreshToken")
        .then(async () => {
          await axios({
            method: "get",
            url: server + "api/inventory/division/",
          })
            .then((response) => {
              context.commit("setDivisions", response.data);
            })
            .catch(function(error) {
              fireError(error);
            });
        })
        .catch((err) => {
          fireError(err);
        });
    },

    //functions
    async getFunctions(context) {
      context
        .dispatch("verifyRefreshToken")
        .then(async () => {
          await axios({
            method: "get",
            url: server + "api/inventory/function/",
          })
            .then((response) => {
              context.commit("setFunctions", response.data);
            })
            .catch(function(error) {
              fireError(error);
            });
        })
        .catch((err) => {
          fireError(err);
        });
    },
  },

  modules: {},
});
