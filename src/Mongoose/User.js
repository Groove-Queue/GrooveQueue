const { model, Schema } = require("mongoose");

module.exports = model(
  "Users",
  new Schema({
    login: { type: String, required: true },
    display: { type: String, required: true },
    spoota: { type: String },
    spootr: { type: String },
    id: { type: String },
    modFor: [{ type: String }],
    logs: [{ type: Object }],
    settings: {
      type: Object,
      default: {
        autoAccept: false,
      },
    },
  })
);
