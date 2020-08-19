/* eslint-disable no-undef */
const Fanfou = require("fanfou-sdk");
const { encrypt, decrypt } = require("./utils/aes");
const fs = require("fs");
const os = require("os");
var path = require("path");
const moment = require("moment");

moment.locale("zh-cn");

var _setImmediate = setImmediate;
process.once("loaded", function () {
    global.setImmediate = _setImmediate;
});

class User {
    constructor() { }

    getProfile() {
        if (this.isLogin()) {
            const res = utools.db.get("profile");
            res.data.password = decrypt(res.data.password);
            return res;
        }
    }

    setProfile(data) {
        if (this.isLogin()) {
            let res = this.getProfile();
            utools.db.put({ _id: "profile", data: data, _rev: res.rev });
        } else {
            data.password = encrypt(data.password);
            utools.db.put({ _id: "profile", data: data });
        }
    }

    isLogin() {
        return !!utools.db.get("profile");
    }

    async login(username, password) {
        this.username = username;
        this.password = password;
        this.ff = new Fanfou({
            consumerKey: "9b42f123b87294422306c8c8d2747f2d",
            consumerSecret: "d1a11ae0df69466da47c05f4e53ded7f",
            username: this.username,
            password: this.password,
        });

        await this.ff.xauth();
        return this;
    }

    async verify() {
        let res = await this.ff.get("/account/verify_credentials");
        res = {
            name: res.name,
            avatar: res.profile_image_url,
            username: this.username,
            password: this.password,
        };
        return res;
    }

    async postStatus(status) {
        await this.ff.post("/statuses/update", status);
    }

    async postPhoto(photo, status = "") {
        await this.ff.post("/photos/upload", {
            photo: fs.createReadStream(photo),
            status: status,
        });

    }

    async getTimeline(opt) {
        return await this.ff.get("/statuses/home_timeline", opt);
    }

    async getMentions(opt) {
        return await this.ff.get("/statuses/mentions", opt);
    }

    async search(opt) {
        return await this.ff.get("/search/user_timeline", opt);
    }
}

window.user = new User();
window.utools = utools;
let utils = {
    tmpPath:path.join(os.tmpdir(), "utools_fanfou_tmp.png"),
    formatDate(date){
        return moment(new Date(date)).fromNow();
    },
   writeTempPng(photo){
        let base64Reg = /^data:image\/png;base64,(.*)/;
        let base64 = photo.match(base64Reg)[1];
        const imgBuffer = Buffer.from(base64, "base64");
        fs.writeFileSync(utils.tmpPath, imgBuffer);
    }
}
window.utils = utils;
