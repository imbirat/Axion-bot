const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const cron = require('node-cron');
const Notification = require('../models/Notification');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

const youtubeCache = new Map();
const twitchCache = new Map();

async function checkNotifications(client) {
  try {
    const configs = await Notification.find({ enabled: true });

    for (const config of configs) {
      try {
        const guild = client.guilds.cache.get(config.guildId);
        if (!guild) continue;

        const channel = guild.channels.cache.get(config.channelId);
        if (!channel) continue;

        let result = null;

        if (config.type === 'youtube') {
          result = await checkYouTube(config);
        } else if (config.type === 'twitch') {
          result = await checkTwitch(config);
        }

        if (result && result.isNew) {
          const embed = new EmbedBuilder()
            .setColor(config.type === 'youtube' ? 0xFF0000 : 0x9146FF)
            .setTitle(config.type === 'youtube' ? '📹 New YouTube Video' : '🔴 Twitch Live')
            .setURL(result.url)
            .setDescription(
              config.message
                .replace('{channel}', result.channelName)
                .replace('{title}', result.title)
                .replace('{url}', result.url)
            )
            .setTimestamp();

          if (result.thumbnail) {
            embed.setImage(result.thumbnail);
          }
          if (result.avatar) {
            embed.setThumbnail(result.avatar);
          }

          await channel.send({ embeds: [embed] });
        }

        config.lastChecked = new Date();
        await config.save();
      } catch (err) {
        console.error(`Notification check error for ${config._id}:`, err.message);
      }
    }
  } catch (error) {
    console.error('checkNotifications error:', error);
  }
}

async function checkYouTube(config) {
  if (!YOUTUBE_API_KEY) return null;

  const cacheKey = `youtube_${config.targetId}`;
  const cached = youtubeCache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < 300000) {
    return cached.needsNotification ? cached.result : null;
  }

  try {
    const res = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        channelId: config.targetId,
        order: 'date',
        maxResults: 1,
        type: 'video',
        key: YOUTUBE_API_KEY,
      },
      timeout: 10000,
    });

    const items = res.data?.items;
    if (!items || items.length === 0) {
      youtubeCache.set(cacheKey, { timestamp: now, needsNotification: false, result: null });
      return null;
    }

    const video = items[0];
    const videoId = video.id?.videoId;
    const publishedAt = new Date(video.snippet.publishedAt).getTime();

    let isNew = false;
    if (config.lastChecked) {
      isNew = publishedAt > config.lastChecked.getTime();
    } else {
      isNew = true;
    }

    if (!videoId) return null;

    const result = {
      isNew,
      title: video.snippet.title,
      channelName: video.snippet.channelTitle,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnail: video.snippet.thumbnails?.maxres?.url || video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.default?.url,
      avatar: video.snippet.thumbnails?.default?.url,
      publishedAt,
    };

    youtubeCache.set(cacheKey, { timestamp: now, needsNotification: isNew, result });

    if (isNew) {
      setTimeout(() => youtubeCache.delete(cacheKey), 600000);
    }

    return result;
  } catch (error) {
    if (error.response?.status === 403) {
      console.error('YouTube API: Invalid or quota-exceeded API key');
    }
    youtubeCache.set(cacheKey, { timestamp: now, needsNotification: false, result: null });
    return null;
  }
}

async function checkTwitch(config) {
  if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) return null;

  const cacheKey = `twitch_${config.targetId}`;
  const cached = twitchCache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < 120000) {
    return cached.isLive ? cached.result : null;
  }

  try {
    const tokenRes = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        client_id: TWITCH_CLIENT_ID,
        client_secret: TWITCH_CLIENT_SECRET,
        grant_type: 'client_credentials',
      },
      timeout: 10000,
    });

    const accessToken = tokenRes.data.access_token;

    const streamRes = await axios.get('https://api.twitch.tv/helix/streams', {
      params: { user_login: config.targetId },
      headers: {
        'Client-ID': TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${accessToken}`,
      },
      timeout: 10000,
    });

    const streams = streamRes.data?.data;
    const isLive = streams && streams.length > 0;

    if (isLive) {
      const stream = streams[0];
      const startedAt = new Date(stream.started_at).getTime();

      const userRes = await axios.get('https://api.twitch.tv/helix/users', {
        params: { login: config.targetId },
        headers: {
          'Client-ID': TWITCH_CLIENT_ID,
          'Authorization': `Bearer ${accessToken}`,
        },
        timeout: 10000,
      });

      const userData = userRes.data?.data?.[0];

      let wasLive = false;
      if (config.lastChecked) {
        wasLive = startedAt < config.lastChecked.getTime();
      }

      const result = {
        isNew: !wasLive,
        title: stream.title,
        channelName: config.targetId,
        url: `https://twitch.tv/${config.targetId}`,
        thumbnail: stream.thumbnail_url?.replace('{width}', '640').replace('{height}', '360'),
        avatar: userData?.profile_image_url,
        game: stream.game_name,
        startedAt,
      };

      twitchCache.set(cacheKey, { timestamp: now, isLive: true, result });

      return result;
    }

    twitchCache.set(cacheKey, { timestamp: now, isLive: false, result: null });
    return null;
  } catch (error) {
    console.error(`Twitch check error for ${config.targetId}:`, error.message);
    twitchCache.set(cacheKey, { timestamp: now, isLive: false, result: null });
    return null;
  }
}

function startCron(client) {
  cron.schedule('*/5 * * * *', () => {
    checkNotifications(client);
  });
  console.log('[Notifications] Cron started (every 5 minutes)');
}

module.exports = { checkNotifications, checkYouTube, checkTwitch, startCron };
