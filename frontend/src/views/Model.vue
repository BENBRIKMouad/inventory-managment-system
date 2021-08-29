<template>
  <div class="Main">
    <div class="flex h-screen w-full transition-all bg-gray-50 ">
    <side-panel></side-panel>
    <model-panel></model-panel>
    </div>
  </div>
</template>
 
<script>
// @ is an alias to /src
import SidePanel from '../components/SidePanel.vue';
import ModelPanel from '../components/model/ModelPanel.vue';

export default {
  name: "model",
  components:{SidePanel,ModelPanel}
};
</script>

