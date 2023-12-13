async function isLive(id, req) {
  const data = await fetch(
    `https://api.twitch.tv/helix/streams?user_id=${id}&type=live`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${req.session.twitch_token}`,
        "Client-Id": process.env.TWITCH_CLIENT_ID,
      },
    }
  );

  if ((data.status = 401)) {
  }
}

module.exports = {};
