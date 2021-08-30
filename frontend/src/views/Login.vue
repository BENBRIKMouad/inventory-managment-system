<template>
  <div>
    <p v-if="incorrect">incorect username or password</p>

    <div
      class="relative min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 bg-no-repeat bg-cover"
      style="background-image: url(https://images.unsplash.com/photo-1624916888581-48904076264b?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;ixlib=rb-1.2.1&amp;auto=format&amp;fit=crop&amp;w=750&amp;q=80);"
    >
      <div class="absolute bg-black opacity-60 inset-0 z-0"></div>
      <div class="mt-2 items-center z-10">
        <form
          class="p-14 bg-white max-w-sm mx-auto rounded-xl shadow-xl overflow-hidden space-y-10"
          v-on:submit.prevent="login"
        >
          <h2 class="text-4xl font-bold text-center text-indigo-600">Login</h2>
          <div
            class="f-outline px-2 relative border rounded-lg focus-within:border-indigo-500"
          >
            <input
              type="text"
              name="te"
              placeholder=" "
              v-model="user.username"
              class="block p-2 w-full text-lg appearance-none focus:outline-none bg-transparent"
            />
            <label
              for="Username"
              class="absolute ml-5 left-0 top-0 text-lg text-gray-700 bg-white mt-2 -z-1 duration-300 origin-0"
              >Username</label
            >
          </div>
          <div
            class="f-outline px-2 relative border rounded-lg focus-within:border-indigo-500"
          >
            <input
              type="password"
              name="password"
              placeholder=" "
              v-model="user.password"
              class="block p-2 w-full text-lg appearance-none focus:outline-none bg-transparent"
            />
            <label
              for="password"
              class="absolute ml-5 left-0 top-0 text-lg text-gray-700 bg-white mt-2 -z-1 duration-300 origin-0"
              >Password</label
            >
          </div>
          <div v-if="false" class="block mt-2">
            <label for="" class="flex items-center">
              <input
                type="checkbox"
                class="ml-2 rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />

              <span class="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
          </div>
          <div class="flex items-center justify-center mt-4">
            <a
              v-if="false"
              class="underline text-sm text-gray-600 hover:text-gray-900"
              href="#"
            >
              Forgot Password?
            </a>
            <button
              class="px-6 py-2 ml-4 font-semibold cursor-pointer text-center focus:outline-none transition hover:shadow-lg shadow hover:bg-indigo-700 rounded-full text-white bg-indigo-600 "
            >
              Log in
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "login",
  data() {
    return {
      incorrect: false,
      user: {
        username: "",
        password: "",
      },
    };
  },
  methods: {
     login() {
      this.$store
        .dispatch("userLogin", {
          username: this.user.username,
          password: this.user.password,
        })
        .then(() => {
            console.log("yes")
           this.$router.push({ name: 'Main' })
        })
        .catch((err) => {
          console.log(err);
          console.log("ss");
          this.incorrectAuth = true;
        });
    },
  },
};
</script>

<style scoped>
.f-outline input:focus-within ~ label,
.f-outline input:not(:placeholder-shown) ~ label {
  transform: translateY(-1.5rem) translatex(-1rem) scaleX(0.8) scaleY(0.8);
}
</style>
