<template>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card class="q-dialog-plugin" style="min-height: 400px;">
      <q-card-section>
        <h5 class="q-ma-none q-pa-md">
          <template v-if="mode === 'user'">
            <span class="text-primary">{{ gitUser }}</span
            >'s Repositories
          </template>
          <template v-else-if="mode === 'random'">
            100 Random Repositories
          </template>
        </h5>

        <q-linear-progress v-if="!userRepositoriesLoaded" indeterminate />

        <q-scroll-area v-else style="height: 400px;">
          <q-list>
            <GitUserRepo
              v-for="repo in userRepositories"
              :key="repo.id"
              :repo="repo"
              @repoSelected="repoSelected"
            />
          </q-list>
        </q-scroll-area>
      </q-card-section>

      <!-- buttons example -->
      <q-card-actions align="right">
        <q-btn
          icon="cancel"
          color="negative"
          label="Cancel"
          @click="onCancelClick"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import GitUserRepo from "./GitUserRepo.vue";

import notifyOnError from "src/mixins/notifyOnError.js";

export default {
  name: "GitUserRepos",
  components: {
    GitUserRepo
  },
  mixins: [notifyOnError],
  props: {
    gitUser: {
      type: String,
      required: true
    },
    mode: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      userRepositories: [],
      userRepositoriesLoaded: false
    };
  },
  methods: {
    show() {
      this.$refs.dialog.show();
    },

    hide() {
      this.$refs.dialog.hide();
    },

    onDialogHide() {
      this.$emit("hide");
    },

    onOKClick(selectedRepoName) {
      this.$emit("ok", selectedRepoName);
      this.hide();
    },

    onCancelClick() {
      this.hide();
    },

    mapRepos(data) {
      return data.map(
        (
          { id, name, html_url, stargazers_count, owner: { login: user } },
          key
        ) => ({
          id,
          name,
          html_url,
          stargazers_count,
          user
        })
      );
    },

    repoSelected({ name, user }) {
      this.onOKClick({ repository: name, user });
    }
  },
  async mounted() {
    try {
      let url;
      switch (this.mode) {
        case "random":
          url = "/repositories";
          break;
        case "user":
          url = `/users/${this.gitUser}/repos`;
          break;
        // Maybe add other options later?

        default:
          url = "/repositories";
      }

      console.log("URL", url);
      const { data } = await this.$axios.get(url);
      this.userRepositories = this.mapRepos(data);
      console.log(this.userRepositories);

      this.userRepositoriesLoaded = true;
    } catch (err) {
      this.notifyOnError(
        "An network error occured or user repositories coult not be loaded."
      );
      this.userRepositoriesLoaded = true;

      // Exit modal
      this.hide();
    }
  }
};
</script>
