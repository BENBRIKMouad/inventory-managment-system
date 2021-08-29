<template>
  <div
    class="
      flex
      sm:flex-row
      flex-col
      items-center
      lg:mt-3
      mt-2
      justify-center
      transition-all
    "
  >
    <div
      v-for="metric in metrics"
      :key="metric.title"
      class="
        flex flex-col
        rounded-xl
        p-3
        border border-gray-100
        shadow-md
        w-36
        lg:mr-5
        xl:mr-20
        mr-4
        mb-6
        transition-all
        duration-200
        min-w-max
      "
    >
      <p class="lg:text-2xl text-lg font-bold">{{ metric.title }}</p>
      <p class="lg:text-xl font-semibold text-gray-600">
        {{ count(metric.title) }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: "DashBoard",
  data() {
    return {
      metrics: [{ title: "Machines" }, { title: "Models" }, { title: "Libre" }],
    };
  },
  computed: {
    Machines() {
      this.$store.dispatch("getMachineCount");
      return this.$store.state.machineCount;
    },
    Models() {
      this.$store.dispatch("getModelCount");
      return this.$store.state.modelsCount;
    },
    Libre() {
      this.$store.dispatch("getAviable");
      return this.$store.state.aviable;
    },
  },
  methods: {
    count(type) {
      switch (type) {
        case "Machines":
          return this.Machines;
        case "Models":
          return this.Models;
        case "Libre":
          return this.Libre;
        default:
          return 0;
      }
    },
  },
};
</script>

<style>
</style>