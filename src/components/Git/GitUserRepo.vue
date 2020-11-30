<template>
  <q-item clickable @click="repoSelected(repo)">
    <q-item-section>
      <q-item-label class="text-weight-bold">{{ repo.name }}</q-item-label>
      <q-item-label caption lines="2">
        <SimpleLink :url="repo.html_url" new-tab
          >Visit on GitHub</SimpleLink
        ></q-item-label
      >
    </q-item-section>

    <q-item-section side top>
      <div class="flex items-center">
        <small class="q-mr-xs">{{ repo.stargazers_count }}</small>
        <q-icon dense name="star" color="yellow" />
      </div>
    </q-item-section>
  </q-item>
</template>

<script>
import SimpleLink from "../SimpleLink.vue";

export default {
  name: "GitUserRepo",
  components: {
    SimpleLink
  },
  props: {
    repo: Object
  },
  methods: {
    repoSelected(repo) {
      this.$emit("repoSelected", repo);
    }
  }
};
</script>
