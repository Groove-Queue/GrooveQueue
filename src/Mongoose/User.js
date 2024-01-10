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
    fuck: { type: String, default: genPassword() },
    settings: {
      type: Object,
      default: {
        autoAccept: false,
      },
    },
  })
);

function genPassword() {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var word = "";

  for (let i = 0; i < 30; i++) {
    const f = Math.floor(Math.random() * chars.length);
    word += chars[f];
  }

  return word;
}
