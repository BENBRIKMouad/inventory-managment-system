<template>
  <div
    class="
      w-full
      h-full
      py-2
      xl:px-8
      lg:px-5
      px-2
      overflow-y-scroll
      items-center
    "
  >
    <os-search></os-search>
    <dash-board></dash-board>
    <div class="">
      <os-table></os-table>
    </div>
  </div>
</template>

<script>
import OsTable from "./OsTable.vue";
import OsSearch from "./OsSearch.vue";
import DashBoard from "../DashBoard.vue";
export default {
  name: "MainPanel",
  data() {
    return {
      data: null,
    };
  },
  components: {
    OsSearch,
    DashBoard,
    OsTable,
  },
  mounted() {},
};
</script>

<style>
</style>