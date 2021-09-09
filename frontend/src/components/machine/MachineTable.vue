<template>
  <div>
    <div class="flex justify-start">
      <button
        @click="add()"
        class="rounded text-gray-100 px-6 py-2 bg-green-500 shadow-md hover:shadow-inner hover:bg-green-600 transition-all m-2">
        Ajouter
      </button>
    </div>

    <table class="mx-auto container">
      <th
        v-for="header in headers"
        :key="header.title"
        :class="header.class + ' ' + border"
        class="lg:p-2 p-1 text-center xl:text-md text-sm font-semibold">
        {{ header.title }}
      </th>
      <tr v-for="(el, index) in machines" :key="el.machine">
        <td :class="border" class="xl:p-2 lg:p-1 md:p-1">
          {{ index + 1 }}
        </td>
        <td :class="tableRowBg(el)" class="xl:p-2 lg:p-1 md:p-1">
          {{ el.name }}
        </td>
        <td :class="border" class="sm:table-cell hidden">
          {{ el.serial_number }}
        </td>
        <td :class="border" class="sm:table-cell hidden">
          {{ el.reference }}
        </td>
        <td :class="border">
          {{ el.model.name }}
        </td>
        <td :class="border">{{ el.model.ram }} Go</td>
        <td :class="border">{{ el.storage }} Go</td>
        <td :class="border">
          {{ el.model.cpu }}
        </td>
        <td :class="border" class="lg:p-2 xl:table-cell hidden">
          {{ el.os.name }} {{ el.os.type }}
        </td>
        <td :class="border" class="xl:p-2 lg:p-1 md:p-1">
          <p v-if="el.employee">
            {{ el.employee.last_name }} {{ el.employee.first_name }}
          </p>
          <p v-else>
            - - -
          </p>
        </td>
        <td :class="border" class="xl:p-2 lg:p-1 md:p-1">
          <p v-if="el.employee">
            {{ el.employee.identifier }}
          </p>
          <p v-else>
            - - -
          </p>
        </td>
        <td :class="border">
          <button @click="edit(el)">
            <font-awesome-icon
              icon="pen"
              class="hover:shadow-lg transition-all text-blue-600 text-lg m-2"
            />
          </button>

          <button @click="destroy(el.machine)">
            <font-awesome-icon
              icon="times-circle"
              class="hover:shadow-lg transition-all text-red-600 text-lg m-2"
            />
          </button>
        </td>
      </tr>
    </table>
      <div class="relative ">
      <button
        @click="Perv()"
       v-if="this.$store.state.machine.previous"
        class="rounded text-gray-100 px-6 py-2 bg-blue-500 shadow-md hover:shadow-inner hover:bg-blue-600 transition-all m-2  absolute left-0 filter drop-shadow-lg "
      >
        <font-awesome-icon icon="angle-double-left" /> Précédent
      </button>
      <button
        @click="Next()"
        v-if="this.$store.state.machine.next"
        class="rounded text-gray-100 px-6 py-2 bg-blue-500 shadow-md hover:shadow-inner hover:bg-blue-600 transition-all m-2 justify-self-end absolute right-0 filter drop-shadow-lg"
      >
        Suivant  <font-awesome-icon icon="angle-double-right" />
      </button>
      <div class="h-12"></div>
    </div>
    <div
      v-if="show"
      class="bg-gray-500 absolute top-0 left-0 bottom-0 right-0 h-full w-full bg-opacity-60">
      <div class="flex justify-center items-center h-screen">
        <div class="bg-white rounded-xl p-12 shadow-2xl" style="width: 75%">
          <div class="grid lg:grid-cols-2 gap-6">
            <div
              v-for="input in inputs"
              :key="input.id"
              class="border focus-within:border-blue-500 focus-within:text-blue-500 transition-all duration-500 relative rounded p-1">
              <div class="-mt-4 absolute tracking-wider px-1 uppercase text-xs">
                <p>
                  <label for="name" class="bg-white text-gray-600 px-1">{{ input.label }} *</label>
                </p>
              </div>
              <p>
                <input
                  v-model="input.value"
                  :type="input.type"
                  autocomplete="false"
                  tabindex="0"
                  class="py-1 px-1 text-gray-900 outline-none block h-full w-full"
                />
              </p>
            </div>
          </div>

          <div class="grid lg:grid-cols-2 gap-6 mt-5">
            <div
              v-for="select in selects"
              :key="select.id"
              class="border focus-within:border-blue-500 focus-within:text-blue-500 transition-all duration-500 relative rounded p-1
              "
            >
              <div class="-mt-4 absolute tracking-wider px-1 uppercase text-xs">
                <p>
                  <label for="name" class="bg-white text-gray-600 px-1"
                    >{{ select.label }} *</label
                  >
                </p>
              </div>
              <p>
                <select
                  v-if="select.id == 'model'"
                  v-model="select.value"
                  class="
                    py-1
                    px-1
                    text-gray-900
                    outline-none
                    block
                    h-full
                    w-full
                  "
                >
                  <option :value="select.value">{{ select.value }}</option>
                  <option
                    v-for="model in models(select.value)"
                    :key="model.name"
                    :value="model.name"
                  >
                    {{ model.name }}
                  </option>
                </select>
                <select
                  v-else-if="select.id == 'os'"
                  v-model="select.value"
                  class="
                    py-1
                    px-1
                    text-gray-900
                    outline-none
                    block
                    h-full
                    w-full
                  "
                >
                  <option :value="select.value">{{ select.value }}</option>
                  <option
                    v-for="item in os(select.value)"
                    :key="item.name"
                    :value="item.name + ' ' + item.type"
                  >
                    {{ item.name }} {{ item.type }}
                  </option>
                </select>
                <select
                  v-else
                  v-model="select.value"
                  class="
                    py-1
                    px-1
                    text-gray-900
                    outline-none
                    block
                    h-full
                    w-full
                  "
                >
                  <option>
                    
                  </option>
                  <option v-if="select.value" :value="select.value">{{
                    select.value
                  }}</option>
                  <option
                    v-for="item in employee(select.value)"
                    :key="item.last_name"
                    :value="item.last_name + ' ' + item.first_name"
                  >
                    {{ item.last_name }} {{ item.first_name }}
                  </option>
                </select>
              </p>
            </div>
          </div>
          <div class="mt-6 pt-3">
            <button
              @click="exec(action)"
              class="rounded text-gray-100 px-6 py-2 bg-blue-500 shadow-md hover:shadow-inner hover:bg-blue-700 transition-all duration-200 m-4">
              <p v-if="action == 'Edit'">Editer</p>
              <p v-if="action == 'Add'">Ajouter</p>
            </button>
            <button
              @click="close_modal()"
              class="rounded text-gray-100 px-6 py-2 bg-red-500 shadow-md hover:shadow-inner hover:bg-red-700 transition-all duration-200 m-4">
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from "sweetalert2";
export default {
  name: "DataTable",
  components: {},
  data() {
    return {
      action: "",
      show: false,
      id: "",
      model_id: "",
      assigned: null,
      os_id: "",
      border: "border border-gray-500 p-1 text-sm",
      headers: [
        { title: "#", class: "" },
        { title: "Machine", class: "" },
        { title: "SN", class: "sm:table-cell hidden" },
        { title: "Reference", class: "sm:table-cell hidden" },
        { title: "Model", class: "" },
        { title: "RAM", class: "" },
        { title: "Stockage", class: "" },
        { title: "Processeur", class: "" },
        { title: "OS", class: "xl:table-cell hidden" },
        { title: "utilisateur", class: "" },
        { title: "matricule", class: "" },
        { title: "actions" },
      ],
      inputs: [
        { id: "name", label: "nom de la mchine", value: "", type: "text" },
        { id: "reference", label: "reference", value: "", type: "text" },
        {
          id: "serial_number",
          label: "nombre serial",
          value: "",
          type: "text",
        },
        { id: "storage", label: "stockage", value: "", type: "number" },
      ],
      selects: [
        { id: "model", label: "model", value: "" },
        { id: "os", label: "os", value: "" },
        { id: "employee", label: "utilisateur", value: "" },
      ],
    };
  },
  methods: {
    tableRowBg(el) {
      if (el.employee) {
        return this.border + " " + "bg-red-100";
      } else {
        return this.border + " " + "bg-green-100";
      }
    },
    edit(machine) {
      this.action = "Edit";
      //binding data

      //binding value of input form to machine
      this.inputs.forEach((element) => {
        element.value = machine[element.id];
        //console.log(element.id+" "+element.value)
      });
      //binding value of select form to machine
      this.selects.forEach((element) => {
        if (machine[element.id] != null) {
          element.value = machine[element.id].name;
          if (element.id == "os")
            element.value += " " + machine[element.id].type;
          if (element.id == "employee")
            element.value =
              machine[element.id].last_name +
              " " +
              machine[element.id].first_name;
        } else {
          element.value = null;
        }
      });
      this.assigned = machine.assigned;
      this.id = machine.machine;
      //reemove

      //show the modal
      this.show = true;
    },
    add() {
      this.action = "Add";
      //reset value of input
      this.inputs.forEach((element) => {
        element.value = "";
        //console.log(element.id+" "+element.value)
      });
      //binding value of select form to machine
      this.selects.forEach((element) => {
        element.value = "";
      });
      //show the modal
      this.show = true;
    },
    exec(action) {
      let models = this.$store.state.models.results;
      let oss = this.$store.state.os.results;
      let employees = this.$store.state.employee.results;
      
      let data = this.inputs.concat(this.selects);
      let values = data.reduce(function(map, obj) {
        map[obj.id] = obj.value;
        return map;
      }, {});

      let model = models.find((el) => el.name == values["model"]);
      let employee = employees.find((el) => el.last_name + " " + el.first_name == values["employee"]);
      let os = oss.find((el) => el.name + " " + el.type == values["os"]);

      values["model"] = model  ? model.model : ""
      values["os"] = os ? os.os : ""
      values["assigned"] = this.assigned;
      values["employee"] = employee ? employee.employee : ""
     
      if (action == "Edit") {
        values["id"] = this.id;
        this.$store.dispatch("updateMachines", values);
      } else {
        this.$store.dispatch("addMachine", values);
      }
      this.$store.dispatch("getAviable");
      this.$store.dispatch("getMachineCount");
      this.close_modal();
    },
    destroy(id) {
      Swal.fire({
        title: "Êtes-vous sûr de supprimer cet élement?",
        text: "Vous ne porrier pas restaurer cet élement!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        cancelButtonText: "Annuler",
        confirmButtonText: "Oui, supprimer!",
      }).then((result) => {
        if (result.isConfirmed) {
          this.$store.dispatch("deleteMchine", id);

          Swal.fire("Supprimé!", "Cet élement a été supprimer.", "success");
        }
      });
    },
    close_modal() {
      this.show = false;
    },
    models(val = null) {
      let models = this.$store.state.models.results;
      if (val)
        models = models.filter(function(el) {
          return el.name != val;
        });
      return models;
    },
    os(val) {
      let os = this.$store.state.os.results;
      os = os.filter(function(el) {
        return el.name + " " + el.type != val;
      });
      return os;
    },
    employee(val) {
      let employee = this.$store.state.employee.results;
      employee = employee.filter(function(employee) {
        return employee.last_name + " " + employee.first_name != val;
      });
      return employee;
    },
    Next(){
      this.$store.dispatch("getSoftware",this.$store.state.machine.next);
    },
    Perv(){
      this.$store.dispatch("getSoftware",this.$store.state.machine.previous);
    }

  },
  mounted() {
    this.$store.dispatch("getMachines")
    this.$store.dispatch("getModels");
    this.$store.dispatch("getOs");
    this.$store.dispatch("getEmployee");
  },
  computed: {
    machines() {
      return this.$store.state.machines.results;
    },
  },
};
</script>

<style scoped></style>
