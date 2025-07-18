const {
  Client,
  VoiceChannel,
  GuildMember,
  PermissionFlagsBits,
  GatewayIntentBits,
  Partials,
  ActivityType,
  Events
} = require('discord.js');
const conf = require('./config.js');

class yktClient extends Client {
  constructor(options) {
    super({
      options,
      intents: Object.keys(GatewayIntentBits),
      partials: Object.keys(Partials),
      presence: {
        activities: [{
          name: conf?.presence?.[0] || "YKT",
          type: ActivityType.Watching,
          url: "https://discord.gg/temeria"
        }],
        status: 'dnd'
      }
    });

    this.channelId = null;
    this.staffJoined = false;
    this.presenceIndex = 0;

    this.setPresenceLoop();

    process.on("uncaughtException", () => {});
    process.on("unhandledRejection", (err) => console.log(err));
    process.on("warning", (warn) => console.log(warn));
    process.on("beforeExit", () => console.log("Sistem Kapanıyor!"));
    this.on("rateLimit", (rate) => {
      console.log("Client Rate Limit'e Uğradı; " + rate);
    });
    this.on(Events.Error, () => {});
    this.on(Events.Warn, () => {});
  }

  async start(channelId) {
    const guild = this.guilds.cache.get(conf.guildID);
    if (!guild) return;

    const channel = guild.channels.cache.get(channelId);
    if (!channel || channel.type !== 2) return; 

    this.channelId = channelId;
  }

  setPresenceLoop() {
    if (!conf.presence || !Array.isArray(conf.presence) || conf.presence.length === 0) return;

    setInterval(() => {
      const name = conf.presence[this.presenceIndex % conf.presence.length];
      this.user?.setPresence({
        activities: [{
          name,
          type: ActivityType.Watching,
          url: "https://discord.gg/temeria"
        }],
        status: 'dnd'
      });
      this.presenceIndex++;
    }, 180_000);
  }
}

module.exports = { yktClient };

