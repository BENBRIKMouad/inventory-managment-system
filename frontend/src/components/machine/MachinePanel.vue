<template>
  <div class="w-full h-full py-2 xl:px-8 lg:px-5 px-2 overflow-y-scroll items-center ">
    <machine-search></machine-search>
    <dash-board></dash-board>
    <machine-table></machine-table>
  </div>
</template>

<script>
import MachineSearch from "./MachineSearch.vue";
import DashBoard from "../DashBoard.vue";
import MachineTable from "./MachineTable.vue";
export default {
  name: "MainPanel",
  data(){
    return{
      data:null
    }
  },
  components: {
    MachineSearch,
    DashBoard,
    MachineTable,
  },
  mounted () {
  
  }
};
</script>

<style>
</style>