<template>
  <q-page class="flex flex-center">
    <section class="q-pa-sm">
      <div class="row justify-center q-pt-md">
        <q-img
          id="git-image"
          src="~assets/github-logo.png"
          spinner-color="primary"
        />
      </div>

      <h3>Public Repository File System</h3>

      <GitRepoForm
        :gitUser.sync="gitUser"
        :gitRepo.sync="gitRepo"
        @getNewRepository="getNewRepository"
      />
      <q-linear-progress v-show="!treeLoading" indeterminate />

      <q-card class="q-mb-lg">
        <q-card-section>
          <div class="q-pa-md q-gutter-sm">
            <h5 v-if="gitUser && gitRepo">
              {{ gitUser }} / <span class="text-secondary">{{ gitRepo }}</span>
            </h5>

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
                      `fiv-icon-${getExtension(prop.node.type, prop.node.name)}`
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
                  <a
                    class="cursor-pointer text-secondary"
                    :href="prop.node.html_url"
                    target="_blank"
                    >Visit on GitHub</a
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
import GitRepoForm from "components/GitRepoForm.vue";

export default {
  name: "PageIndex",
  components: {
    GitRepoForm
  },
  data() {
    return {
      treeModel: [],
      treeLoading: false,
      selectedFile: null,
      expanded: [],
      checked: [],

      gitUser: "HouariZegai",
      gitRepo: "Calculator",

      fallbackRepoData: {
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
    getExtension(type, name) {
      if (type === "dir") return "folder";

      return name.split(".").pop();
    },
    async getRepository() {
      if (this.gitRepo === this.fallbackRepoData.gitRepo) return;

      // Reset http states first
      this.treeLoading = false;
      this.error = null;

      try {
        const { data } = await this.$axios.get(this.gitHubEndpoint);
        this.treeModel = this.mapFileData(data);

        this.fallbackRepoData = {
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
      this.$q.notify({
        message,
        color: "negative",
        icon: "error",
        position: "top",
        actions: [
          {
            label: "Dismiss",
            color: "negative",
            handler: () => {
              /* ... */
            }
          }
        ]
      });

      this.gitUser = this.fallbackRepoData.gitUser;
      this.gitRepo = this.fallbackRepoData.gitRepo;
    }
  },
  mounted() {
    this.getRepository();
  }
};
</script>

<style lang="css" scoped>
#git-image {
  background: #1976d2;
  box-shadow: 0 0 12px #1976d2;
  backgorund-size: 50% 50%;
  border-radius: 50%;
  width: 150px;
  height: 150px;
  animation: 4.5s rotate infinite linear;
}

@keyframes rotate {
  0% {
    transform: scale(1);
  }
  10% {
    transform: scale(0.95);
  }
  40% {
    transform: scale(0.9);
  }
  90% {
    transform: scale(0.7) rotate(30deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}
</style>
