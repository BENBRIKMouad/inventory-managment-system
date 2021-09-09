<template>
  <div class="items-center mt-3 relative">
    <form v-on:submit.prevent="search">
      <font-awesome-icon icon="search" class="absolute top-3 ml-3 text-sm" />
      <input
        type="hidden"
        name="CSRFToken"
        value="OWY4NmQwODE4ODRjN2Q2NTlhMmZlYWEwYzU1YWQwMTVhM2JmNGYxYjJiMGI4MjJjZDE1ZDZMGYwMGEwOA=="
      />
      <input
        type="text"
        placeholder="Rechercher"
        v-model="searchq"
        class="
          antialiased
          pl-10
          lg:w-10/12
          w-full
          rounded-lg
          p-2
          bg-gray-100
          text-sm
          shadow-sm
          focus:outline-none
          focus:shadow-xl
          transition-all
          duration-200
        "
      />
    </form>

    <div class="flex flex-row mt-5 flex-wrap items-center justify-center">
      <input
        type="text"
        v-for="el in filterfields"
        :key="el.placeholder"
        :placeholder="el.placeholder"
        v-model="el.value"
        class="
          antialiased
          m-2
          p-1
          pl-2
          rounded-lg
          bg-gray-100
          text-sm
          shadow-sm
          focus:outline-none
          focus:shadow-lg
          transition-all
        "
      />
    </div>
    <div class="flex justify-end m-0 p-0">
      <button
        class="
          bg-blue-500
          shadow-md
          p-2
          rounded-md
          px-5
          text-gray-100
          justify-end
        "
        @click="filter"
      >
        filtrer
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "MachineSearch",
  data() {
    return {
      searchq: "",
      filterfields: [
        { id: "machine", placeholder: "Machine", value: "" },
        { id: "model", placeholder: "Model", value: "" },
        { id: "ref", placeholder: "REF", value: "" },
        { id: "sn", placeholder: "SN", value: "" },
        { id: "cpu", placeholder: "CPU", value: "" },
        { id: "os", placeholder: "OS", value: "" },
        { id: "ram", placeholder: "RAM", value: "" },
        { id: "stockage", placeholder: "stockage", value: "" },
      ],
    };
  },
  methods: {
    search() {
      this.$store.dispatch("searchMachines", this.searchq);
    },
    filter() {
      let filter = {
        machine: this.filterfields.find((el) => el.id === "machine").value,
        model: this.filterfields.find((el) => el.id === "model").value,
        ref: this.filterfields.find((el) => el.id === "ref").value,
        sn: this.filterfields.find((el) => el.id === "sn").value,
        cpu: this.filterfields.find((el) => el.id === "cpu").value,
        os: this.filterfields.find((el) => el.id === "os").value,
        ram: this.filterfields.find((el) => el.id === "ram").value,
        stockage: this.filterfields.find((el) => el.id === "stockage").value,
      };
      console.log(filter);
      this.$store.dispatch("filterMachines", filter);
    },
  },
  computed: {},
};
</script>

<style></style>
