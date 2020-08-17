<template>
	<div class="home">
		<div class="progress">
			<v-progress-linear indeterminate color="primary" :active="isReady"></v-progress-linear>
		</div>
		<div class="dialog">
			<v-row justify="center dialog">
				<v-dialog v-model="dialog.show" max-width="400px">
					<template v-slot:activator="{ on }">
						<v-speed-dial fixed bottom right direction="top" open-on-hover transition>
							<template v-slot:activator>
								<v-btn v-model="fab" color="blue" dark fab>
									<v-icon v-if="fab">mdi-close</v-icon>
									<v-icon v-else>mdi-apps</v-icon>
								</v-btn>
							</template>
							<v-btn fab dark small color="green" v-on="on">
								<v-icon>mdi-pencil</v-icon>
							</v-btn>
							<v-btn fab dark small color="red" @click="fetch">
								<v-icon>mdi-refresh</v-icon>
							</v-btn>
						</v-speed-dial>
					</template>
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
								<v-row v-if="photoUpload">
									<v-text-field
										@click.prevent="chooseImage()"
										clearable
										show-size
										v-model="image.value"
										prepend-icon="mdi-camera"
										accept="image/*"
									></v-text-field>
								</v-row>
							</v-container>
						</v-card-text>
						<v-card-actions>
							<v-spacer></v-spacer>
							<v-btn color="blue darken-1" text @click="submit()">发送</v-btn>
							<v-btn color="blue darken-1" text @click="dialog.show = false">取消</v-btn>
						</v-card-actions>
					</v-card>
				</v-dialog>
			</v-row>
		</div>
		<div class="timeline" v-if="timeline">
			<v-card
				class="ms-auto status mb-4 ml-5 mr-5"
				v-for="(status, index) in timeline"
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
					<v-btn icon @click="reply(status)">
						<v-icon>mdi-comment-account</v-icon>
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
			<v-progress-linear indeterminate color="primary" :active="isLoading"></v-progress-linear>
		</div>
	</div>
</template>
<script>
// @ is an alias to /src

export default {
  data() {
    return {
      isLoading: false,
      isReady: true,
      imageDialog: false,
      photoUpload: true,
      currentImage: "",
      dialog: {
        show: false,
        title: "你在做什么？",
        image: true,
      },
      msg: {
        value: "",
        rules: [(v) => !v || v.length <= 140 || "超过140字:("],
      },
      image: {
        path: "",
        value: "",
      },
      timeline: [],
      status: {
        status: "",
      },
    };
  },
  methods: {
    chooseImage() {
      this.image.path = this.$utools.showOpenDialog({
        filters: [{ name: "image", extensions: ["jpeg", "jpg", "png", "gif"] }],
        properties: ["openFile"],
      })[0];
      this.image.value = this.image.path
        ? this.image.path
            .replace(/\\/g, "/")
            .split("/")
            .pop()
        : "";
    },

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
      this.image.path = "";
      this.image.value = "";
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
    reply(status) {
      this.dialog.show = true;
      this.dialog.title = "回复";
      this.status.in_reply_to_status_id = status.id;
      this.status.in_reply_to_user_id = status.user.unique_id;
      this.msg.value = `@${status.user.screen_name} `;
    },
    async fetch() {
      this.isReady = true;
      try {
        const res = await this.$user.getTimeline({ format: "html" });
        if (res) {
          this.isReady = false;
          this.timeline = res;
          this.goTop();
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
            const res = await this.$user.getTimeline({
              format: "html",
              count: 10,
              max_id: this.timeline[this.timeline.length - 1].id,
            });
            this.timeline = this.timeline.concat(res);
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
  async created() {
    this.fetch()
    this.$utools.onPluginEnter(async ({ code, type, payload }) => {
      if (code == "ff" && type == "over") {
        try {
          await this.$user.postStatus({ status: payload });
          this.$message.success("发送成功");
          this.fetch()
        } catch (e) {
          this.$message.error(e.message);
        }
      }
    });
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
