const notifyOnError = {
  methods: {
    notifyOnError(message) {
      this.$q.notify({
        message,
        color: "negative",
        icon: "error",
        position: "top"
      });
    }
  }
};

export default notifyOnError;
