<template>
  <div class="Main">
    <div class="flex h-screen w-full transition-all bg-gray-50 ">
    <side-panel></side-panel>
    <os-panel></os-panel>
    </div>
  </div>
</template>
 
<script>
// @ is an alias to /src
import SidePanel from '../components/SidePanel.vue';
import OsPanel from '../components/os/OsPanel.vue';

export default {
  name: "OS",
  components:{SidePanel,OsPanel}
};
</script>

