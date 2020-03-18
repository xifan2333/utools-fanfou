const moment = require("moment");
const aes = require("./utils/aes");
const fanfou = require("./utils/fanfou");

let _setImmediate = setImmediate;
process.once("loaded", function() {
  global.setImmediate = _setImmediate;
});

utools.db.put({});

window.exports = {
  ffconfig: {
    mode: "list",
    args: {
      enter: (action, callbackSetList) => {
        let result = utools.db.get("config");
        if (result !== null) {
          let { key, secret } = JSON.parse(aes.decrypt(result.config));
          callbackSetList([
            {
              title: "当前配置",
              description: "按输入框提示可更新配置",
              icon: "./images/info.png"
            },
            {
              title: "Consumer key",
              description: key,
              icon: "./images/key.png"
            },
            {
              title: "Consumer secret",
              description: secret,
              icon: "images/secret.png"
            }
          ]);
        } else {
          callbackSetList([
            {
              title: "插件需配置",
              description: "请按输入框提示配置插件",
              icon: "./images/info.png"
            }
          ]);
        }
      },
      search: (action, searchWord, callbackSetList) => {
        let values = searchWord.split(" ");
        let config = {
          key: values[0],
          secret: values[1]
        };
        let { key, secret } = config;
        callbackSetList([
          {
            title: "更新配置",
            description: "实时显示配置信息，请确保配置正确",
            icon: "./images/info.png",
            config: config
          },
          {
            title: "Consumer key",
            description: key,
            icon: "./images/key.png"
          },
          {
            title: "Consumer secret",
            description: secret,
            icon: "./images/secret.png"
          }
        ]);
      },
      select: (action, itemData, callbackSetList) => {
        if (itemData.title == "更新配置") {
          let result = utools.db.get("config");
          if (result == null) {
            utools.db.put({
              _id: "config",
              config: aes.encrypt(itemData.config)
            });
          } else {
            utools.db.put({
              _id: "config",
              config: aes.encrypt(itemData.config),
              _rev: result._rev
            });
          }
          let { key, secret } = JSON.parse(
            aes.decrypt(utools.db.get("config").config)
          );
          callbackSetList([
            {
              title: "配置更新成功",
              description: "按Enter跳转至登录",
              icon: "./images/info.png"
            },
            {
              title: "Consumer key",
              description: key,
              icon: "./images/key.png"
            },
            {
              title: "Consumer secret",
              description: secret,
              icon: "./images/secret.png"
            }
          ]);
        }
        if (itemData.title == "配置更新成功") {
          utools.redirect("fflogin");
        }
      },
      placeholder: "输入Consumer key Consumer secret 以空格分割，确认请按Enter"
    }
  },

  fflogin: {
    mode: "list",
    args: {
      enter: (action, callbackSetList) => {
        let config = utools.db.get("config");
        let result = utools.db.get("profile");
        if (config == null || result == null) {
          callbackSetList([
            {
              title: "插件未配置",
              description: "按Enter跳转至配置",
              icon: "./images/info.png"
            }
          ]);
        }
        if (config && result == null) {
          callbackSetList([
            {
              title: "用户未登录",
              description: "按输入框提示可登录用户",
              icon: "./images/info.png"
            }
          ]);
        }
        if (config && result) {
          let { name, profile_image_url } = JSON.parse(
            aes.decrypt(result.profile)
          );
          callbackSetList([
            {
              title: `当前用户`,
              description: name != "" ? name : "用户未正常登录",
              icon:
                profile_image_url != ""
                  ? profile_image_url
                  : "./images/info.png"
            }
          ]);
        }
      },

      search: (action, searchWord, callbackSetList) => {
        let values = searchWord.split(" ");
        let profile = {
          name: "",
          profile_image_url: "",
          username: values[0],
          password: values[1]
        };
        let { username, password } = profile;
        callbackSetList([
          {
            title: "登录用户",
            description: "实时显示输入信息，请确保用户名及密码正确",
            icon: "./images/info.png",
            profile: profile
          },
          {
            title: "用户名",
            description: username,
            icon: "./images/username.png"
          },
          {
            title: "密码",
            description: password,
            icon: "./images/secret.png"
          }
        ]);
      },

      select: async (action, itemData, callbackSetList) => {
        if (itemData.title == "登录用户") {
          let result = utools.db.get("profile");
          if (result == null) {
            utools.db.put({
              _id: "profile",
              profile: aes.encrypt(itemData.profile)
            });
          } else {
            utools.db.put({
              _id: "profile",
              profile: aes.encrypt(itemData.profile),
              _rev: result._rev
            });
          }
          let { username, password } = JSON.parse(
            aes.decrypt(utools.db.get("profile").profile)
          );
          let { key, secret } = JSON.parse(
            aes.decrypt(utools.db.get("config").config)
          );

          try {
            const profile = await fanfou.login(key, secret, username, password);
            const { _rev } = utools.db.get("profile");
            let profileData = {
              name: profile.name,
              profile_image_url: profile.profile_image_url,
              username: username,
              password: password
            };
            utools.db.put({
              _id: "profile",
              profile: aes.encrypt(profileData),
              _rev: _rev
            });
            callbackSetList([
              {
                title: "登录成功",
                description: "按Enter跳转至发饭",
                icon: "./images/info.png"
              },
              {
                title: "当前用户",
                description: profile.name,
                icon: profile.profile_image_url
              }
            ]);
          } catch (err) {
            callbackSetList([
              {
                title:
                  err.message == "Invalid consumer" ? "配置错误" : "登录失败",
                description:
                  err.message !== "Invalid consumer"
                    ? err.message
                    : "按Enter跳转至配置",
                icon: "./images/info.png"
              }
            ]);
          }
        }
        if (itemData.title == "登录成功") {
          utools.redirect("ff");
        }
        if (itemData.title == "插件未配置" || itemData.title == "配置错误") {
          utools.redirect("ffconfig");
        }
      },
      placeholder: "输入用户名及密码以空格分割，确认请按Enter"
    }
  },

  ff: {
    mode: "list",
    args: {
      enter: async (action, callbackSetList) => {
        let config = utools.db.get("config");
        let profile = utools.db.get("profile");
        if (config == null || profile == null) {
          callbackSetList([
            {
              title: "插件未配置",
              description: "按Enter跳转至配置",
              icon: "./images/info.png"
            }
          ]);
        }
        if (config && profile == null) {
          callbackSetList([
            {
              title: "用户未登录",
              description: "按Enter跳转至登录",
              icon: "./images/info.png"
            }
          ]);
        }
        if (config && profile) {
          let { key, secret } = JSON.parse(aes.decrypt(config.config));
          let { username, password } = JSON.parse(aes.decrypt(profile.profile));
          try {
            const tl = await fanfou.timeline(key, secret, username, password);
            let callbackList = tl.map(item => {
              return {
                title: item.user.name,
                description: item.photo
                  ? `${item.text} [图] ${moment(
                      new Date(item.created_at)
                    ).fromNow()}`
                  : `${item.text} ${moment(
                      new Date(item.created_at)
                    ).fromNow()}`,
                icon: item.user.profile_image_url
              };
            });
            callbackSetList(callbackList);
          } catch (err) {
            let regexp = /[a-zA-Z\s]+/;
            let errType = regexp.test(err.message)
              ? err.message.match(regexp)[0].trim()
              : err.message;
            let title = "";
            let description = "";
            switch (errType) {
              case "Invalid consumer":
                title = "配置错误";
                description = "按Enter跳转至配置";
                break;
              case "xAuth login error":
                title = "登录失败";
                description = `${err.message} 按Enter跳转至登录`;
                break;
              default:
                title = "错误";
                description = `${err.message}`;
                break;
            }
            callbackSetList([
              {
                title: title,
                description: description,
                icon: "./images/info.png"
              }
            ]);
          }
        }
      },
      search: (action, searchWord, callbackSetList) => {
        callbackSetList([
          {
            title: "发送内容",
            description: searchWord,
            icon: "./images/msg.png"
          }
        ]);
      },
      select: async (action, itemData, callbackSetList) => {
        if (itemData.title == "插件未配置" || itemData.title == "配置错误") {
          utools.redirect("ffconfig");
        }
        if (itemData.title == "用户未登录" || itemData.title == "登录失败") {
          utools.redirect("fflogin");
        }
        if (itemData.title == "发送内容") {
          let { username, password } = JSON.parse(
            aes.decrypt(utools.db.get("profile").profile)
          );
          let { key, secret } = JSON.parse(
            aes.decrypt(utools.db.get("config").config)
          );
          try {
            await fanfou.status(key,secret,username,password,itemData.description)
            callbackSetList([{
              title:"发送成功",
              description:"按Enter退出",
              icon:"./images/info.png"
            }])
          } catch (err) {
            callbackSetList([{
              title:"发送失败",
              description:err.message,
              icon:"./images/info.png"
            }])
          }
        }
        if (itemData.title == "发送成功") {
          utools.outPlugin()
        }
      },
      placeholder: "输入发送内容，发送请按Enter"
    }
  }
};
