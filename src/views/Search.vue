<template>
  <div class="search">
    <div class="toolbar">
      <v-text-field
        mb-4
        mr-5
        ml-5
        fixed
        v-model="search.value"
        @keyup.enter="searchHandle()"
        append-icon="mdi-magnify"
        @click:append="searchHandle()"
      ></v-text-field>
    </div>
    <div class="progress">
      <v-progress-linear
        indeterminate
        color="primary"
        :active="isReady"
      ></v-progress-linear>
    </div>
    <div class="dialog">
      <v-row justify="center dialog">
        <v-dialog v-model="dialog.show" max-width="400px">
          <v-card>
            <v-card-title color="blue">
              <small>{{ dialog.title }}</small>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-textarea
                    counter
                    prepend-icon="mdi-comment"
                    :rules="msg.rules"
                    v-model="msg.value"
                    auto-grow
                    clearable
                  ></v-textarea>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="submit()">发送</v-btn>
              <v-btn color="blue darken-1" text @click="dialog.show = false"
                >取消</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
    </div>
    <div class="result" v-if="result">
      <v-card
        class="ms-auto status mb-4 ml-5 mr-5"
        v-for="(status, index) in result"
        :index="`menu-item-${index}`"
        :key="`menu-item-${status.id}}`"
      >
        <v-list-item>
          <v-list-item-avatar>
            <v-img :src="status.user.profile_image_url"></v-img>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{ status.user.name }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <div class="d-flex flex-no-wrap justify-space-between">
          <div>
            <v-card-subtitle v-html="status.text"></v-card-subtitle>
          </div>
          <v-avatar
            v-if="status.photo"
            class="mr-4"
            size="125"
            tile
            @click.stop="showImage(status.photo.originurl)"
          >
            <v-img :src="status.photo.originurl"></v-img>
          </v-avatar>
        </div>
        <v-card-actions>
          <span class="fromNow">{{ fromNow(status.created_at) }}</span>
          <v-spacer></v-spacer>
          <v-btn icon @click="repost(status)">
            <v-icon>mdi-comment-arrow-left</v-icon>
          </v-btn>
          <v-btn icon @click="copy(status)">
            <v-icon>mdi-clipboard</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
      <v-dialog v-model="imageDialog" max-width="500px">
        <v-card>
          <v-img :src="currentImage"></v-img>
        </v-card>
      </v-dialog>
    </div>
    <div class="progress">
      <v-progress-linear
        indeterminate
        color="primary"
        :active="isLoading"
      ></v-progress-linear>
    </div>
    <v-btn fixed bottom right dark fab color="blue" @click="goTop()">
      <v-icon>mdi-arrow-up</v-icon>
    </v-btn>
  </div>
</template>

<script>
// @ is an alias to /src

export default {
  data() {
    return {
      isLoading: false,
      isReady: false,
      imageDialog: false,
      currentImage: "",
      dialog: {
        show: false,
      },
      msg: {
        value: "",
        rules: [(v) => !v || v.length <= 140 || "超过140字:("],
      },
      search: {
        value: "",
      },
      result: [],
      status: {
        status: "",
      },
    };
  },
  methods: {
    async submit() {
      this.status.status = this.msg.value;
      try {
        await this.$user.postStatus(this.status);
        this.$message.success("发送成功");
      } catch (e) {
        this.$message.error(e.message);
      }
      this.dialog.show = !this.dialog.show;
      this.photoUpload = true;
      this.msg.value = "";
      this.status = {};
      this.fetch();
      this.goTop();
    },
    repost(status) {
      this.dialog.show = true;
      this.photoUpload = false;
      this.dialog.title = "转发";
      this.status.repost_status_id = status.id;
      this.status.repost_user_id = status.user.unique_id;
      this.msg.value = `转 @${status.user.screen_name} ${status.plain_text} `;
    },
    copy(status){
        this.$utools.copyText(status.plain_text)
        this.$message.success('复制成功')
    },
    async searchHandle() {
      this.isReady = true;
      try {
        const res = await this.$user.search({
          q: this.search.value,
          id: this.$user.id,
          format: "html",
        });
        if (res) {
          this.isReady = false;
          this.result = res;
        }
      } catch (e) {
        this.$message.error(e.message);
      }
    },

    async touchBottom() {
      window.onscroll = async () => {
        let bottomOfWindow =
          document.documentElement.offsetHeight -
            document.documentElement.scrollTop -
            window.innerHeight <=
          200;
        if (bottomOfWindow && this.isLoading == false) {
          this.isLoading = true;
          try {
            const res = await this.$user.search({
              q: this.search.value,
              id: this.$user.id,
              format: "html",
              count: 10,
              max_id: this.result[this.result.length - 1].id,
            });
            this.result = this.result.concat(res);
            this.isLoading = false;
          } catch (e) {
            this.$message.error(e.message);
          }
        }
      };
    },

    goTop() {
      document.body.scrollTop = document.documentElement.scrollTop = 0;
    },
    fromNow(date) {
      return this.$user.formatDate(date);
    },

    showImage(img) {
      this.currentImage = img;
      this.imageDialog = true;
    },
  },
  async mounted() {
    this.touchBottom();
  },
};
</script>
<style scoped>
.status-text {
  font-size: 14px;
  line-height: 1.75em;
  word-spacing: 0.1em;
}
.fromNow {
  font-size: 13px;
  color: #757575;
}
</style>
