<template>
  <div class="Main">
    <div class="flex h-screen w-full transition-all bg-gray-50 ">
    <side-panel></side-panel>
    <machine-panel></machine-panel>
    </div>
  </div>
</template>
 
<script>
// @ is an alias to /src
import SidePanel from '../components/SidePanel.vue';
import MachinePanel from '../components/machine/MachinePanel.vue';

export default {
  name: "Main",
  components:{SidePanel,MachinePanel}
};
</script>

