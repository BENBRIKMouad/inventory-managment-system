<template>
<div>
 <div v-if="show" class="bg-white shadow rounded-lg p-6">
    <div class="grid lg:grid-cols-2 gap-6">
      <div  v-for="input in inputs" :key="input"  class="border focus-within:border-blue-500 focus-within:text-blue-500 transition-all duration-500 relative rounded p-1">
        <div class="-mt-4 absolute tracking-wider px-1 uppercase text-xs">
          <p>
            <label for="name" class="bg-white text-gray-600 px-1">{{input.label}} *</label>
          </p>
        </div>
        <p>
          <input autocomplete="false" tabindex="0" type="text" class="py-1 px-1 text-gray-900 outline-none block h-full w-full">
        </p>
      </div>
    </div>

    <div class="grid lg:grid-cols-2 gap-6 mt-5">
      <div  v-for="select in selects" :key="select"  class="border focus-within:border-blue-500 focus-within:text-blue-500 transition-all duration-500 relative rounded p-1">
        <div class="-mt-4 absolute tracking-wider px-1 uppercase text-xs">
          <p>
            <label for="name" class="bg-white text-gray-600 px-1">{{select}} *</label>
          </p>
        </div>
        <p>
            <select name="" class="py-1 px-1 text-gray-900 outline-none block h-full w-full">
                <option value="">---</option>
                <option value="volvo">Volvo</option>
            </select>
        </p>
      </div>
    </div>
    <div class="border-t mt-6 pt-3">
      <button @click="close()" class="rounded text-gray-100 px-3 py-1 bg-blue-500 hover:shadow-inner hover:bg-blue-700 transition-all duration-300">
        {{action}}
      </button>
    </div>
  </div>
</div>
   
</template>
<script>
export default {
    name:"addMachine",
    props:["action","show","id"],
        
    data(){
        return {
    
            inputs:[
              {id:"machine",label:"nom de la mchine",value:""},
              {id:"ref",label: "reference",value:""},
              {id:"sn",label:"nombre serial",value:""},
              {id:"stockage",label:"stockage",value:""},
            
            ],
            selects:[
              {id:"model",label:"model",value:""},
              {id:"os",label:"os",value:""},
            ]
        }
    },methods:
    {
      close(){
        console.log(this.action+" "+this.id)
        this.show=false
      }
    }
}
</script>