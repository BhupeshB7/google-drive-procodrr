export const ESSENTIAL_Q_OPTIONS = {
  removeOnComplete: true,
  removeOnFail: true,
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 5000,
  },
};
