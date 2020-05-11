<template>
	<div id="msg">
		<v-snackbar v-model="show" :color="type" top  class="v-application" timeout=1500>
			<span><v-icon color="white" dense style="margin-right:1em">{{icon}}</v-icon>
			{{msg}}</span>
		</v-snackbar>
	</div>
</template>

<script>
	export default {
		name: "Message",
		
		props: {
			msg: String,
			type: String
		},
	};
</script>

<style>
</style>