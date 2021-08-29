import Vue from "vue";
import VueRouter from "vue-router";
import Main from "@/views/Main.vue";
import model from "@/views/Model.vue";
Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Main",
    props: true,
    component: Main,
  },
  {
    path: "/model",
    name: "Model",
    props: true,
    component: model,
  },
  {
    path: "*",
    redirect: "/",
  },
];

const router = new VueRouter({
  mode: "history",
  routes,
});

export default router;
