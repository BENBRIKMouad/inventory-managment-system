<template>
  <div class="Main">
    <div class="flex h-screen w-full transition-all bg-gray-50 ">
    <side-panel></side-panel>
    <employee-panel></employee-panel>
    </div>
  </div>
</template>
 
<script>
// @ is an alias to /src
import SidePanel from '../components/SidePanel.vue';
import EmployeePanel from '../components/employee/EmployeePanel.vue';

export default {
  name: "Employee",
  components:{SidePanel,EmployeePanel}
};
</script>
