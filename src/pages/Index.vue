<template>
  <q-page class="flex flex-center">
    <section class="q-pa-sm">
      <GitLogo />

      <h3>Public Repository File System</h3>

      <GitRepoForm
        :gitUser.sync="gitUser"
        :gitRepo.sync="gitRepo"
        @getNewRepository="getNewRepository"
      />

      <div class="q-mb-lg flex items-start">
        <q-btn
          @click="openUserRepositoriesModal('user')"
          class="q-mr-sm"
          color="accent"
          >Get Repositories from this user</q-btn
        >
        <q-btn @click="openUserRepositoriesModal('random')" outline
          >Get random repositories</q-btn
        >
      </div>

      <q-linear-progress v-show="!treeLoading" indeterminate />

      <q-card class="q-mb-lg">
        <q-card-section>
          <div class="q-pa-md q-gutter-sm">
            <h5
              class="q-my-xs"
              v-if="loadedRepoData.gitUser && loadedRepoData.gitRepo"
            >
              {{ loadedRepoData.gitUser }} /
              <span class="text-secondary text-weight-bold">{{
                loadedRepoData.gitRepo
              }}</span>
            </h5>

            <q-separator class="q-my-md" />

            <q-tree
              v-show="treeLoading"
              :nodes="treeModel"
              default-expand-all
              node-key="sha"
              label-key="name"
              @lazy-load="onLazyLoad"
              :selected.sync="selectedFile"
              :expanded.sync="expanded"
              no-connectors
            >
              <!-- :ticked.sync="checked"
              tick-strategy="leaf" -->

              <template v-slot:default-header="prop">
                <div class="row items-center">
                  <span
                    :class="[
                      'q-mr-sm fiv-viv fiv-size-md',
                      `fiv-icon-${getExtensionIcon(
                        prop.node.type,
                        prop.node.name
                      )}`
                    ]"
                  ></span>

                  <div
                    :class="{
                      'text-weight-bold': prop.node.type === 'dir',
                      'text-positive': prop.node.sha === selectedFile
                    }"
                  >
                    {{ prop.node.name }}
                    <small v-if="prop.node.type !== 'dir'"
                      >({{ prop.node.size }})</small
                    >
                  </div>
                </div>
              </template>

              <template v-slot:default-body="prop">
                <div class="q-mt-xs" v-if="prop.node.sha === selectedFile">
                  <SimpleLink :url="prop.node.html_url" new-tab
                    >Visit on GitHub</SimpleLink
                  >
                </div>
              </template>
            </q-tree>
          </div>
        </q-card-section>
      </q-card>
    </section>
  </q-page>
</template>

<script>
import SimpleLink from "components/SimpleLink.vue";

import GitRepoForm from "components/Git/GitRepoForm.vue";
import GitLogo from "components/Git/GitLogo.vue";
import GitUserRepos from "components/Git/GitUserRepos.vue";

import notifyOnError from "src/mixins/notifyOnError.js";

export default {
  name: "PageIndex",
  components: {
    SimpleLink,

    GitRepoForm,
    GitLogo
  },
  mixins: [notifyOnError],
  data() {
    return {
      treeModel: [],
      treeLoading: false,
      selectedFile: null,
      expanded: [],
      checked: [],

      gitUser: "lupsaciprian",
      gitRepo: "Public-Repository-File-System--Quasar-",

      loadedRepoData: {
        gitUser: null,
        gitRepo: null
      }
    };
  },
  computed: {
    gitHubEndpoint: {
      get() {
        return `/repos/${this.gitUser}/${this.gitRepo}/contents/`;
      },
      set(newValue) {}
    }
  },
  methods: {
    async onLazyLoad({ node, key, done, fail }) {
      // call fail() if any error occurs
      if (node.type !== "dir") {
        done([]);
        return;
      }

      try {
        const { data } = await this.$axios.get(this.gitHubEndpoint + node.path);
        const formattedData = this.mapFileData(data);

        done(formattedData);
      } catch (err) {
        this.onError("An error occured when trying to get folder contents.");

        fail();
      }
    },
    mapFileData(data) {
      return data.map(({ type, name, size, path, sha, html_url }) => {
        const standardFileStructure = {
          type,
          name,
          size: `${Math.ceil(size / 1024)} kb`,
          path,
          sha,
          lazy: false,
          html_url
        };

        if (type === "dir")
          return {
            ...standardFileStructure,
            children: [],
            lazy: true
          };
        else return standardFileStructure;
      });
    },
    getExtensionIcon(type, name) {
      if (type === "dir") return "folder";

      return name.split(".").pop();
    },
    async getRepository() {
      if (this.gitRepo === this.loadedRepoData.gitRepo) return;

      // Reset http states first
      this.treeLoading = false;
      this.error = null;

      try {
        const { data } = await this.$axios.get(this.gitHubEndpoint);
        this.treeModel = this.mapFileData(data);

        this.loadedRepoData = {
          gitUser: this.gitUser,
          gitRepo: this.gitRepo
        };

        this.treeLoading = true;
      } catch (err) {
        this.onError(
          "Either a network error occured or the repository doesn't exist"
        );

        this.treeLoading = true;
      }
    },
    getNewRepository() {
      this.gitHubEndpoint = `/repos/${this.gitUser}/${this.gitRepo}/contents/`;
      this.getRepository();
    },
    onError(message) {
      this.notifyOnError(message);

      this.gitUser = this.loadedRepoData.gitUser;
      this.gitRepo = this.loadedRepoData.gitRepo;
    },
    openUserRepositoriesModal(mode) {
      this.$q
        .dialog({
          component: GitUserRepos,
          parent: this,
          gitUser: this.gitUser,
          mode
        })
        .onOk(({ repository, user }) => {
          this.gitRepo = repository;
          this.gitUser = user;
          this.getNewRepository();
        })
        .onCancel(() => {})
        .onDismiss(() => {});
    }
  },
  mounted() {
    this.getRepository();
  }
};
</script>
