<template>
  <div class="Main">
    <div class="flex h-screen w-full transition-all bg-gray-50">
    <side-panel></side-panel>
    <software-panel></software-panel>
    </div>
  </div>
</template>
 
<script>
// @ is an alias to /src
import SidePanel from '../components/SidePanel.vue';
import SoftwarePanel from '../components/software/SoftwarePanel.vue';

export default {
  name: "Model",
  components:{SidePanel,SoftwarePanel}
};
</script>
