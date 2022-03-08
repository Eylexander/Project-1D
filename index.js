const axios = require('axios');
const chalk = require('chalk');
const moment = require('moment');
const { token, prefix, newsapi, admin } = require('./settings.json');

const { Client, MessageEmbed, Intents, Permissions } = require('discord.js');
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
    ]
});

console.log(chalk.grey(`Time Format : MM-DD HH:mm:ss.SSS`))
const log = message => {console.log(`[${moment().format('MM-DD HH:mm:ss.SSS')}] ${message}`)};

client.on('ready', () => {
    var interval = setInterval (function () {
        client.user.setActivity(`${prefix}help`);
    }, 1* 3000);
    log(chalk.white.bold(`${client.user.tag}`) + (` is `) + chalk.black.bgGreen(`ON`) + (`.`));
    log(chalk.black.bgWhite(`${client.guilds.cache.size} Servers`) + (` - `) + chalk.black.bgWhite(`${eval(client.guilds.cache.map(g => g.memberCount).join(' + '))} Users`) + (`.`));
});

client.on('messageCreate', (message) => {
    if (message.content.startsWith(prefix)) {
        const args = message.content.slice(prefix.length).split(' ');
        const command = args.shift().toLowerCase();
        switch (command) {
            case 'ping':
                message.channel.send(`Pong! Latency is ${Date.now() - message.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms.`);
                break;

            case 'clear':
                if (!message.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) return message.channel.send("You need `manage_messages` permission to execute this command.").then(message => {setTimeout(() => {message.delete()}, 2500)});
                if(!Number(args[0])) return message.channel.send("You need to enter a valid amount.").then(message => {setTimeout(() => {message.delete()}, 2500)});
                message.channel.bulkDelete(Number(args[0]) + 1)
                    .then(() => {
                    message.channel.send(`Cleared ${args[0]} messages.`)
                        .then(message => {
                            setTimeout(() => {message.delete()}, 2500);
                        });
                });
                break;

            case 'crypto' || 'check':
                if (args.length !== 2) {
                    return message.reply(
                        `You must provide the crypto and the currency you want to compare:\n${prefix}crypto [CryptoCurrency] [Currency]`
                    );
                } else {
                    const coin = args[0].toLocaleLowerCase(); // Get rid off the grammar
                    const vsCurrency = args[1].toLocaleLowerCase();
                    axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=${vsCurrency}`) // Get crypto price from coingecko API
                        .then(resp => {        
                            if (!resp.data[coin][vsCurrency]) throw Error(); // Check if data exists
                            const crypto = coin.charAt(0).toUpperCase() + coin.slice(1);
                            const currency = vsCurrency.toUpperCase();

                            const embed = new MessageEmbed()
                                .setColor('RANDOM')
                                .setTitle("CoinGecko API")
                                .setURL(`https://www.coingecko.com/en/coins/${coin}`)
                                .setThumbnail(client.user.displayAvatarURL({ dynamic : true }))
                                .addFields(
                                    {name: `${crypto} in ${currency}`, value:`${resp.data[coin][vsCurrency]}`, inline: true}
                                )
                                .setImage('https://static.coingecko.com/s/coingecko-logo-d13d6bcceddbb003f146b33c2f7e8193d72b93bb343d38e392897c3df3e78bdd.png')
                                .setTimestamp()
                                .setFooter({ text :`Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true })})
                                
                            return message.channel.send({ embeds: [embed] });
                        })
                        .catch(err => {
                            log(err)
                            return message.reply(
                                `Please check your inputs.\n${prefix}crypto [CryptoCurrency] [Currency]`
                            );
                        })
                }
                break;

            case 'news':
                if (!args[0]) {
                    axios.get(`https://newsapi.org/v2/everything?q=crypto&apiKey=${newsapi}&pageSize=1&sortBy=publishedAt&language=en`)
                        .then(resp => {
                        const {
                            title,
                            source: { name },
                            description,
                            url,
                            urlToImage,
                        } = resp.data.articles[0];
            
                        const embed = new MessageEmbed()
                            .setAuthor({ name: 'News', iconURL: client.user.displayAvatarURL({ dynamic : true }) })
                            .setTitle(title)
                            .setURL(url)
                            .setColor('RANDOM')
                            .setThumbnail(client.user.displayAvatarURL({ dynamic : true }))
                            .addFields(
                                {name: `Article:`, value: `${description}`, inline: false},
                                {name: name, value: `${url}`, inline: false}
                            )
                            .setImage(urlToImage)
                            .setTimestamp()
                            .setFooter({ text :`Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true })})
                            
                        return message.channel.send({ embeds: [embed] })
                    })

                } else if (args[0]) {
                    axios.get(`https://newsapi.org/v2/everything?q=${args[0].toLowerCase()}&apiKey=${newsapi}&pageSize=1&sortBy=publishedAt&language=en`)
                        .then(resp => {

                            // Destructure useful data from response
                            const {
                                title,
                                source: { name },
                                description,
                                url,
                                urlToImage,
                            } = resp.data.articles[0];
            
                            const embed = new MessageEmbed()
                                .setAuthor({ name: 'News', iconURL: client.user.displayAvatarURL({ dynamic : true }) })
                                .setTitle(title)
                                .setURL(url)
                                .setColor('RANDOM')
                                .setThumbnail(client.user.displayAvatarURL({ dynamic : true }))
                                .addFields(
                                    {name: `Article:`, value: `${description}`, inline: false},
                                    {name: name, value: `${url}`, inline: false}
                                )
                                .setImage(urlToImage)
                                .setTimestamp()
                                .setFooter({ text :`Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true })})
                                
                            return message.channel.send({ embeds: [embed] })
                        })
                }
                break;

            case 'inflationrate' || 'rate':
                if (args.length !== 2) return message.channel.send(`You must provide arguments. Refer to help: \`${prefix}inflationrate [country] [Type of Graphic]\`.`);
                const params1 = args[0].toLocaleLowerCase();
                const countryname = params1.charAt(0).toUpperCase() + params1.slice(1);
                const params2 = args[1].charAt(0).toUpperCase() + args[1].slice(1);

                const inflationrate = new MessageEmbed()
                    .setAuthor({ name: 'InflationRate', iconURL: client.user.displayAvatarURL({ dynamic : true }) })
                    .setColor('RANDOM')
                    .setThumbnail(client.user.displayAvatarURL({ dynamic : true }))
                    .setDescription(`Monthly Inflation rate in ${countryname}`)
                    .setImage(`https://www.statbureau.org/en/${params1}/monthly-inflation-all-time-mom.png?width=1028&height=1028&chartType=${params2}`)
                    .setTimestamp()
                    .setFooter({ text :`Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true })})
                    
                message.channel.send({ embeds: [inflationrate] })
                break;

            case 'inflation' || 'see':
                if (args.length !== 3) return message.channel.send(`You must provide some arguments here. Refer to help: \`${prefix}inflation [country] [StartDate] [EndDate]\``)
                const listedcountry = args[0].charAt(0).toUpperCase() + args[0].slice(1);
                const startDate = args[1].toLocaleLowerCase()
                const endDate = args[2].toLocaleLowerCase()
                axios.get(`https://www.statbureau.org/calculate-inflation-price-jsonp?jsoncallback=?`, {
                    country: args[0].toLocaleLowerCase(),
                    start: startDate,
                    end: endDate,
                    amount: 100,
                    format: true
                })
                    .then(resp => {
                        // const rateembed = new MessageEmbed()
                        //     .setAuthor({ name: 'InflationRate', iconURL: client.user.displayAvatarURL({ dynamic : true }) })
                        //     .setColor('RANDOM')
                        //     .setThumbnail(client.user.displayAvatarURL({ dynamic : true }))
                        //     .addFields(
                        //         {name: `Parameters`, value: `Country: ${listedcountry}\n Intervalle: ${startDate} - ${endDate}`, inline: false}
                        //     )
                        //     .setTimestamp()
                        //     .setFooter({ text :`Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true })})
                            
                        // message.channel.send({ embeds: [rateembed] })

                        log(resp.data.data)
                    })
                    // .catch(err => {
                    //     log(err)
                    //     log(resp.data.data)
                    // })
                break;

            case 'help':
                const graphicslist = ['Area','Bar','BoxPlot','Bubble','Candlestick','Column','Doughnut','ErrorBar','FastLine','FastPoint','Funnel','Kagi','Line','Pie','Point','PointAndFigure','Polar','Pyramid','Radar','Range','RangeBar','RangeColumn','Renko','Spline','SplineArea','SplineRange','StackedArea','StackedArea100','StackedBar','StackedBar100','StackedColumn','StackedColumn100','StepLine','Stock','ThreeLineBreak']
                const countrylist = ['Belarus','Brazil','Canada','European-Union','Eurozone','France','Germany','Greece','India','Japan','Kazakhstan','Mexico','Russia','Spain','Turkey','Ukraine','United-Kingdom','United-States'];
                
                if (!args[0]) {
                    const helpembed = new MessageEmbed()
                        .setAuthor({ name: 'Help', iconURL: client.user.displayAvatarURL({ dynamic : true }) })
                        .setTitle(client.user.username + ' commands')
                        .setColor('RANDOM')
                        .setThumbnail(client.user.displayAvatarURL({ dynamic : true }))
                        .addFields(
                            {name: `ping`, value: `Pong!`, inline: false},
                            {name: `clear`, value: `Removes messages as you wish!\n \`${prefix}clear [amount]\``, inline: false},
                            {name: `crypto`, value: `Check the price of your favorite CryptoCurrency!\n \`${prefix}crypto [CryptoCurrency] [Currency]\``, inline: false},
                            {name: `news`, value: `Get all the news you want about any subject!\n \`${prefix}news [subject]\``, inline: false},
                            {name: `inflationrate`, value: `See the graphic of Inflation of your favorite country!\n \`${prefix}inflationrate [country] [Type of Graphic]\` \n \`${prefix}help inflationrate\``, inline: false},
                            {name: `inflation`, value: `Returns the Inflation Rate of your favorite country!\n \`${prefix}infaltion [country] [StartDate] [EndDate]\` \n \`${prefix}help inflation\``, inline: false},
                            {name: `memes`, value: `Check some Memes!\n \`${prefix}memes\``, inline: false},
                            {name: `invite`, value: `Invite me if you want!`, inline: false},
                            {name: `help`, value: `Here you go!`, inline: false},
                        )
                        .setTimestamp()
                        .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true })})

                    message.channel.send({ embeds: [helpembed] })
                } else if (['inflationrate','rate'].includes(args[0])) {
                    const inflationrateembed = new MessageEmbed()
                        .setAuthor({ name: 'Help', iconURL: client.user.displayAvatarURL({ dynamic : true }) })
                        .setTitle('InflationRate Command')
                        .setColor('RANDOM')
                        .setThumbnail(client.user.displayAvatarURL({ dynamic : true }))
                        .addFields(
                            {name: `Countries`, value: `${countrylist.join(', ')}`, inline: false},
                            {name: `Graphics`, value: `${graphicslist.join(', ')}`, inline: false},
                        )
                        .setTimestamp()
                        .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true })})

                    message.channel.send({ embeds: [inflationrateembed]})
                } else if (['inflation','burning'].includes(args[0])) {
                    const inflationembed = new MessageEmbed()
                        .setAuthor({ name: 'Help', iconURL: client.user.displayAvatarURL({ dynamic : true }) })
                        .setTitle('Inflation Command')
                        .setColor('RANDOM')
                        .setThumbnail(client.user.displayAvatarURL({ dynamic : true }))
                        .addFields(
                            {name: `Countries`, value: `${countrylist.join(' ')}`, inline: false},
                            {name: `Format`, value: `Usage: \`${prefix}infaltion [country] [StartDate] [EndDate]\` \nExample: \`${prefix}infaltion eurozone [StartDate] [EndDate]\``, inline: false},
                        )
                        .setTimestamp()
                        .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true })})

                    message.channel.send({ embeds: [inflationembed]})
                }
                break;
        
            case 'memes':
                const { memes } = require('./memes/webhosted.json');
                const memefunction = memes[Math.floor(Math.random()*memes.length)];

                const memeembed = new MessageEmbed()
                    .setTitle('If Bug, click Here')
                    .setURL(memefunction)
                    .setColor('RANDOM')
                    .setImage(memefunction)
                    .setTimestamp()
                    .setFooter({ text :`Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true })})

                message.channel.send({embeds: [memeembed] })
                break;

            case 'stop':
                try {
                    if (!message.author.id === admin) return;
                    log(chalk.white.bold(`${client.user.tag}`) + (` is `) + chalk.black.bgRed(`OFF`) + (`.`));
                    setTimeout(() => {message.delete()}, 1000)
                    message.channel.send('Turning off...').then(message => {
                        setTimeout(() => { message.delete()}, 1500) })
                        setTimeout(() => { client.destroy() }, 3000);
                        setTimeout(() => { process.exit(1) }, 3000);
                } catch (err) {
                    log(err)
                }
                break;
            
            case 'invite':
                message.channel.send(`You can invite my bot on your server with this URL:\n https://discord.com/api/oauth2/authorize?client_id=946083059042766938&permissions=125968&scope=bot`)
                break;
        }
    }
});

client.login(token);