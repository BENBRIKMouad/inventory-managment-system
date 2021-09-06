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
    <software-search></software-search>
    <dash-board></dash-board>
    <div class="">
      <software-table></software-table>
    </div>
  </div>
</template>

<script>
import SoftwareTable from "./SoftwareTable.vue";
import SoftwareSearch from "./SoftwareSearch.vue";
import DashBoard from "../DashBoard.vue";
export default {
  name: "MainPanel",
  data() {
    return {
      data: null,
    };
  },
  components: {
    SoftwareTable,
    DashBoard,
    SoftwareSearch,
  },
  mounted() {},
};
</script>

<style></style>
