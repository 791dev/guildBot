const config = require('./config');
const { Events } = require("discord.js");
const { yktClient } = require('./ykt_client');
const { joinVoiceChannel } = require('@discordjs/voice');
const fetch = require('node-fetch');
const client = new yktClient();
const delay = ms => new Promise(res => setTimeout(res, ms));
const { EmbedBuilder } = require("discord.js");
const moment = require("moment");


async function fetchUserData(userId) {
  let attempts = 0;

  while (attempts < 5) { // En fazla 5 kez dene
    try {
      const response = await fetch(`https://discord.com/api/v9/users/${userId}`, {
        headers: { Authorization: `Bot ${config.token}` }
      });

      if (response.status === 429) {
        const data = await response.json();
        const retryAfter = data.retry_after || 2; // saniye cinsinden
        console.warn(`⏳ ${userId} rate limit yedi! ${retryAfter}s sonra tekrar denenecek...`);
        await delay(retryAfter * 1000);
        attempts++;
        continue; // aynı kullanıcıya tekrar dene
      }

      if (!response.ok) {
        console.warn(`⚠️ ${userId} - API HTTP ${response.status}`);
        return null;
      }

      return await response.json();

    } catch (err) {
      console.warn(`❌ ${userId} veri alınamadı (deneme ${attempts + 1}): ${err.message}`);
      await delay(1000);
      attempts++;
    }
  }

  console.warn(`❌ ${userId} kullanıcı için 5 deneme başarısız oldu.`);
  return null;
}

async function sendEmbed(member, userId, logChannel, msg) {
  const embed = new EmbedBuilder()
    .setColor("Green")
    .setDescription(`${msg} <@${userId}>`)
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setFooter({
      text: moment().format("HH:mm:ss - DD/MM/YYYY"),
      iconURL: client.user.displayAvatarURL()
    });

  await logChannel.send({ embeds: [embed] });
}

async function checkerEvnt() {
  const guild = client.guilds.cache.get(config.guildID);
  if (!guild) return console.warn("🔴 Sunucu bulunamadı!");

  const logChannel = guild.channels.cache.get(config.logChannel);
  if (!logChannel || !logChannel.isTextBased()) {
    console.warn("⚠️ Log kanalı geçerli değil veya mesaj atılamıyor.");
  }

  try {
    const members = await guild.members.fetch();
    for (const [_, member] of members) {
      const userId = member.id;
      const data = await fetchUserData(userId);
      if (!data) continue;

      const identityGuildId = data?.primary_guild?.identity_guild_id;
      const isInThisGuild = identityGuildId === config.guildID;
      const hasFamilyRole = member.roles.cache.has(config.familyRole);

      if (config.debug) {
        console.log(`👤 ${userId} | Primary Guild ID: ${identityGuildId ?? 'Yok'}`);
      }

      if (isInThisGuild && !hasFamilyRole) {
        await member.roles.add(config.familyRole).then(async () => {
          if (config.debug) {
            console.log(`✅ ${userId} kullanıcısına aile rolü verildi.`);
          }

          if (logChannel) {
            sendEmbed(member, userId, logChannel, "Kullanıcıya aile rolü verild:")
          }

        }).catch(err => {
          console.warn(`⚠️ ${userId} rol verilemedi: ${err.message}`);
        });
      }

      if (!isInThisGuild && hasFamilyRole) {
        await member.roles.remove(config.familyRole).then(() => {
          if (config.debug) {
            console.log(`❌ ${userId} kullanıcısından aile rolü alındı.`);
          }
          sendEmbed(member, userId, logChannel, "Kullanıcıdan aile rolü geri alındı:")
        }).catch(err => {
          console.warn(`⚠️ ${userId} rol alınamadı: ${err.message}`);
        });
      }

      await delay(config.timeout);
    }
  } catch (err) {
    console.error("❌ Üyeler alınırken hata oluştu:", err);
  }
}

client.login(config.token).catch(err => {
  console.error(`🔴 Bot Giriş Yapamadı / Sebep: ${err}`);
});

client.on(Events.ClientReady, async () => {
  console.log(`🟢 ${client.user.tag} Başarıyla Giriş Yaptı!`);

  checkerEvnt();
  setInterval(checkerEvnt, config.dailyTimeout * 60 * 60 * 1000);

  const guild = client.guilds.cache.get(config.guildID);
  if (!guild) return;

  const Channel = global.Voice = guild.channels.cache.get(config.channel);
  if (!Channel) return console.error("🔴 Kanal Bulunamadı!");

  client.voiceConnection = joinVoiceChannel({
    channelId: Channel.id,
    guildId: Channel.guild.id,
    adapterCreator: Channel.guild.voiceAdapterCreator,
    group: client.user.id
  });

  if (!Channel.hasStaff()) {
    await client.start(config.channel);
  } else {
    client.staffJoined = true;
    client.playing = false;
    await client.start(config.channel);
  }
});

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  const guild = client.guilds.cache.get(config.guildID);
  if (!guild) return;
  const Channel = guild.channels.cache.get(config.channel);
  if (!Channel) return;

  if (oldState.member.id === client.user.id && oldState.channelId && !newState.channelId) {
    client.voiceConnection = joinVoiceChannel({
      channelId: Channel.id,
      guildId: Channel.guild.id,
      adapterCreator: Channel.guild.voiceAdapterCreator,
      group: client.user.id
    });
  }
});
