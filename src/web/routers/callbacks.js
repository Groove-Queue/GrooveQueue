const { Router } = require("express");
const { API } = require("twitch-utils");

const User = require("../../Mongoose/User");
const router = Router();

const api = new API(
  process.env.TWITCH_CLIENT_ID,
  process.env.TWITCH_CLIENT_SECRET,
  true,
  null,
  null
);

router.get("/twitch", (req, res) => {
  if (req.query.error) return res.redirect("/");
  if (!req.query.code) return res.redirect("/");

  const params = new URLSearchParams();
  params.set("client_id", process.env.TWITCH_CLIENT_ID);
  params.set("client_secret", process.env.TWITCH_CLIENT_SECRET);
  params.set("code", req.query.code);
  params.set("grant_type", "authorization_code");
  params.set("redirect_uri", process.env.TWITCH_REDIRECT_URI);

  fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  })
    .then(async (resp) => {
      if (!resp.ok) return res.redirect("/");
      const { access_token } = await resp.json();

      const userdata = await api.get(
        "users",
        {},
        {
          Authorization: `Bearer ${access_token}`,
        }
      );

      if (typeof userdata == "string") return;
      var user = await User.findOne({ login: userdata.data[0].login });
      var mods = await api.get(
        "moderation/moderators",
        {
          broadcaster_id: userdata.data[0].id,
        },
        {
          Authorization: `Bearer ${access_token}`,
        }
      );

      if (user == null)
        user = await User.create({
          login: userdata.data[0].login,
          id: userdata.data[0].id,
          display: userdata.data[0].display_name,
        });
      else if (!user.id) user.id == userdata.data[0].id;

      if (typeof mods !== "string") {
        mods.data.forEach(async ({ user_login: login, user_name: display }) => {
          const mod = await User.findOne({ login });
          if (!mod) {
            await User.create({
              login,
              display,
              modFor: [`${user.display}`],
            });
          } else if (mod.modFor.indexOf(`${user.display}`) == -1) {
            mod.modFor.push(`${user.display}`);
          }

          return await mod.save();
        });
      }

      await user.save();
      req.session.user = user;

      return res.redirect("/dashboard");
    })
    .catch((_) => {
      return res.redirect("/");
    });
});

router.get("/spotify", async (req, res) => {
  if (req.query.error) return res.redirect("/");
  if (!req.query.code) return res.redirect("/");

  const params = new URLSearchParams();
  params.set("code", req.query.code);
  params.set("redirect_uri", process.env.SPOTIFY_REDIRECT_URI);
  params.set("grant_type", "authorization_code");

  const auth = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  fetch(`https://accounts.spotify.com/api/token`, {
    method: "POST",
    body: params.toString(),
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
  }).then(async (resp) => {
    if (!resp.ok) return res.redirect("/");
    const { access_token, refresh_token } = await resp.json();

    const user = await User.findOne({ login: req.session.user.login });
    user.spoota = access_token;
    user.spootr = refresh_token;

    await user.save();
    req.session.user = user;

    res.redirect("/dashboard");
  });
});

module.exports = router;
