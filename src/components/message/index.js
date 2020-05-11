import Message from "./message.vue";
const message = {
  install(Vue) {
    const constructor = Vue.extend(Message);
    const plugin = new constructor({
      el: document.createElement("div"),
      data() {
        return {
          type: "",
          msg: "",
          show: false,
        };
      },
      computed: {
        icon() {
          switch (this.type) {
            case "info":
              return "mdi-information-outline";
            case "error":
              return "mdi-alert-circle-outline";
            case "success":
              return "mdi-checkbox-marked-circle-outline";
            default:
              break;
          }
        },
      },
    });
    document.body.appendChild(plugin.$el);

    const types = ["info", "success", "error"];
    Vue.prototype.$message = plugin;
    for (let type of types) {
      Vue.prototype.$message[type] = (msg) => {
        plugin.show = true;
        plugin.type = type;
        plugin.msg = msg;
      };
    }
  },
};

export default message;
