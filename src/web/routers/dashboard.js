const { Router } = require("express");
const Queue = require("../../Mongoose/Queue");
const { addSong, getSongData } = require("../../API/Spotify");
const User = require("../../Mongoose/User");
const { API } = require("twitch-utils");

const api = new API(
  process.env.TWITCH_CLIENT_ID,
  process.env.TWITCH_CLIENT_SECRET,
  true,
  null,
  null
);

const router = Router();

function check(req, res, next) {
  if (!req.session.user) return res.redirect("/login/twitch");

  return next();
}

router
  .get("/", check, (req, res) => {
    res.render("dashboard", { user: req.session.user });
  })
  .get("/:login", check, async (req, res) => {
    var queue = await Queue.findOne({ login: req.params.login });
    const user = await User.findOne({ login: req.params.login });
    const logs = [];

    user.logs.forEach((log) => logs.push(`${log.user} ${log.message}`));
    if (queue == null)
      queue = await Queue.create({ login: user.login, songs: {} });
    return res.render("user", { user, queue, logs });
  })
  .post("/:login", check, async (req, res) => {
    var queue = await Queue.findOne({ login: req.params.login });
    const user = await User.findOne({ login: queue.login });

    var test = await api.get(
      "streams",
      {
        type: "live",
        user_id: user.id,
      },
      {
        Authorization: `Bearer ${req.session.twitch_token}`,
      }
    );

    if (typeof test == "string") {
      req.session.twitch_token = await api.resetToken(
        req.session.twitch_refresh,
        true
      );

      test = await api.get(
        "streams",
        {
          type: "live",
          user_id: user.id,
        },
        {
          Authorization: `Bearer ${req.session.twitch_token}`,
        }
      );
    }

    // if (test.data.length < 0)
    //   return res.redirect(`/dashboard/${req.params.login}`);

    if ("accept" in req.body) {
      user.logs.push({
        user: req.session.user.display,
        message: `accepted the song ${req.body.song} that was requested by ${req.body.name}`,
      });

      const songData = await getSongData(queue.songs[req.body.accept].id, user);
      const status = await addSong(songData.uri, user);

      if (!status) {
        const songs = queue.toObject().songs;
        const success = await delete songs[req.body.accept];

        await queue.markModified("songs");
        await user.markModified("logs");
        await Queue.updateOne({ login: user.login }, { songs: songs });
        await user.save();
      } else console.log({ status });
    } else {
      user.logs.push({
        user: req.session.user.display,
        message: `declined the song ${req.body.song} that was requested by ${req.body.name}`,
      });

      const songs = queue.toObject().songs;
      const success = await delete songs[req.body.reject];

      await queue.markModified("songs");
      await user.markModified("logs");
      await Queue.updateOne({ login: user.login }, { songs: songs });
      await user.save();
    }

    req.session.user = user;

    res.redirect(`/dashboard/${req.params.login}`);
  });

module.exports = router;
