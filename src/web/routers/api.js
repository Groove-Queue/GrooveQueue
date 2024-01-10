const { Router } = require("express");
const User = require("../../Mongoose/User");
const Queue = require("../../Mongoose/Queue");
const { getSongData, acceptSong } = require("../../API/Spotify");

const router = Router();

const limiter = {};

router.get("/user/:username", async (req, res) => {
  const user = await User.findOne({ login: req.params.username });

  if (user == null) return res.end("false");
  else return res.end("true");
});

router.post("/song", async (req, res) => {
  const { name, streamer: stream, id } = req.body;

  const queue = await Queue.findOne({ login: stream.toLowerCase() });
  if (queue == null) return res.end();

  const user = await User.findOne({ login: name.toLowerCase() });
  if (user == null) return res.end();

  const streamer = await User.findOne({ login: stream.toLowerCase() });
  if (streamer == null) return res.end();

  if (limiter[user.login]) {
    if (limiter[user.login] > Date.now()) return res.end();
    else limiter[user.login] = Date.now() + 60_000;
  } else limiter[user.login] = Date.now() + 60_000;

  const track = await getSongData(id, user);

  if (streamer.settings.autoAccept) {
    await acceptSong(id, streamer, queue);

    streamer.logs.push({
      user: "Auto Accept",
      message: `accepted the song ${track.name} that was requested by ${user.display}`,
    });

    res.end();
  } else {
    queue.songs[id] = {
      user: name,
      song: track.name,
      id,
    };
    queue.markModified("songs");
    await queue.save();

    res.end();
  }
});

setInterval(() => {
  Object.keys(limiter).forEach((k) => {
    if (Date.now() - limiter[k] > 120_000) delete limiter[k];
  });
}, 20_000);

module.exports = router;
