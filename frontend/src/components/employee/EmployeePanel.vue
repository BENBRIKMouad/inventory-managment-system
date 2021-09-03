<template>
   <div class="w-full h-full py-2 xl:px-8 lg:px-5 px-2 overflow-y-scroll items-center ">
    <employee-search></employee-search>
    <dash-board></dash-board>
    <div class="">
      <employee-table></employee-table>
    </div>
  </div>
</template>

<script>
import EmployeeTable from "./EmployeeTable.vue";
import EmployeeSearch from "./EmployeeSearch.vue";
import DashBoard from "../DashBoard.vue";
export default {
  name: "MainPanel",
  data() {
    return {
      data: null,
    };
  },
  components: {
    EmployeeTable,
    EmployeeSearch,
    DashBoard,
  },
  mounted() {},
};
</script>

<style>
</style>