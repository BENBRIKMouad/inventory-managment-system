<template>
  <div class="w-full h-full py-2 xl:px-8 lg:px-5 px-2 overflow-y-scroll items-center ">
    <Model-search></Model-search>
    <dash-board></dash-board>
    <div class="flex justify-center items-center">
    <Model-table></Model-table>
    </div>
    
  </div>
</template>

<script>
import ModelSearch from "./ModelSearch.vue";
import DashBoard from "../DashBoard.vue";
import ModelTable from "./ModelTable.vue";
export default {
  name: "MainPanel",
  data(){
    return{
      data:null
    }
  },
  components: {
    ModelSearch,
    DashBoard,
    ModelTable,
  },
  mounted () {
  
  }
};
</script>

<style>
</style>