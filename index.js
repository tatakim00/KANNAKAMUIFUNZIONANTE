const Discord = require('discord.js');
const client = new Discord.Client();
const PREFIX = '!u';
var array=[];
array = require("./meme.json");

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if (msg.content === 'Cosa pensi dello Zhou?') {
    msg.reply('Trovo sia un cinese bastardo, frocio e con la faccia tonda <:zhoualcolizzato:653659819915608102>');
  }
});

client.on('message', msg => {
  if (msg.content === '!u help') {
    msg.reply({embed: {
        "title": "ＵｍａｒｕＣｈａｎ Ｃｏｍｍａｎｄｓ：",
        "description": "<:zhoualcolizzato:653659819915608102> Funny Commands: <:zhoualcolizzato:653659819915608102>\n♡ ᴀᴏᴛᴍᴇᴍᴇ\n♡ ʟᴏʟɪ\n♡ ᴋᴀɴɴᴀᴋᴀᴍᴜɪ\n♡ ᴀʜᴇɢᴀᴏ\n♡ ᴀɴɪᴍᴇᴍᴇᴍᴇ\n<:scascodimerda:608416099406708746> 𝖎𝖓𝖙𝖊𝖗𝖆𝖈𝖙𝖎𝖔𝖓𝖘:<:dannylamerda:608414165090173009>\n♡𝓅𝓊𝓃𝒸𝒽\n♡𝓈𝓁𝒶𝓅\n♡𝓀𝒾𝓈𝓈\n♡𝒽𝓊𝑔\n♡𝓁𝒾𝒸𝓀\n♡𝒻𝒶𝒸𝑒𝓅𝒶𝓁𝓂\n♡𝓅𝒶𝓉\n♡𝒸𝓇𝓎\n<:delfinofamososudiscord:608406145400307714> ℳ𝓊𝓈𝒾𝒸: <:aurelionunminion:653666501924225035>\n♫ ᴾˡᵃʸ\n♫ ˢᵏⁱᵖ\n♫ ᴸᵒᵒᵖ /n",
        "author": {
          "name": "!u {command}",
          "icon_url": "https://media.giphy.com/media/U6kGxfqszGeUBFnOT8/giphy.gif"
        },
        "color": 53380,
        "footer": {
          "text": "UmaruChan al vostro servizio!",
          "icon_url": "https://i.pinimg.com/originals/8b/42/6c/8b426c9bedc37054cd7e73925fa10da5.gif"
        },
        "thumbnail": {
          "url": "https://media.tenor.com/images/0009812178810e876fda65c7559d0642/tenor.gif"
        },
    }});
  }
});

client.on("guildMemberAdd", member =>{
  var channel = member.guild.channels.cache.find(channel => channel.name === "♡┆benvenuti");
  if(!channel) return;
  const welcomeEmbed = new Discord.MessageEmbed()
  .setColor(10181046)
  .setAuthor('Welcome', 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcRfLjOfKtqlizcf_ZFZMIbZNrzjfGgkjCr9nC_F3SEVN_TU6yL9&usqp=CAU')
  .setDescription(`Carissimo/a ${member}\n₊˚๑🌙➤1. ti invitiamo a scegliere i tuoi ruoli nel canale <#640158874631929856> \n₊˚๑🌙➤ 2. leggere il regolamento su <#629435999667093544>\n₊˚๑🌙➤ 3. Per qualsiasi lamentela o consiglio per aiutarci a migliorare potete rivolgervi ai @ʚ: ᙏᥲɩᑯ-⳽ᥙ :ɞ <:tataculoforever:608404703772016682>\n🌸 . ⋆ ｡ ⋆˚ ☽ ˚ ｡ ⋆ 🌙 ⋆ ｡ ˚ ☽ ˚⋆ ｡ ⋆ . 🌸\n ₊˚๑🌙➤ Se non trovate alcun @ʚ: ᙏᥲɩᑯ-⳽ᥙ :ɞ , i @Ⲙⲉⲟⲱ𝖽ⲉⲅⲁⲧⲟⲅ⳽ saranno a vostra disposizione!\n`)
  .setTitle('ʚ 𝑩𝒆𝒏𝒗𝒆𝒏𝒖𝒕𝒐/𝒂 𝒔𝒕𝒖𝒑𝒓𝒂𝒕𝒐𝒓𝒆 ɞ ')
  .setThumbnail ("https://i.gifer.com/9e1Z.gif")
  .setFooter('Non flammate, in caso fate 1vs1', 'https://cdn.streamelements.com/uploads/d1d2ae90-5e10-432b-bb46-68a594d5dc1d.gif')
  .setImage("https://i.pinimg.com/originals/8b/42/6c/8b426c9bedc37054cd7e73925fa10da5.gif")
  channel.send(welcomeEmbed);
}); 

client.on('message', message =>{
  if(message.content.startsWith(prefix + "aotmeme")) {
    number = 20;
    var random = Math.floor (Math.random() * (number));
    const embed = new Discord.MessageEmbed()
    .setTitle('𝐄𝐜𝐜𝐨 𝐚 𝐭𝐞 𝐮𝐧 𝐦𝐞𝐦𝐞 𝐝𝐢 𝐀𝐭𝐭𝐚𝐜𝐤 𝐨𝐧 𝐓𝐢𝐭𝐚𝐧：')
    .setColor(53380)
    .setAuthor(OwO)
    .setImage(array.aotmeme[random])
    .setFooter('UmaruChan al vostro servizio!')
    .setTimestamp()
    message.channel.send(embed)}
  });
  

client.login(process.env.BOT_TOKEN);