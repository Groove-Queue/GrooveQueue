const { Router } = require("express");
const User = require("../../Mongoose/User");

const router = Router();

router.post("/:user", async (req, res) => {
  const { pswd } = req.body;
  delete req.body.pswd;

  const user = await User.findOne({ login: req.params.user });

  if (user.fuck !== pswd) return res.end();

  console.log({ body: req.body });

  if (user.settings.autoAccept && !("accept" in req.body)) {
    user.settings.autoAccept = false;
  }

  if ("accept" in req.body) {
    user.settings.autoAccept = true;
  }

  user.markModified("settings");
  await user.save();

  res.redirect(`/dashboard/${req.params.user}`);
});

module.exports = router;
