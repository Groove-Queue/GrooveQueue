const { model, Schema } = require("mongoose");

module.exports = model(
  "Queue",
  new Schema({
    login: { type: String, required: true },
    songs: [{ type: Object }],
  })
);
