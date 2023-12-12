const { Router } = require("express");

const router = Router();

function check(req, res, next) {
  if (!req.session.user) return res.redirect("/login/twitch");

  return next();
}

router
  .get("/", check, (req, res) => {
    res.render("dashboard", { user: req.session.user });
  })
  .get("/:login", check, (req, res) => {
    res.render("user", { user: req.session.user });
  });

module.exports = router;
