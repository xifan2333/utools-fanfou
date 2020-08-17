import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Mentions from "../views/Mentions.vue";
import Main from "../views/Main.vue";
import Search from "../views/Search.vue";


Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Main",
    component: Main,
    meta: { isPublic: true },
    children: [
      { path: "/mentions", component: Mentions },
      { path: "/home", component: Home },
      { path: "/search", component: Search },
    ],
  },
];

const router = new VueRouter({
  routes,
});
router.beforeEach((from, to, next) => {
  if (!window.user.isLogin() && !to.meta.isPublic) {
    next("/");
  } else if (window.user.isLogin()) {
    next();
  }
});
export default router;
