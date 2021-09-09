<template>
  <div class="lg:w-1/6 lg:px-6 px-1 py-2 border-gray-300 border-r flex flex-col justify-between shadow-lg transition-all duration-100">
    <div>
      <button class="h-15 w-15 lg:text-4xl  text-3xl m-5">
        <font-awesome-icon icon="box" class="hover:shadow-lg  transition-all" />
      </button>
      <button
        v-for="tab in tabs"
        :key="tab.title"
        class="
          lg:w-full
          shadow-sm
          flex
          items-center
          py-2
          px-4
          rounded-lg
          hover:bg-blue-50
          hover:text-blue-700
          hover:shadow-md
          mx-auto
          mt-6
          transition-all
        "
        @click="$router.push({ path: tab.path })"
      >
        <font-awesome-icon :icon="tab.icon" class="lg:text-2xl lg:mr-4 " />
        <p class="lg:text-lg font-semibold lg:block hidden antialiased  bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-blue-500 ">{{ tab.title }}</p>
      </button>
    </div>
    <div class="w-full pb-2">
        <div class="flex items-center w-full  lg:rounded-2xl rounded-lg transition-all duration-200">
            <font-awesome-icon icon="user" class="w-12 h-12 rounded-2xl" />
            <div class="ml-4">
              <p class="text-sm font-bold leading-tight lg:block hidden antialiased"> {{user.username}} </p>
            </div>
          
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 ml-auto transition-all duration-200 text-blue-800 bg-gray-200 p-2 rounded-2xl cursor-pointer hover:shadow-inner hover:bg-gray-300" @click="logout" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>

              
        </div>
      </div>
  </div>
</template>

<script>
export default {
  name: "SidePanel",
  data() {
    return {
      tabs: [
        { icon: "laptop", title: "machine",path:"Main" },
        { icon: "layer-group", title: "model",path:"Model" },
        { icon: "laptop-code", title: "os",path:"Os" },
        { icon: "address-card", title: "employé",path:"employee" },
        { icon: "compact-disc", title: "logiciel",path:"Software" },
      ],
    };
  },computed:{
    user(){
      return this.$store.state.user
    }
  },methods:{
    logout(){
      this.$store.commit("updateStorage",{ access:null, refresh:null})
      localStorage.clear() 
      this.$router.push({ name: 'login' })
    }
  }

};
</script>

<style>
</style>