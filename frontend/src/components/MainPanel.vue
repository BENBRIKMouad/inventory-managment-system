<template>
  <div class="w-full h-full py-2 xl:px-8 lg:px-5 px-2 overflow-y-scroll items-center ">
    <search-bar></search-bar>
    <dash-board></dash-board >
    <div class="flex justify-center items-center">
    <data-table :data="data"></data-table>
    </div>
    
  </div>
</template>

<script>
import SearchBar from "./SearchBar.vue";
import DashBoard from "./DashBoard.vue";
import DataTable from "./DataTable.vue";
export default {
  name: "MainPanel",
  data(){
    return{
      data:null
    }
  },
  components: {
    SearchBar,
    DashBoard,
    DataTable,
  },
  mounted () {
  
  }
};
</script>

<style>
</style>