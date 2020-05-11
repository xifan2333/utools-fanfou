<template>
	<div id="main">
		<v-app ref='app'>
			<v-container>
				<v-row>
					<v-col cols="1">
						<v-navigation-drawer :mini-variant="miniVariant" permanent fixed>
							<v-list>
								<v-list-item class="px-2">
									<v-list-item-avatar>
										<v-img :src="user.avatar"></v-img>
									</v-list-item-avatar>
									<v-list-item-title>{{user.name}}</v-list-item-title>
									<v-btn small color="primary" @click="sheet=!sheet">{{btn}}</v-btn>
								</v-list-item>
							</v-list>

							<v-divider></v-divider>

							<v-list nav dense>
								<v-list-item link @click="to('/home')">
									<v-list-item-icon>
										<v-badge color="primary" dot :value="timelineUpdated">
											<v-icon>mdi-home</v-icon>
										</v-badge>
									</v-list-item-icon>
									<v-list-item-title>主页</v-list-item-title>
								</v-list-item>
								<v-list-item link @click="to('/mentions')">
									<v-list-item-icon>
										<v-badge color="primary" dot :value="mentionsUpdated">
											<v-icon>mdi-at</v-icon>
										</v-badge>
									</v-list-item-icon>
									<v-list-item-title>提到我的</v-list-item-title>
								</v-list-item>
								<v-list-item link @click="to('/tags')">
									<v-list-item-icon>
										<v-icon>mdi-tag</v-icon>
									</v-list-item-icon>
									<v-list-item-title>标签管理</v-list-item-title>
								</v-list-item>
								<v-list-item link @click="to('/search')">
									<v-list-item-icon>
										<v-icon>mdi-magnify</v-icon>
									</v-list-item-icon>
									<v-list-item-title>搜索</v-list-item-title>
								</v-list-item>
							</v-list>
							<v-list nav dense class="menu" v-show="!minaVariant">
								<v-list-item link @click="miniVariant = !miniVariant" class="menu-item">
									<v-list-item-icon>
										<v-icon>mdi-menu</v-icon>
									</v-list-item-icon>
									<v-list-item-title>菜单</v-list-item-title>
								</v-list-item>
							</v-list>
						</v-navigation-drawer>
					</v-col>
					<v-col cols="11">
						<v-content>
							<router-view :key="$route.path" />
						</v-content>
					</v-col>
				</v-row>
				<v-row>
					<v-col cols="12">
						<v-bottom-sheet v-model="sheet">
							<v-sheet class="text-center" height="200px" mr-10>
								<v-form ref="form">
									<v-text-field v-model="user.username" label="用户名" required></v-text-field>
									<v-text-field v-model="user.password" label="密码" required type="password"></v-text-field>
									<v-btn color="success" class="mr-4" @click="loginSubmit">登录</v-btn>
									<v-btn color="error" class="mr-4" @click="loginCancel">取消</v-btn>
								</v-form>
							</v-sheet>
						</v-bottom-sheet>
					</v-col>
				</v-row>
			</v-container>
		</v-app>
	</div>
</template>

<script>
	export default {
		name: "App",
		data() {
			return {
				user: {
					name: "未登录",
					avatar: "http://images.xifan.fun/App-2020-05-07-12-08-02.png",
					username: "",
					password: ""
				},
				sheet: false,
				btn: "登录",
				miniVariant: true,
				mentionsUpdated: false,
				timelineUpdated: false
			};
		},
		methods: {
			loginCancel() {
				this.sheet = false;
			},
			async loginSubmit() {
				try {
					await this.$user.login(this.user.username, this.user.password);
					const res = await this.$user.verify();
					this.$user.setProfile(res);
					const profile = this.$user.getProfile().data;
					this.$message.success("登录成功");
					this.user = profile;
					this.sheet = !this.sheet;
					this.miniVariant = true;
					this.btn = "切换账号";
					this.user.username = "";
					this.user.password = "";
					this.$router.push("/home");
				} catch (e) {
					console.log(e)
					this.$message.error("用户名或密码错误");
				}
			},
			to(path) {
				if (this.$route.path != path) {
					this.$router.push(path);
				}
				this.miniVariant = true;
			}
		},
	async created() {
			this.$utools.onPluginReady(async () => {
				if (this.$user.isLogin()) {
					const res =this.$user.getProfile();
					this.user = res.data;
					this.$user = await this.$user.login(this.user.username,this.user.password )
					this.btn = "切换账号";
					this.user.username = "";
					this.user.password = "";
					this.$router.push("/home");
				} else {
					this.$message.info('用户未登录，请登录')
					this.sheet = !this.sheet
				}
			});
		}
	};
</script>

<style scoped>
	.menu-item {
		position: absolute;
		bottom: 10px;
	}
</style>
