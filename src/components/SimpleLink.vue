<template>
  <a class="cursor-pointer text-secondary" :href="url" :target="newTab"
    ><slot>{{ url }}</slot></a
  >
</template>

<script>
export default {
  name: "SimpleLink",
  props: {
    url: { type: String, required: true },
    newTab: {
      type: Boolean,
      default: false
    }
  }
};
</script>
