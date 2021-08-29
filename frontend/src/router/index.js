import Vue from "vue";
import VueRouter from "vue-router";
import Main from "@/views/Main.vue";
Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "iMain",
    props: true,
    component: Main,
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
