<template>
  <div>
    <div class="flex justify-start">
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
      <tr v-for="(el, index) in models()" :key="el.machine">
        <td :class="border" class="xl:p-2 lg:p-1 md:p-1">
          {{ index }}
        </td>
        <td :class="border" class="xl:p-2 lg:p-1 md:p-1">
          {{ el.name }}
        </td>
        <td :class="border" class="xl:p-2 lg:p-1 md:p-1">
          {{ el.ram }}
        </td>
        <td :class="border">
          {{ el.cpu }}
        </td>
        <td :class="border">{{ el.count }}</td>
        <td :class="border">
          {{ el.c_available }}
        </td>
        <td :class="border">
          <button @click="edit(el)">
            <font-awesome-icon
              icon="pen"
              class="hover:shadow-lg transition-all text-blue-600 text-lg m-2"
            />
          </button>

          <button @click="destroy(el.model)">
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
        v-if="this.$store.state.models.previous"
        class="rounded text-gray-100 px-6 py-2 bg-blue-500 shadow-md hover:shadow-inner hover:bg-blue-600 transition-all m-2  absolute left-0 filter drop-shadow-lg "
      >
        <font-awesome-icon icon="angle-double-left" /> Précédent
      </button>
      <button
        @click="Next()"
        v-if="this.$store.state.models.next"
        class="rounded text-gray-100 px-6 py-2 bg-blue-500 shadow-md hover:shadow-inner hover:bg-blue-600 transition-all m-2 justify-self-end absolute right-0 filter drop-shadow-lg"
      >
        Suivant <font-awesome-icon icon="angle-double-right" />
      </button>
    </div>
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
              class=" border focus-within:border-blue-500 focus-within:text-blue-500 transition-all duration-500 relative rounded p-1"
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

          <div class="grid lg:grid-cols-2 gap-6 mt-5">
            <div
              v-for="select in selects"
              :key="select.id"
              class="border focus-within:border-blue-500 focus-within:text-blue-500 transition-all duration-500 relative rounded p-1"
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
                  class="py-1 px-1 text-gray-900 outline-none block h-full w-full"
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
                  v-else
                  v-model="select.value"
                  class="py-1 px-1 text-gray-900 outline-none block h-full w-full"
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
              </p>
            </div>
          </div>
          <div class="mt-6 pt-3">
            <button
              @click="exec(action)"
              class=" rounded text-gray-100 px-6 py-2 bg-blue-500 shadow-md hover:shadow-inner hover:bg-blue-700 transition-all duration-200 m-4"
            >
              <p v-if="action == 'Edit'">Editer</p>
              <p v-if="action == 'Add'">Ajouter</p>
            </button>
            <button
              @click="close_modal()"
              class=" rounded text-gray-100 px-6 py-2 bg-red-500 shadow-md hover:shadow-inner hover:bg-red-700 transition-all duration-200 m-4"
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
        { title: "Model", class: "" },
        { title: "RAM", class: "" },
        { title: "Processeur", class: "" },
        { title: "nombre", class: "" },
        { title: "aviable", class: "" },
        { title: "actions" },
      ],
      inputs: [
        { id: "name", label: "nom du model", value: "", type: "text" },
        { id: "cpu", label: "cpu", value: "", type: "text" },
        { id: "ram", label: "ram", value: "", type: "number" },
      ],
      selects: [],
    };
  },
  methods: {
    edit(model) {
      this.action = "Edit";
      //binding data

      //binding value of input form to machine
      this.inputs.forEach((element) => {
        element.value = model[element.id];
        //console.log(element.id+" "+element.value)
      });
      //binding value of select form to machine
      this.id = model.model;
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
      if (action == "Edit") {
        let values = this.inputs.reduce(function(map, obj) {
          map[obj.id] = obj.value;
          return map;
        }, {});
        values["id"] = this.id;
        this.$store.dispatch("updateModel", values);
        this.close_modal();
      } else {
        let values = this.inputs.reduce(function(map, obj) {
          map[obj.id] = obj.value;
          return map;
        }, {});

        this.$store.dispatch("addModel", values);
        this.close_modal();
      }
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
          this.$store.dispatch("deleteModel", id);
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
    Next(){
      this.$store.dispatch("getModels",this.$store.state.models.next);
    },
    Perv(){
      this.$store.dispatch("getModels",this.$store.state.models.previous);
    }
  },
  mounted() {
    this.$store.dispatch("getModels");
  },
  computed: {
    machines() {
      return this.$store.state.machines.results;
    },
  },
};
</script>

<style scoped></style>
