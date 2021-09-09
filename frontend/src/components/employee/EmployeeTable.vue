<template>
  <div class="table-auto">
    <div class="flex justify-end">
      <button
        @click="add()"
        class="rounded text-gray-100 px-6 py-2 bg-green-500 shadow-md hover:shadow-inner hover:bg-green-600 transition-all m-2"
      >
        Ajouter
      </button>
    </div>

    <table class="container">
      <th
        v-for="header in headers"
        :key="header.title"
        :class="header.class + ' ' + border"
        class="lg:p-7 p-1 text-center xl:text-md text-sm font-semibold"
      >
        {{ header.title }}
      </th>
      <tr v-for="(el, index) in employee()" :key="el.machine">
        <td :class="border" class="xl:p-2 lg:p-1 md:p-1">
          {{ index + 1 }}
        </td>
        <td :class="border" class="xl:p-2 lg:p-1 md:p-1">
          {{ el.last_name }} {{ el.first_name }}
        </td>
        <td :class="border">
          {{ el.email }}
        </td>
        <td :class="border" class="xl:p-2 lg:p-1 md:p-1">
          {{ el.identifier }}
        </td>
        <td :class="border" class="xl:p-2 lg:p-1 md:p-1">
          <button @click="showSftwareList(el)">
            <font-awesome-icon
              icon="list"
              class="hover:shadow-lg transition-all text-blue-600 text-lg m-2"
            />
          </button>
        </td>
        <td :class="border">
          <button @click="edit(el)">
            <font-awesome-icon
              icon="pen"
              class="hover:shadow-lg transition-all text-blue-600 text-lg m-2"
            />
          </button>

          <button @click="destroy(el.employee)">
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
       v-if="this.$store.state.employee.previous"
        class="rounded text-gray-100 px-6 py-2 bg-blue-500 shadow-md hover:shadow-inner hover:bg-blue-600 transition-all m-2  absolute left-0 filter drop-shadow-lg "
      >
          <font-awesome-icon icon="angle-double-left" />Précédent
      </button>
      <button
        @click="Next()"
        v-if="this.$store.state.employee.next"
        class="rounded text-gray-100 px-6 py-2 bg-blue-500 shadow-md hover:shadow-inner hover:bg-blue-600 transition-all m-2 justify-self-end absolute right-0 filter drop-shadow-lg"
      >
        Suivant <font-awesome-icon icon="angle-double-right" />
      </button>
    </div>
    <div class="h-12"></div>
    <div
      v-if="show"
      class=" bg-gray-500 absolute top-0 left-0 bottom-0 right-0 h-full w-full bg-opacity-60"
    >
      <div class="flex justify-center items-center h-screen">
        <div class="bg-white rounded-xl p-12 shadow-2xl" style="width: 75%">
          <div class="grid lg:grid-cols-2 gap-6">
            <div
              v-for="input in inputs"
              :key="input.id"
              class="border focus-within:border-blue-500 focus-within:text-blue-500 transition-all duration-500 relative rounded p-1 "
            >
              <div class="-mt-4 absolute tracking-wider px-1 uppercase text-xs">
                <p>
                  <label for="name" class="bg-white text-gray-600 px-1"
                    >{{ input.label }} *</label
                  >
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
          <div class="mt-6 pt-3">
            <button
              @click="exec(action)"
              class="rounded text-gray-100 px-6 py-2 bg-blue-500 shadow-md hover:shadow-inner hover:bg-blue-700 transition-all duration-200 m-4"
            >
              {{ action }}
            </button>
            <button
              @click="close_modal()"
              class="rounded text-gray-100 px-6 py-2 bg-red-500 shadow-md hover:shadow-inner hover:bg-red-700 transition-all duration-200 m-4"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="show_list"
      class=" bg-gray-500 absolute top-0 left-0 bottom-0 right-0 h-full w-full bg-opacity-60 "
    >
      <div class="flex justify-center items-center h-full">
        <div class="bg-white rounded-xl p-9 shadow-2xl " style="width: 75% ">
          <div class="overflow-y-scroll max-h-64 rounded-xl p-2">
            <table class="container">
              <th
                v-for="header in softwareHeaders"
                :key="header.title"
                :class="header.class + ' ' + border"
                class="bg-white p-1 text-center xl:text-md text-sm font-semibold sticky -top-4"
              >
                {{ header.title }}
              </th>
              <tr
                v-for="(el, index) in employeeSoftware.software"
                :key="el.software"
              >
                <td :class="border">
                  {{ index + 1 }}
                </td>
                <td :class="border">
                  {{ el.name }}
                </td>
                <td :class="border">
                  {{ el.editor }}
                </td>
                <td :class="border">
                  {{ el.version }}
                </td>
                <td :class="border">
                  <button @click="removeSoftware(el)">
                    <font-awesome-icon
                      icon="times-circle"
                      class="hover:shadow-lg transition-all text-red-600 text-lg m-2"
                    />
                  </button>
                </td>
              </tr>
            </table>
          </div>

          <div class="grid lg:grid-cols-1 gap-6">
            <div class="flex mt-5">
              <div
                v-for="select in softwareForm"
                :key="select.id"
                class="border focus-within:border-blue-500 focus-within:text-blue-500 transition-all duration-500 relative rounded p-1 md:w-96 w-52"
              >
                <div
                  class="-mt-4 absolute tracking-wider px-1 uppercase text-xs"
                >
                  <p>
                    <label for="name" class="bg-white text-gray-600 px-1"
                      >{{ select.label }} *</label
                    >
                  </p>
                </div>
                <p>
                  <select
                    v-model="select.value"
                    class="py-1 px-1 text-gray-900 outline-none block h-full w-full"
                  >
                    <option
                      v-for="software in software(select.value)"
                      :key="software.name"
                      :value="software"
                    >
                      {{ software.name }} {{ software.version }}
                    </option>
                  </select>
                </p>
              </div>
              <button
                @click="add_software()"
                class="rounded text-gray-100 px-6 py-2 bg-green-500 shadow-md hover:shadow-inner hover:bg-green-700 transition-all duration-200 ml-2"
              >
                Ajouter
              </button>
            </div>
          </div>
          <div class="mt-3 pt-2">
            <button
              @click="close_modal()"
              class="rounded text-gray-100 px-5 py-2 bg-red-500 shadow-md hover:shadow-inner hover:bg-red-700 transition-all duration-200 m-2"
            >
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
  name: "EmployeeTable",
  components: {},
  data() {
    return {
      action: "",
      show: false,
      show_list: false,
      id: "",
      model_id: "",
      assigned: null,
      os_id: "",
      border: "border border-gray-500 p-1 text-sm",
      headers: [
        { title: "#", class: "" },
        { title: "nom", class: "" },
        { title: "email", class: "" },
        { title: "matricule", class: "" },
        { title: "logiciel", class: "" },
        { title: "actions" },
      ],
      softwareHeaders: [
        { title: "#", class: "" },
        { title: "logiciel", class: "" },
        { title: "editeur", class: "" },
        { title: "version", class: "" },
        { title: "actions" },
      ],
      inputs: [
        { id: "first_name", label: "prenom", value: "", type: "text" },
        { id: "last_name", label: "nom", value: "", type: "text" },
        { id: "email", label: "email", value: "", type: "email" },
        { id: "identifier", label: "matricule", value: "", type: "text" },
      ],
      softwareForm: [
        { id: "sofrware", label: "logiciel", value: "", type: "text" },
      ],
      employeeSoftware: null,
    };
  },
  methods: {
    edit(employee) {
      this.action = "Edit";
      //binding data

      //binding value of input form to machine
      this.inputs.forEach((element) => {
        element.value = employee[element.id];
      });
      //binding value of select form to machine
      this.id = employee.employee;
      //reemove

      //show the modal
      this.show = true;
    },
    add() {
      this.action = "Add";
      //reset value of input
      this.inputs.forEach((element) => {
        element.value = "";
      });
      
     
      //show the modal
      this.show = true;
    },
    showSftwareList(el) {
      this.employeeSoftware = el;
      this.show_list = true;
    },
    async add_software() {
      let software = this.softwareForm[0].value;
      let employee = this.employeeSoftware.employee;
      let values = { software: software.software, employee: employee };
      this.$store.dispatch("addSoftwareToEmployee", values);
      const filterItems = this.employeeSoftware.software.filter((item) => {
        return (
          item.name + item.version ==
          this.softwareForm[0].value.name + this.softwareForm[0].value.version
        );
      });
      if (filterItems.length == 0)
        this.employeeSoftware.software.push(this.softwareForm[0].value);
    },
    removeSoftware(software){
      let employee = this.employeeSoftware.employee;
      let values = { software: software.software, employee: employee };
      this.$store.dispatch("removeSoftwareToEmployee", values);
      this.employeeSoftware.software = this.employeeSoftware.software.filter(el => el.name+el.version != software.name+software.version)
    },
    exec(action) {
      let values = this.inputs.reduce(function(map, obj) {
        map[obj.id] = obj.value;
        return map;
      }, {});

      if (action == "Edit") {
        values["id"] = this.id;
        this.$store.dispatch("updateEmployee", values);
      } else this.$store.dispatch("addEmployee", values);

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
        confirmButtonText: "Yes, delete it!",
      }).then((result) => {
        if (result.isConfirmed) {
          this.$store.dispatch("deleteEmployee", id);
          Swal.fire("Supprimé!", "Cet élement a été supprimer.", "success");
        }
      });
    },

    close_modal() {
      this.show = false;
      this.show_list = false;
    },
    employee(val) {
      let employee = this.$store.state.employee.results;
      if (employee)
        employee = employee.filter(function(employee) {
          return employee.last_name + " " + employee.first_name != val;
        });
      return employee;
    },
    software(val) {
      let software = this.$store.state.software.results;
      return software;
    },
        Next(){
      this.$store.dispatch("getSoftware",this.$store.state.employee.next);
    },
    Perv(){
      this.$store.dispatch("getSoftware",this.$store.state.employee.previous);
    }

  },
  mounted() {
    this.$store.dispatch("getEmployee");
    this.$store.dispatch("getModels");
    this.$store.dispatch("getOs");
    this.$store.dispatch("getSoftware");
  },
  computed: {
    machines() {
      return this.$store.state.machines.results;
    },
  },
};
</script>

<style scoped></style>
