<template>
  <div class="Main">
    <div class="flex h-screen w-full transition-all bg-gray-50 ">
    <side-panel></side-panel>
    <main-panel></main-panel>
    </div>
  </div>
</template>
 
<script>
// @ is an alias to /src
import SidePanel from '../components/SidePanel.vue';
import MainPanel from '../components/MainPanel.vue';

export default {
  name: "Main",
  components:{SidePanel,MainPanel}
};
</script>

