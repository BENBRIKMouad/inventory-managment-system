import Vue from "vue";
import VueRouter from "vue-router";
import Main from "@/views/Main.vue";
import Model from "@/views/Model.vue";
import Os from "@/views/Os.vue";
import Login from "@/views/Login.vue";
import store from "../store";
Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Main",
    props: true,
    component: Main,
    meta: {
      requiresLogin: true,
    },
  },
  {
    path: "/model",
    name: "Model",
    props: true,
    component: Model,
    meta: {
      requiresLogin: true,
    },
  },
  {
    path: "/Os",
    name: "Os",
    props: true,
    component: Os,
    meta: {
      requiresLogin: true,
    },
  },
  {
    path: "/login",
    name: "login",
    props: true,
    component: Login,
  },
  {
    path: "*",
    redirect: "/",
  },
];

const router = new VueRouter({
  
  routes,
});
router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresLogin)) {
    if (!store.getters.loggedIn) {
      next({ name: "login" });
    } else {
      store
        .dispatch("verifyToken", { token: store.state.accessToken })
        .then(() => {
          console.log("verify");
          next();
        })
        .catch((err) => {
          store
            .dispatch("refreshToken", { token: store.state.refreshToken })
            .then(() => {
              console.log("refresh");
              next();
            })
            .catch((err) => {
              console.log(err);
              next({ name: "login" });
            });
        });
    }
  } else {
    next();
  }
});

export default router;
