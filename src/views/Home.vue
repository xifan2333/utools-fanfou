<template>
	<div class="home">
		<v-row justify="center dialog">
			<v-dialog v-model="dialog" persistent max-width="400px">
				<template v-slot:activator="{ on }">
					<v-btn fixed dark fab bottom right color="pink" v-on="on">
						<v-icon>mdi-plus</v-icon>
					</v-btn>
				</template>
				<v-card>
					<v-card-title color="blue">
						<small>你在做什么？</small>
					</v-card-title>
					<v-card-text>
						<v-container>
							<v-row>
								<v-textarea
									counter
									prepend-icon="mdi-comment"
									:rules="status.rules"
									v-model="status.value"
									auto-grow
									clearable
								></v-textarea>
							</v-row>
							<v-row>
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
						<v-btn color="blue darken-1" text @click="dialog = false">取消</v-btn>
					</v-card-actions>
				</v-card>
			</v-dialog>
		</v-row>
		<div class="timeline">
			<v-card
				class="ms-auto status ma-4"
				v-for="(status,index) in timeline"
				:index="`menu-item-${index}`"
				:key="`menu-item-${status.id}}`"
			>
				<v-list-item>
					<v-list-item-avatar>
						<v-img :src="status.user.profile_image_url"></v-img>
					</v-list-item-avatar>
					<v-list-item-content>
						<v-list-item-title>{{status.user.name}}</v-list-item-title>
					</v-list-item-content>
				</v-list-item>
				<v-card-text class="status-text" v-html="status.text"></v-card-text>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn icon>
						<v-icon>mdi-heart</v-icon>
					</v-btn>
					<v-btn icon>
						<v-icon>mdi-share-variant</v-icon>
					</v-btn>
				</v-card-actions>
			</v-card>
		</div>
	</div>
</template>

<script>
	// @ is an alias to /src

	export default {
		data() {
			return {
				dialog: false,
				status: {
					value: "",
					rules: [v => !v || v.length <= 140 || "超过140字:("]
				},
				image: {
					path: "",
					value: ""
				},
				timeline: []
			};
		},
		methods: {
			chooseImage() {
				this.image.path = this.$utools.showOpenDialog({
					filters: [
						{ name: "image", extensions: ["jpeg", "jpeg", "png", "gif"] }
					],
					properties: ["openFile"]
				})[0];
				this.image.value = this.image.path
					? this.image.path
							.replace(/\\/g, "/")
							.split("/")
							.pop()
					: "";
			},

			async submit() {
				if (this.image.value) {
					try {
						await this.$user.postPhoto(this.status.value, this.image.path);
						this.$message.success("发送成功");
						this.status.value = "";
						this.image.path = "";
						this.image.value = "";
					} catch (e) {
						console.log(e);
						this.$message.error(e.message);
					}
				} else {
					try {
						await this.$user.postStatus(this.status.value);
						this.$message.success("发送成功");
						this.status.value = "";
					} catch (e) {
						console.log(e);
						this.$message.error(e.message);
					}
				}
			},
			async fetch() {
				try {
					const res = await this.$user.getTimeline({ format: "html" });
					this.timeline = res;
				} catch (e) {
					console.log(e);
					this.$message.error(e.message);
				}
			}
		},
		async created() {
			await this.fetch()
		}
	};
</script>
<style scoped>
	.status-text {
		font-size: 14px;
		line-height: 1.75em;
		word-spacing: 0.1em;
	}
</style>
