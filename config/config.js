const config = {
  production: {
    SECRET: process.env.SECRET,
    DATABASE: process.env.MONGODB_URL,
  },
  default: {
    SECRET: "mysecretkey",
    DATABASE: "mongodb://localhost:27017/",
  },
};

exports.get = function get(env) {
  return config[env] || config.default;
};
