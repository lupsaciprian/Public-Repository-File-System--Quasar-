<template>
  <div class="row justify-center q-pt-md">
    <q-img
      id="git-image"
      src="~assets/github-logo.png"
      spinner-color="primary"
    />
  </div>
</template>

<script>
export default {
  name: "GitLogo"
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
