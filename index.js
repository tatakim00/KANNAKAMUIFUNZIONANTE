const Discord = require('discord.js');
const bot = new Discord.Client();
const PREFIX ='K!';
const YouTube = require('simple-youtube-api');
const ytdl = require('ytdl-core'); 
var fs = require('fs');
var commandlist = fs.readFileSync('Kanna Kamui Help.txt', 'utf8');
/*var meme = fs.readFileSync('meme.txt', 'utf8');*/
function emoji (id) { return clientInformation.emojis.get(id).toString (); }
const youtube = new YouTube(process.env.GOOGLE_API_KEY);
const queue = new Map();

bot.on('message', async message => {
	if (message.author.bot) return;
	if (!message.content.startsWith(PREFIX)) return;

	const serverQueue = queue.get(message.guild.id);

	if (message.content.startsWith(`${PREFIX}play`)) {
		execute(message, serverQueue);
		return;
	} else if (message.content.startsWith(`${PREFIX}skip`)) {
		skip(message, serverQueue);
		return;
	} else if (message.content.startsWith(`${PREFIX}stop`)) {
		stop(message, serverQueue);
		return;
    }else if(message.content.startsWith(`${PREFIX}np`)){
        if(!serverQueue)return message.channel.send('Non ci sono canzoni attualmente in esecuzione');
        return message.channel.send(`Now playing ${serverQueue.songs[0].title}`);
        
    }
    else if(message.content.startsWith(`${PREFIX}queue`)){
        if(!serverQueue)return message.channel.send('Non ci sono canzoni attualmente in esecuzione');
        return message.channel.send(`
        **SONG QUEUE**
        ${serverQueue.songs.map(song => `**-** ${song.title}`).join('\n')}
        **Now Playing** ${serverQueue.songs[0].title}`);
    }else if(message.content.startsWith(`${PREFIX}pause`)){
        if(serverQueue && serverQueue.playing){
            serverQueue.playing = false;
            serverQueue.connection.dispatcher.pause();
            return message.channel.send('Music Paused');}return message.channel.send('Non ci sono canzoni attualmente in esecuzione');
    }else if(message.content.startsWith(`${PREFIX}resume`)){
        if(serverQueue && !serverQueue.playing){
            serverQueue.playing = true;
            serverQueue.connection.dispatcher.resume();
            return message.channel.send('Music Resmed');
        }return message.channel.send('Non ci sono canzoni attualmente in esecuzione');
    }
    else {
		message.channel.send('è tanto difficile inserire un comando valido ??!!')
	} 
    
    
});

async function execute(message, serverQueue) {
	const args = message.content.split(' ');
    const searchString = args.slice(1).join(' ');
    const url = args[1].replace(/<(.+)>/g, '$1');
	const voiceChannel = message.member.voiceChannel;
	if (!voiceChannel) return message.channel.send('Devi essere in un voicechannel per ascoltare la musica.... coglione!');
	const permissions = voiceChannel.permissionsFor(message.client.user);
	if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
		return message.channel.send('Ho bisogno dei permessi di "Parlare" e "Connettere in un voicechannel"!');
    }
    if(url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)){
        const playlist = await youtube.getPlaylist(url);
        const videos = await playlist.getVideos();

        for(const video of Object.values(videos)){
            const video2 = await youtube.getVideoByID(video.id);
            await handleVideo(video2, message, voiceChannel, true);
        }
        return message.channel.send(`Playlist : **${playlist.title}** è stata aggiunta alla coda!`);
    }else{
        try{
            var video = await youtube.getVideo(url);
        }catch(error)
        {
        try {
                var videos = await youtube.searchVideos(searchString, 1);
                var video = await youtube.getVideoByID(videos[0].id);
                message.channel.send(`${videos[0].title} , ${videos[0].url}`);
    
        }catch (err){
            console.error(err);
            return message.channel.send('Nessun risultato di ricerca.');
        }}
        return handleVideo(video, message, voiceChannel);
    }
}



async function handleVideo(video, message, voiceChannel, playlist = false){
    const serverQueue = queue.get(message.guild.id);
    const song = {
        id: video.id,
    title: video.title,
    url: `https://www.youtube.com/watch?v=${video.id}`
};

if (!serverQueue) {
    const queueContruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true,
    };

    queue.set(message.guild.id, queueContruct);

    queueContruct.songs.push(song);

    try {
        var connection = await voiceChannel.join();
        queueContruct.connection = connection;
        play(message.guild, queueContruct.songs[0]);
    } catch (err) {
        console.log(err);
        queue.delete(message.guild.id);
        return message.channel.send(err);
    }
} else {
    serverQueue.songs.push(song);
    console.log(serverQueue.songs);
    if(playlist) return undefined;
    else return message.channel.send(`${song.title} è stata aggiunta alla coda!`);
}

}

function skip(message, serverQueue) {
	if (!message.member.voiceChannel) return message.channel.send('Devi essere in un voicechannel per skippare.... coglione!');
	if (!serverQueue) return message.channel.send('Non ci sono canzoni da skippare!');
	serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
	if (!message.member.voiceChannel) return message.channel.send('Devi essere in un voicechannel per fermare la musica.... coglione!');
	serverQueue.songs = [];
	serverQueue.connection.dispatcher.end();
}

function play(guild, song) {
	const serverQueue = queue.get(guild.id);

	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}

	const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
		.on('end', () => {
			console.log('Music ended!');
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0]);
		})
		.on('error', error => {
			console.error(error);
		});
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
}



bot.on('ready',() => { console.log("I'm ready to send nudes!"); } )

bot.on('guildMemberAdd', member => {
    const channel = member.guild.channels.find(channel => channel.name === "♡┆benvenuti")
    if(!channel)return
    channel.send(`Benvenuto ${member}<:kannakamui:608404704845889556>, siamo felici di accoglierti in ,**:cherry_blossom:𝕃𝕠𝕝𝕚𝕤𝕎𝕠𝕣𝕝𝕕:cherry_blossom:**.<a:zt:608309871896690689>
Non abusare delle bambine e buona permanenza! <:zhoulamerda:608396991436685344>`);
const embed = new Discord.RichEmbed()
                    .setImage("https://i.kym-cdn.com/photos/images/original/001/241/247/c04.gif")
                    channel.send({embed})
});


bot.on('message', message =>{
    if (message.content.startsWith(PREFIX + "help") || message.content.startsWith(PREFIX + "commands")) 
    {
        const embed = new Discord.RichEmbed()
        .setColor('#6D466B')
        .setTitle('**Comandi**')
        .setDescription(commandlist)
        .setFooter("Powered by pinco.il.mago")
        message.channel.send(embed)   
};
});


let ImageArray = JSON.parse(fs.readFileSync('meme.json'));


bot.on('message', message =>{
    if(message.content.startsWith(PREFIX + "aotmeme")){
        number = 19;
        var random = Math.floor (Math.random() * (number));
        /*const Array = ['https://media3.giphy.com/media/GyChnsTnX8bDi/giphy.gif',
        'https://cdn.myanimelist.net/s/common/uploaded_files/1452670440-e83dfccf7c336129d27c54ccd4d83242.gif',
        'https://i.kym-cdn.com/photos/images/original/001/241/247/c04.gif',
        'http://25.media.tumblr.com/7a30e9bf8a4eba2cf1f466de90f82471/tumblr_ms3dt2Hz5A1rzjb4go1_500.gif',
        'https://media0.giphy.com/media/xNqHay7nIhWoM/giphy.gif',
        'http://25.media.tumblr.com/7a30e9bf8a4eba2cf1f466de90f82471/tumblr_ms3dt2Hz5A1rzjb4go1_500.gif',
        'https://i.imgflip.com/2rg19t.jpg',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRaEKeP6hnhmI5AJucOjB-cJ_3hIfqHAlOI0x149nvc2kI-7E08',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqaWeI8pJrOFcO-EHygFDmnJkYBKcB0QZi6WgikJp2ziG_7KUu5Q',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4OLnljxg7uezdx3t1UDSgezvtINwBl5_WtVs0F1q1ioKK_JAQ5A',
        'https://i.kym-cdn.com/photos/images/newsfeed/000/641/238/b99.jpg',
        'https://i.kym-cdn.com/photos/images/original/000/586/391/df3.jpg',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_I5It5BQK4PNfcGqxjVvoLhxWihi1itME-I8nOzrUvEH8LLNC',
        'https://i.kym-cdn.com/photos/images/newsfeed/001/131/532/71d.png',
        'https://i.imgur.com/fqXUlkc.gif',
        'https://data.whicdn.com/images/212845263/original.gif',
        'https://66.media.tumblr.com/49db575ffcab064198fa0dd006ac7038/tumblr_ook968xrUc1w8pxjzo1_400.gifv',
        'http://37.media.tumblr.com/c48924c62d16c191260166a30ae394e7/tumblr_n48hezByEP1sg146vo1_250.gif ',
        'https://i.kym-cdn.com/photos/images/newsfeed/000/586/078/d61.gif']
    */
        const embed = new Discord.RichEmbed()
                    .setImage(ImageArray[random])
                    .setFooter('Powered by pinco.il.mago')
                    .setTimestamp()
                    message.channel.send(embed)
    }
    if(message.content.startsWith(PREFIX + "fuoco")){
        number = 9;
        var random = Math.floor(Math.random()*(number));
        const Array=['https://media1.giphy.com/media/yRnA9pPlLZOY8/source.gif',
        'https://mondogif.altervista.org/wp-content/uploads/2017/10/%E2%80%9CQuesta-%C3%A8-benzina-io-mi-d%C3%B2-fuoco%E2%80%9D-in-GIF-animata-2.gif',
    'https://www.gifmania.it/Gif-Animate-Manga-Anime/Immagini-Animate-Pokemon/Gif-Animati-Pokemon-Di-Fuoco/Magmar/Magmar-81925.gif',
'https://instagram.ffra1-1.fna.fbcdn.net/v/t51.2885-15/e35/54512199_2526952367376308_3091587691246637381_n.jpg?_nc_ht=instagram.ffra1-1.fna.fbcdn.net&se=8&oh=a4e0538d7c6e307e4c5f09561a021bc9&oe=5E0F7900&ig_cache_key=MjAxNDcwMzU1MTQ4NTY0NzE4MA%3D%3D.2',
'https://cdn-img-n.facciabuco.com/14/q40w68dpkv-quando-ti-stai-facendo-un-toast-ma-mandi-a-fuoco-la-cattedrale_a.jpg',
'https://scontent-frx5-1.cdninstagram.com/vp/b618f2b26ffd0e2d7e7fbf2967dcfbfb/5DA6A59E/t51.2885-15/e35/64794869_312903036133016_3031424548634999424_n.jpg?_nc_ht=scontent-frx5-1.cdninstagram.com&se=8&ig_cache_key=MjA4MzQ1OTg5MDk5NTA2OTk4Mw%3D%3D.2',
'https://media.comicbook.com/2018/12/black-clover-asta-1150891-1280x0.jpeg',
'https://gifimage.net/wp-content/uploads/2017/11/fuoco-gif-6.gif',
'https://media.giphy.com/media/PBcodKXWrDfMI/giphy.gif']

                const embed = new Discord.RichEmbed()
                    .setImage(Array[random])
                    .setFooter('Powered by pinco.il.mago')
                    .setTimestamp()
                    message.channel.send(embed)
    }
    if(message.content.startsWith(PREFIX + "kannakamui")){
        number = 21;
        var random = Math.floor(Math.random()*(number));
        const Array=['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQ6H3LdGwK2xWzbw8nnQfUXgrsQPYzU1omv6RltOaHVDnbVprRBQ',
    'https://media0.giphy.com/media/WcEvIajIk332g/giphy.gif',
'http://pa1.narvii.com/6518/be1713884a76ccad3fba3b6ab2f1d7e825be1e09_hq.gif',
'https://media.giphy.com/media/NRVCgNCn52SAg/giphy.gif',
'https://i.imgur.com/8gzGyA8.gif',
'https://78.media.tumblr.com/59d50dd40e77c1f6b56de7a6b0b4d706/tumblr_omvtee2v7J1smw5dno1_640.gif',
'https://i.pinimg.com/originals/0f/22/89/0f2289dbc014468d3c9538a22586c68d.gif',
'https://78.media.tumblr.com/e57006b59e602501dcc17db8eafd056a/tumblr_okpm9aNK4V1v8jcbro1_500.gif',
'https://78.media.tumblr.com/e57006b59e602501dcc17db8eafd056a/tumblr_okpm9aNK4V1v8jcbro1_500.gif',
'https://media.tenor.com/images/4fbd3ed28b84782922b6d92257b900bf/tenor.gif',
'https://media0.giphy.com/media/7emmvIS55aOT6/giphy.gif',
'https://66.media.tumblr.com/95213606b8ecc023e9823ee7e7a382f1/tumblr_opujjc3TQZ1vpo36po8_400.gifv',
'https://i.pinimg.com/originals/6b/16/d6/6b16d670971e5a526533e396760f0906.gif',
'https://media2.giphy.com/media/l0IyjCRcRa6pQo2S4/giphy.gif',
'https://data.whicdn.com/images/302451982/original.gif',
'https://data.whicdn.com/images/301024732/original.gif',
'http://i.imgur.com/iNMXaRM.gif',
'https://66.media.tumblr.com/e9b45921359339d1312aee012b3cfc46/tumblr_pc8f63GCpZ1xuvhj0o9_250.gifv',
'https://media.tenor.com/images/e3165be7e00c6e1617a995abd11b0bdf/tenor.gif',
'https://thumbs.gfycat.com/GlamorousFrigidKingfisher-size_restricted.gif',
'https://media.tenor.com/images/0a946392d53b40df32b4820a20776f7f/tenor.png']

const embed = new Discord.RichEmbed()
                    .setImage(Array[random])
                    .setFooter('Powered by pinco.il.mago')
                    .setTimestamp()
                    message.channel.send(embed)
    }
    if(message.content.startsWith(PREFIX + "loli")){
        number = 32;
        var random = Math.floor(Math.random()*(number));
        const Array=['https://media3.giphy.com/media/gUvLYSSMguiSk/source.gif',
    'https://media.giphy.com/media/O38XJW2fOclCo/giphy.gif',
'https://steamuserimages-a.akamaihd.net/ugc/32981755975008833/5BFAC28E6DEF1447D55455ECB7E2B60B303614CE/',
'https://gifimage.net/wp-content/uploads/2017/09/anime-loli-gif-9.gif',
'https://data.whicdn.com/images/60403350/original.gif',
'https://media2.giphy.com/media/lop8rMAJv0VfG/source.gif',
'https://pa1.narvii.com/6108/f3518e0f4f59932a96458d3ae1fe7a38cddfcaed_hq.gif',
'https://thumbs.gfycat.com/ClassicExcellentDuck-size_restricted.gif',
'https://i.pinimg.com/originals/52/c4/d5/52c4d55c27725df1b0a35178ad7cbc08.gif',
'https://image.myanimelist.net/ui/G-Sm6d0qIwQxUGHIp-m2WGWUJGNTIW4Mae6mbs6M4hHetQ6LacRU6lYM4YoDmdWBybpMWCw0JuU2f4t5gB5Y2-3yQljU29RZATu9-mV2UjgFw-ULAMTsm1eueeD8i8I-',
'http://cdn.lowgif.com/full/84514ebca112b7aa-why-lolis-anime-related-disqus.gif',
'https://i.pinimg.com/originals/94/ff/51/94ff51793ab56ddcd846096044823924.gif',
'http://giphygifs.s3.amazonaws.com/media/jUg8D7Yy0Qi4w/giphy.gif',
'https://i.pinimg.com/originals/67/01/e2/6701e20a1cfe0233294d8a668206add7.gif',
'https://i.pinimg.com/originals/79/20/1d/79201dca73519acbc259591fabbc2dc3.gif',
'https://i.imgur.com/VUuoZfa.gif?noredirect',
'https://media1.tenor.com/images/6125c9e6fb1dbb4fd23cf6db578702da/tenor.gif?itemid=14065051',
'https://media1.tenor.com/images/3102194c3ee2124d988a167dc4e79a0d/tenor.gif?itemid=10993798',
'https://steamuserimages-a.akamaihd.net/ugc/854974895409495071/171225AFD44336CA1DE09A855750F677E4434E19/',
'https://data.whicdn.com/images/291726305/original.gif',
'https://thumbs.gfycat.com/HandsomeTallBorzoi-small.gif',
'https://media2.giphy.com/media/DaN3cl3l27MQw/giphy.gif',
'https://pa1.narvii.com/6094/435415ef882c4c8ca164af3d2b539e29944033ab_hq.gif',
'http://38.media.tumblr.com/ebb82f31ab54eb18e8678ae49cd0953e/tumblr_mj5pquKkSD1rgtl3ho1_500.gif',
'https://66.media.tumblr.com/tumblr_loio9oPBJ51qeb4jb.gif',
'https://pa1.narvii.com/6976/5bdb3e7ce8a48e77fc41b145ee468369445440abr1-440-330_hq.gif',
'https://pa1.narvii.com/6972/9858334bdd74415d5facf1ca2314bad29430cde5r1-500-360_hq.gif',
'https://pa1.narvii.com/6345/e9c29d9f4a31ba3235dc963b80a508e5f0a0bedf_hq.gif',
'https://data.whicdn.com/images/118844614/original.gif',
'https://thumbs.gfycat.com/AntiqueAjarCod-max-1mb.gif',
'https://i.pinimg.com/originals/73/c2/1b/73c21b14ce805359284463323934d611.gif',
'https://pa1.narvii.com/6504/cf5243c22df700e5b3abe1ed557c7d464767d9ad_hq.gif']

const embed = new Discord.RichEmbed()
                    .setImage(Array[random])
                    .setFooter('Powered by pinco.il.mago')
                    .setTimestamp()
                    message.channel.send(embed)
    }
    if(message.content.startsWith(PREFIX + "bestemmie")){
        number = 14;
        var random = Math.floor (Math.random() * (number));
        const Array = ['https://media.tenor.com/images/d0137141bd1fbd6302afdf1c3f28e2ca/tenor.gif',
    'https://media1.tenor.com/images/d54a7b23ffe6dcb5aafd7c3674609ceb/tenor.gif',
'https://66.media.tumblr.com/cdd2bac16baf74e352a064c7500f9034/tumblr_pkmf9goxbl1tw0kwco3_500.gif',
'https://i.imgur.com/Shr4Bay.png',
'https://pics.me.me/quando-dalfondo-della-classe-parte-unagaradi-bestemmie-oformio-enessunoti-hainvitato-14945421.png',
'https://media0.giphy.com/media/ZwNfqKtZZoCE8/source.gif',
'https://dok7xy59qfw9h.cloudfront.net/506/137/717/100003009-1r2s7kh-h7ih6111nlho0p0/original/file.jpg',
'https://media.makeameme.org/created/bestemmie-bestemmie-in.jpg',
'https://scontent-lhr3-1.cdninstagram.com/v/t51.2885-15/e35/55952396_473050363235158_6935712941371556543_n.jpg?_nc_ht=scontent-lhr3-1.cdninstagram.com&oh=32604f90035631a60e0b322a9ede8f88&oe=5E158BF9&ig_cache_key=MjAyNDI0OTI5MDIzMjA3NTkyNA%3D%3D.2',
'https://www.memecreator.org/static/images/memes/4612976.jpg',
'http://www.isarcastici4.it/immagini/umorismo/motu_masters_of_the_universe_memes/motu_meme_ita_bestemmia_orko_dio_creazione_michelangelo.jpg',
'https://dok7xy59qfw9h.cloudfront.net/881/026/954/710003014-1qp0t58-60e037coqrdk22f/original/file.jpg',
'https://i.ytimg.com/vi/1Q5F_S6xiAU/maxresdefault.jpg',
'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRQClbsOzW16xPmtHyxJdg243ua9aZg9XCxigbICF7mhvmEowrmQ']

const embed = new Discord.RichEmbed()
                    .setImage(Array[random])
                    .setFooter('Powered by pinco.il.mago')
                    .setTimestamp()
                    message.channel.send(embed)
    }
     if(message.content.startsWith(PREFIX + "jojo")){
        number = 13;
        var random = Math.floor (Math.random() * (number));
        const Array = ['https://pbs.twimg.com/profile_images/536527339513856000/9K056IwV.jpeg',
    'https://media.tenor.com/images/df42eab81048012d949c4cf9a0648d0f/tenor.gif',
    'https://i.kym-cdn.com/photos/images/newsfeed/000/765/764/e5b.gif',
    'https://i.imgur.com/bn1ufCM.gif',
    'https://thumbs.gfycat.com/SeparateImpressiveAngelfish-size_restricted.gif',
    'https://ci.memecdn.com/7733298.gif',
    'https://media0.giphy.com/media/4wxde1p1yMg6c/giphy.gif',
    'https://ci.memecdn.com/7904314.gif',
    'https://images7.memedroid.com/images/UPLOADED848/5cae2185d0146.jpeg',
    'http://m.quickmeme.com/img/29/2921808074c1cb392ff951c9bcd27180f463c3494ddee8ab8f856b8ee8befc22.jpg',
    'https://memestatic.fjcdn.com/gifs/Jojo_a736c3_6351678.gif',
    'https://media2.giphy.com/media/JPgbfbcXxDr6E/giphy.gif',
    'https://gifimage.net/wp-content/uploads/2018/04/oh-my-god-jojo-gif-7.gif']

    const embed = new Discord.RichEmbed()
                    .setImage(Array[random])
                    .setFooter('Powered by pinco.il.mago')
                    .setTimestamp()
                    message.channel.send(embed)
    }
    if(message.content.startsWith(PREFIX + "ahegao")){
        number = 24;
        var random = Math.floor (Math.random() * (number));
        const Array = ['https://i.pinimg.com/originals/59/23/92/59239242539059e06d28fa192b6538c3.gif',
    'https://images.sex.com/images/pinporn/2014/12/28/300/9762745.gif',
'https://data.whicdn.com/images/313116899/original.gif',
'https://i.pinimg.com/originals/f4/be/f0/f4bef084ec13910226c0ca91ba07ca17.gif',
'https://media1.tenor.com/images/ca67a563278acd790b512411ca672561/tenor.gif?itemid=14993233',
'https://media.giphy.com/media/yb9M8WaGrh12o/giphy.gif',
'http://ahegao.online/wp-content/uploads/2019/01/Boku-no-Yayoi-san-Episode-1-4.gif',
'https://i.pinimg.com/originals/91/37/21/913721dcd4e9863f203aa3ebfce48e9d.gif',
'https://img-hw.xvideos.com/videos/profiles/galleries/a1/60/66/strawberryjizz/gal1597707/pic_8_big.gif',
'https://pm1.narvii.com/6047/20e207c0a70124439586116e0faee66e12c074f0_hq.jpg',
'https://em.wattpad.com/e4a1c2699d1f8f863fdbce473822dbf8ec10cd4e/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f776174747061642d6d656469612d736572766963652f53746f7279496d6167652f4c7a5f696f684d333978722d65413d3d2d3737353832333636392e3135626461653661333431396239613232383937333630353730302e676966?s=fit&w=720&h=720',
'https://i.gifer.com/8VVh.gif',
'http://i.imgur.com/t8HDKnJ.gif',
'https://data.whicdn.com/images/223369774/original.gif',
'https://ci.memecdn.com/6464742.gif',
'https://forum.level1techs.com/uploads/default/original/3X/8/9/89883dbca0b33c44a2001090d641689023660490.gif',
'https://us.rule34.xxx//images/2149/10e938f8aff8760f6caf90baf9f0ab5f2736d612.gif',
'https://data.whicdn.com/images/327142436/original.gif',
'https://media0.giphy.com/media/aRETBmVAMKEp2/source.gif',
'https://thumbs.gfycat.com/SomeKeenAsp-size_restricted.gif',
'https://i.redd.it/vaisq8t5rdw01.gif',
'https://steamuserimages-a.akamaihd.net/ugc/960842269462234672/25E7324248A0FE8DE24A73478E103337933A847F/',
'https://static1.fjcdn.com/thumbnails/comments/Mobilebull+used+roll+picturemobilebull+rolled+image+this+is+how+_abeaeca19c40a1375685f99e4471dcd8.gif',
'https://i.kym-cdn.com/photos/images/newsfeed/001/030/882/53b.gif']

const embed = new Discord.RichEmbed()
.setImage(Array[random])
.setFooter('Powered by pinco.il.mago')
.setTimestamp()
message.channel.send(embed)
}
if(message.content.startsWith(PREFIX + "ravioli")){
    number = 7;
    var random = Math.floor (Math.random() * (number));
    const Array = ['https://i.ytimg.com/vi/F9wpezqKFnA/maxresdefault.jpg',
'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/aea27125-0c3d-4edc-a237-26e2ca8355b3/db7daeh-aef33a61-134d-40ea-b318-f1faa2b650f1.jpg/v1/fill/w_645,h_500,q_75,strp/kanna_kamui_meme_2__by_wcher999_db7daeh-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NTAwIiwicGF0aCI6IlwvZlwvYWVhMjcxMjUtMGMzZC00ZWRjLWEyMzctMjZlMmNhODM1NWIzXC9kYjdkYWVoLWFlZjMzYTYxLTEzNGQtNDBlYS1iMzE4LWYxZmFhMmI2NTBmMS5qcGciLCJ3aWR0aCI6Ijw9NjQ1In1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLm9wZXJhdGlvbnMiXX0.ufGMoJ6EkOeE8xPMS18PXT4sLmySyNGgCLtGGmIBNGE',
'https://coubsecure-s.akamaihd.net/get/b177/p/coub/simple/cw_timeline_pic/2119e163952/1ead6e0cfa2e1f817d85a/big_1502032345_image.jpg',
'http://pm1.narvii.com/6768/97d0b6c9fb8ea6cfc47d54e27effb165ba938784v2_00.jpg',
'https://i.imgflip.com/3bje3n.jpg',
'https://pics.me.me/ravioli-ravioli-death-to-capitalism-lolis-32758821.png',
'https://i.kym-cdn.com/photos/images/original/000/613/346/63b.png']

    const embed = new Discord.RichEmbed()
    .setImage(Array[random])
    .setFooter('Powered by pinco.il.mago')
    .setTimestamp()
    message.channel.send(embed)
    }
    if(message.content.startsWith(PREFIX + "punch")){
        number = 13;
        var random = Math.floor (Math.random() * (number));
        const Array = ['https://thumbs.gfycat.com/BeautifulGregariousHare-size_restricted.gif',
    'https://media0.giphy.com/media/FyikNKBtz1lg4/giphy.gif',
'https://i.gifer.com/61i9.gif',
'https://thumbs.gfycat.com/SecondFeminineDuckbillcat-size_restricted.gif',
'https://cdn.weeb.sh/images/HJfGPTWbf.gif',
'https://media.giphy.com/media/yo3TC0yeHd53G/giphy.gif',
'https://thumbs.gfycat.com/ImperfectFrightenedFoal-size_restricted.gif',
'https://media.giphy.com/media/nOdUe5Fw7YK40/giphy.gif',
'https://i.imgur.com/kO1XFXM.gif',
'https://4.bp.blogspot.com/-Bvm7ecJd04I/WX6-5cGJhfI/AAAAAAAAB0Q/GsSNtuo2g7UxHK92h1wsjfIBBcZ4FpOpgCLcBGAs/s1600/tumblr_inline_o9kmdwsfUL1s2ua4d_500.gif',
'https://gifimage.net/wp-content/uploads/2017/09/anime-punch-gif-9.gif',
'https://thumbs.gfycat.com/KindDangerousAustralianfurseal-size_restricted.gif',
'https://media3.giphy.com/media/ABJSd2YGc5nlS/giphy.gif']

        const embed = new Discord.RichEmbed()
        .setImage(Array[random])
        .setFooter('Powered by pinco.il.mago')
        .setTimestamp()
        message.channel.send(embed)
        }
        if(message.content.startsWith(PREFIX + "slap")){
            number = 20;
            var random = Math.floor (Math.random() * (number));
            const Array = ['https://media1.giphy.com/media/LB1kIoSRFTC2Q/source.gif',
        'https://media3.giphy.com/media/9U5J7JpaYBr68/source.gif',
    'https://i.imgur.com/o2SJYUS.gif',
'https://media2.giphy.com/media/Zau0yrl17uzdK/source.gif',
'https://thumbs.gfycat.com/PersonalUnlinedAsiaticwildass-size_restricted.gif',
'https://media.giphy.com/media/fNdolDfnVPKNi/giphy.gif',
'https://media.giphy.com/media/VEmm8ngZxwJ9K/giphy.gif',
'https://media.giphy.com/media/trREN3ECv29y/giphy.gif',
'https://i.pinimg.com/originals/bf/ef/b4/bfefb401ed8f1f7a3fee62d76a2856a4.gif',
'http://electrohaxz.tk/media/img/anime-images/Nekos/gif/slap/slap_006.gif',
'https://static.fjcdn.com/gifs/+slap+2+more+here+wwwyoutubecomusersquabanimeand+here+wwwfacebookcompagessquab220040661488110refhl_08fdab_5160649.gif',
'https://media.indiedb.com/images/groups/1/25/24269/ezgif-3-42e7af267b.gif',
'https://i.pinimg.com/originals/b9/74/54/b97454d61d518852bef17e40703bb3fe.gif',
'https://i.redd.it/2cl0i46pk5k31.gif',
'https://data.whicdn.com/images/119597356/original.gif',
'https://i.pinimg.com/originals/65/57/f6/6557f684d6ffcd3cd4558f695c6d8956.gif',
'http://i.imgur.com/Y9nUZxc.gif',
'https://i.imgur.com/RW9789N.gif',
'https://data.whicdn.com/images/67416846/original.gif',
'http://pa1.narvii.com/6014/7e726b7889f0770f462b1e2edc98fbe86eb876c0_00.gif']

        const embed = new Discord.RichEmbed()
        .setImage(Array[random])
        .setFooter('Powered by pinco.il.mago')
        .setTimestamp()
        message.channel.send(embed)
        }
});

bot.login(process.env.BOT_TOKEN);