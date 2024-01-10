const User = require("../Mongoose/User");

const auth = Buffer.from(
  `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
).toString("base64");

async function addSong(uri, user) {
  if (!(await isPremium(user)))
    return {
      status: 999,
      message: "The users account doesn't have premium",
    };

  const data = await fetch(
    `https://api.spotify.com/v1/me/player/queue?uri=${encodeURIComponent(uri)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${user.spoota}`,
      },
    }
  );

  if (data.status == 401) {
    const token = await resetToken(user.spootr);
    const temp = await User.findOne({ login: user.login });

    temp.spoota = token;
    await temp.save();
    return addSong(uri, temp);
  }

  if (data.status !== 204) return await data.json();
  else return false;
}

async function isPremium(user) {
  const data = await fetch(`https://api.spotify.com/v1/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${user.spoota}`,
    },
  });

  if (data.status == 401) {
    const token = await resetToken(user.spootr);
    const temp = await User.findOne({ login: user.login });

    temp.spoota = token;
    await temp.save();
    return isPremium(temp);
  }

  const json = await data.json();

  if (json.product == "premium") return true;
  else return false;
}

async function getSongData(id, user) {
  const data = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${user.spoota}`,
    },
  });

  if (data.status == 401) {
    const token = await resetToken(user.spootr);
    const temp = await User.findOne({ login: user.login });

    temp.spoota = token;
    await temp.save();
    return getSongData(id, temp);
  }

  return await data.json();
}

async function resetToken(refresh) {
  const data = await fetch(`https://accounts.spotify.com/api/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refresh,
    }).toString(),
  });

  const json = await data.json();

  return json.access_token;
}

async function acceptSong(id, user, queue) {
  const track = await getSongData(id, user);
  const status = await addSong(track.uri, user);

  if (!status) {
    const songs = queue.toObject().songs;
    delete songs[id];

    await queue.markModified("songs");
    await user.markModified("logs");
    await Queue.updateOne({ login: user.login }, { songs: songs });
    await user.save();
  } else console.log({ status });

  return;
}

module.exports = {
  addSong,
  acceptSong,
  getSongData,
};
