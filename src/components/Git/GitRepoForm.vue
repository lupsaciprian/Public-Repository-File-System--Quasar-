<template>
  <div>
    <q-toggle
      v-model="formVisible"
      label="Show Repository Configuration"
      class="q-mb-md"
    />

    <q-slide-transition>
      <div v-show="formVisible" class="q-mb-lg">
        <q-form ref="repositoryForm" @submit="onSubmit" class="q-gutter-md">
          <q-input
            filled
            :value="gitUser"
            @input="$emit('update:gitUser', $event)"
            label="Github User *"
            lazy-rules
            :rules="[
              val => (val && val.length > 0) || 'Github user cannot be empty.'
            ]"
          />

          <q-input
            filled
            :value="gitRepo"
            @input="$emit('update:gitRepo', $event)"
            label="Repository *"
            lazy-rules
            :rules="[
              val => (val && val.length > 0) || 'Repository cannot be empty.'
            ]"
          />

          <div>
            <q-btn
              icon="cloud_download"
              class="full-width"
              label="Get Repository"
              type="submit"
              color="primary"
            />
          </div>
        </q-form>
      </div>
    </q-slide-transition>
  </div>
</template>

<script>
export default {
  props: {
    gitUser: {
      type: String,
      required: true
    },
    gitRepo: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      formVisible: true
    };
  },

  methods: {
    onSubmit() {
      this.$refs.repositoryForm.validate().then(success => {
        if (success) {
          this.$emit("getNewRepository");
        }
      });
    }
  }
};
</script>
