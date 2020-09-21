const Discord = require('discord.js');
const client = new Discord.Client();
const sys = require('./system.json');
const ytdl = require('ytdl-core');
const jimp = require('jimp');
const ytSearch = require('yt-search');
const express = require('express')
var lyricFind = require('better-lyric-get');
const app = express();

//bo deixa o bot vivo pa sempri viadokkkkkkkkkkkkkkkkk
app.use(express.static('public'));
const http = require('http');
app.get("/", (request, response) => { response.sendStatus(200); });
app.listen(process.env.PORT); setInterval(function(){ http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`); }, 3000);

var streamOptions = { volume:0.4, seek:0 };
var countCommands = 0;
var countCommands1 = 1;


client.on('ready', async () => {
  console.log('Info:\nusername:'+client.user.username+'\nid:'+client.user.id)
  
  //Conta quantos comandos o bot tem, pelos "-" dos comandos :) bem inteligente, não?! E o do por quê do -1 no final? Todo array é [] né? então o comprimento dele é contado do 0, mas com o .split, ele acrescenta 2, porque ele vira array com o split, e o lentgh deixa ele txt, 2 -1 =1 :)
  countCommands = sys.help.comandosdj.split('-').length + sys.help.comandodc.split('-').length - 2 
  
  //muda aleatoriamente a presence do Polari's.
  let status = [
        {name:`Em desenvolvimento...`, type: 'PLAYING'},
        {name:`Bebendo uma xicara de café`, type: 'WATCHING'},
        {name:`Eu tenho ${countCommands} comandos!`, type:'PLAYING'}
    ]
    function setStatus(){ //Função para o BOT mudar de Status aleatoriamente
        let randomStatus = status[Math.floor(Math.random()*status.length)]
        client.user.setPresence({game: randomStatus})
    }
    setStatus();
    setInterval(() => setStatus(),5000)
  
})

client.on('guildCreate', async (guild) => {
  //Verifica se o servidor está banido de usar o bot.
  var bannedGuilds = "";
  for (var i="";i<sys.guilds.banned.length;i++) {
    bannedGuilds = bannedGuilds + " • " + sys.guilds.banned[i];
  }
  //Se o servidor for banido de usar o bot, o bot sai dele :)
  if (bannedGuilds.indexOf(guild.id) > -1) return guild.leave();
})

client.on('message', async (message) => {
  //declarações iniciais.
  const arg = message.content.slice(sys.p.length).trim().split(/ +/g);
  const command = arg.shift().toLowerCase();
  if (message.author.bot) return;

  //Verifica se o usuário está banido de ultilizar o bot.
  var bannedUsers = "";
  for (var i=0;i<sys.users.banned.length;i++) {
    bannedUsers = bannedUsers + " • " + sys.users.banned[i];
  }
  //Impede o usuário banido, de ultilizar o bot e manda uma menssagem PUTA pra ele.
  if (message.content.startsWith(sys.p) && bannedUsers.indexOf(message.author.id) > -1) return message.reply('Desculpe, mas você faz parte dos usuários banidos de ultilizar este bot.');

  if(message.author.bot) return;
    if(message.content.startsWith(`<@!${client.user.id}>`) || message.content.startsWith(`<@${client.user.id}>`)){
        return message.reply(`Meu prefixo é **${sys.p}**, use ${sys.p}help`)}
    if(!message.content.startsWith(sys.p)) return;
  
  //Comandos...

  if (command === 'help') {
    var member = message.author;
    var e = new Discord.RichEmbed()
      .setTitle("**Meus Comandos!**")
      .addField(`Comandos de DJ`, `${sys.help.comandosdj}`)
      .addField(`Comandos do Discord`, `${sys.help.comandodc}`)
      .setDescription(`Não se esqueça do meu prefixo! **${sys.p}**`)
      .setThumbnail(client.user.avatarURL)
      .setColor('RANDOM')
    member.send(e)
      message.channel.send('Te enviei em sua dm!'); 
    return;
  }


  // Ping do Bot
  if (command === "ping") {
        let usernameAuthorCommand = message.author.username;
        let AvatarAuthorCommand = message.author.displayAvatarURL;
        var m = await message.channel.send("Ping?");
        let embed = new Discord.RichEmbed()
          .addField("Latência", `O ping é de ${m.createdTimestamp - message.createdTimestamp}ms.\nO ping do ${client.user} é de ${Math.round(client.ping)}ms (API Knut)`)
          .setColor("RANDOM")
          .setFooter(`${usernameAuthorCommand}`, AvatarAuthorCommand);
        m.edit(embed);
      
      return;
    
    }

 // Informações do bot
    if (command === "botinfo") {
          let author = { name:message.author.username, avatar:message.author.displayAvatarURL }
          let embed = new Discord.RichEmbed()
            .setTitle("Informações sobre o " + client.user.username)
            .addField(">>> :crown: Criadores:", `<@${sys.edu.id}> <@${sys.karbox.id}>`)
            .addField(">>> :calendar_spiral: Iniciado dia:", `06/02/2020`)
            .addField(`>>> ${sys.emoji.javascript} Linguagem utilizada:`, "JavaScript, Nodejs")
            .setColor("RANDOM")
            .setFooter(`${author.name}`, author.avatar);
          message.channel.send(embed); 
      
        return;
      
      }
  
    if (command === "play") {
      var channelThis = message.member.voiceChannelID;
      var voiceChannel = message.guild.channels.find(channels => channels.id === channelThis);

      let search = arg.join(' ');
      if (!search) return message.reply('modo de usar: '+sys.p+'play <pesquisa>');

      if (voiceChannel) {

        ytSearch( search, function ( err, r ) {

        if ( err ) throw err
        const videos = r.videos
        const playlists = r.playlists
        const accounts = r.accounts
        const firstResult = videos[ 0 ]
        let urlVideo = firstResult.url
        let nameURL = firstResult.title
        let viewsNumber = firstResult.views
        let channelName = firstResult.author.name
        let durationTimestamp = firstResult.timestamp
        let validateURL = ytdl.validateURL(search)
        let idURL = ytdl.getURLVideoID

        if (!validateURL) {
          let a = new Discord.RichEmbed()
          .addField(`Reproduzindo agora:`, `**[${nameURL}](${urlVideo})**, de **${channelName}**`)
          .setColor('RANDOM')
          message.channel.send(a)
        }
        voiceChannel.join()
          .then(connection => {
            let stream = ytdl(`${urlVideo}`, {filter: 'audioonly'});
            let DJ = connection.playStream(stream, streamOptions)
            DJ.on('end', () => {
              voiceChannel.leave();
        })})})}
      
                    return;
    
    }

   if (command === 'avatar') {
     let memberAvatar = message.mentions.members.first() || arg[0] || message.member
     if (memberAvatar === arg[0]) memberAvatar = message.guild.members.get(arg[0]);
    let embed = new Discord.RichEmbed()
  .addField(`:frame_photo: Aqui está o avatar`,`**Clique [AQUI](${memberAvatar.user.avatarURL}) para baixar**`)
  .setImage(memberAvatar.user.displayAvatarURL)
  .setColor('RED')
  .setFooter(`Avatar solicitado por ${message.author.username}`, message.author.displayAvatarURL)
    message.channel.send(embed)
   
   return;
   }
  
    if (command === 'leave') {
      let member = message.author
      var channelInfoMessage = await message.channel.send(`OK, me desconectei do canal. Reaja com ${sys.emoji.yes} para ver as informações do canal.`);
      var channelInfoReact = await channelInfoMessage.react('675434749795368985');
      var thisChannel = message.guild.channels.get(message.member.voiceChannelID);
      let avatarMember = message.author.displayAvatarURL
      let channelId1 = message.member.voiceChannelID;
      let voiceChannel = message.guild.channels.find(channel => channel.id === channelId1);
      voiceChannel.leave()
        var i = setInterval(async function(){
          if (message.id != member.lastMessageID) return;
          
          if (channelInfoReact.count > 1 && channelInfoReact.users.get(member.id)) {
            clearInterval(i);
            var e = new Discord.RichEmbed()
              .setColor('RANDOM')
              .setThumbnail('https://www.freeiconspng.com/uploads/sound-png-31.png')
              .setDescription('Informações sobre o canal *'+thisChannel.name+'*')
              .addField('ID', `${thisChannel.id}`, true)
              .addField('Limite de pessoas', `${thisChannel.userLimit}`)
            channelInfoMessage.edit(e)
          }
        }, 100)
      
        return;
      
    }
  
  if (command === 'voiceinfo') {
    var channel = message.guild.channels.get(message.member.voiceChannelID)
    var e = new Discord.RichEmbed()
      .setColor('RANDOM')
      .setThumbnail('https://cdn.pixabay.com/photo/2017/11/10/04/47/sound-2935370_960_720.png')
      .setDescription('Informações sobre o canal *'+channel.name+'*')
      .addField('ID', `${channel.id}`, true)
      .addField('Limite de pessoas', `${channel.userLimit}`, true)
    message.channel.send(e); return;
  }
  
  if (command === 'lyrics') {
    var song = arg.join(' ').split(' - ')
    if (!arg.join(' ')) return message.reply('modo de usar: '+sys.p+'lyrics <música> - <artista> (espaço entre a música e o artista nescessários!)');
    
    ytSearch( song[0]+' - '+song[1], function ( err, r ) {

    if ( err ) throw err
    const videos = r.videos
    const firstResult = videos[ 0 ]
    let urlVideo = firstResult.url
    
    var songL = '';
    lyricFind.get(song[1], song[0], (err, res) => {
      if(err) {
        message.reply('Ocorreu um erro: `'+err+'`')
      } else {
          songL = res.lyrics.split(999)
          for(var i=0;i<res.lyrics.split(999).length;i++) {
            if (!songL || songL === '' || songL === undefined) return;
            if (i === 0) {
              var e = new Discord.RichEmbed()
              .setTitle(`Letra da música: **${song[0]}**`)
              .setURL(urlVideo)
              .setDescription(songL[i])
              .setColor('RANDOM')
            message.channel.send(e);
              i++;
              return;
            }
            var e = new Discord.RichEmbed()
              .setDescription(songL[i])
              .setColor('RANDOM')
            message.channel.send(e);
          }
      }})
    });
    
    return;
    
  }
  
  if (command) {
    message.channel.send('Desculpe-me, porém este comando não existe!')
  }
  
});

client.login(process.env.T)
