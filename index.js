const axios = require('axios');
const chalk = require('chalk');
const moment = require('moment');
const { token, prefix, newsapi } = require('./settings.json');

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
                message.channel.send(`Pong! Latency is ${Date.now() - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms.`);
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
                        .then(response => {
                            const data = response;
                            // const price = data[coin][vsCurrency];
        
                            // if (!data[coin][vsCurrency]) throw Error(); // Check if data exists
                            const crypto = coin.charAt(0).toUpperCase() + coin.slice(1);
                            const currency = vsCurrency.toUpperCase();

                            log(data.coin)

                            // const embed = new MessageEmbed()
                            //     .setColor('RANDOM')
                            //     .setTitle("CoinGecko API")
                            //     .setURL(`https://www.coingecko.com/en/coins/${coin}`)
                            //     .setThumbnail(client.user.displayAvatarURL({ dynamic : true }))
                            //     .addFields(
                            //         {name: `${crypto} in ${currency}`, value:`${data[coin][vsCurrency]}`, inline: true}
                            //     )
                            //     .setImage('https://static.coingecko.com/s/coingecko-logo-d13d6bcceddbb003f146b33c2f7e8193d72b93bb343d38e392897c3df3e78bdd.png')
                            //     .setTimestamp()
                            //     .setFooter({ name:`Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true })})
                                
                            // return message.channel.send({ embeds: [embed] });
                        })
                        // .catch(err => {
                        //     log(err)
                        //     return message.reply(
                        //         `Please check your inputs.\n${prefix}crypto [CryptoCurrency] [Currency]`
                        //     );
                        // })
                }
                break;

            case 'news':
                if (!args[0]) {
                    axios.get(`https://newsapi.org/v2/everything?q=crypto&apiKey=${newsapi}&pageSize=1&sortBy=publishedAt&language=en`).then(response => {
                        const data = response;
                        const {
                            title,
                            source: { name },
                            description,
                            url,
                            urlToImage,
                        } = data.articles[0];
            
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
                            .setFooter({ name:`Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true })})
                            
                        return message.channel.send({ embeds: [embed] })
                    })

                } else if (args[0]) {
                    axios.get(`https://newsapi.org/v2/everything?q=${args[0].toLowerCase()}&apiKey=${newsapi}&pageSize=1&sortBy=publishedAt&language=en`)
                        .then(response => {
                            const data = response;

                            // Destructure useful data from response
                            const {
                                title,
                                source: { name },
                                description,
                                url,
                                urlToImage,
                            } = data.articles[0];
            
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
                                .setFooter({ name:`Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true })})
                                
                            return message.channel.send({ embeds: [embed] })
                        })
                }
                break;

            case 'inflationrate' || 'rate':
                if (!args[0]) return message.channel.send(`You must provide arguments. Refer to help: \`${prefix}inflationrate [country] [Type of Graphic]\`.`);
                const params1 = args[0].toLocaleLowerCase();
                const contryname = params1.charAt(0).toUpperCase() + params1.slice(1);
                const params2 = args[1].charAt(0).toUpperCase() + args[1].slice(1);
                axios.get(`https://www.statbureau.org/en/${params1}/monthly-inflation-current-year-mom.png?width=1028&height=1028&chartType=${params2}`)
                    .then(response =>  {
                        const data = response;

                        const embed1 = new MessageEmbed()
                            .setAuthor({ name: 'InflationRate', iconURL: client.user.displayAvatarURL({ dynamic : true }) })
                            .setColor('RANDOM')
                            .setThumbnail(client.user.displayAvatarURL({ dynamic : true }))
                            .addFields(
                                {name: `InflationRate`, value: `Monthly Inflation Rate in ${countryname}`, inline: false}
                            )
                            .setImage(data)
                            .setTimestamp()
                            .setFooter({ name:`Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true })})
                            
                        message.channel.send({ embeds: [embed1] })
                    }).catch(err => {
                        log(err)
                        return message.reply(
                            `Please check your inputs. Refer to help: \`${prefix}inflationrate [country] [Type of Graphic]\`.`
                        );
                    })
                break;

            case 'infaltion' || 'see':
                if (!args[0]) return message.channel.send(`You must provide some arguments here. Refer to help: \`${prefix}inflation [country] [StartDate] [EndDate]\``)
                const listedcountry = args[0].charAt(0).toUpperCase() + args[0].slice(1);
                const startDate = args[1].toLocaleLowerCase()
                const endDate = args[2].toLocaleLowerCase()
                axios.get(`https://www.statbureau.org/calculate-inflation-price-jsonp`)

                const rateembed = new MessageEmbed()
                    .setAuthor({ name: 'InflationRate', iconURL: client.user.displayAvatarURL({ dynamic : true }) })
                    .setColor('RANDOM')
                    .setThumbnail(client.user.displayAvatarURL({ dynamic : true }))
                    .addFields(
                        {name: `InflationRate`, value: `Monthly Inflation Rate in `, inline: false}
                    )
                    .setImage()
                    .setTimestamp()
                    .setFooter({ name:`Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true })})
                
                message.channel.send({ embeds: [rateembed] })
                break;
            case 'help':
                const graphicslist = ['Area','Bar','BoxPlot','Bubble','Candlestick','Column','Doughnut','ErrorBar','FastLine','FastPoint','Funnel','Kagi','Line','Pie','Point','PointAndFigure','Polar','Pyramid','Radar','Range','RangeBar','RangeColumn','Renko','Spline','SplineArea','SplineRange','StackedArea','StackedArea100','StackedBar','StackedBar100','StackedColumn','StackedColumn100','StepLine','Stock','ThreeLineBreak']
                const helpembed = new MessageEmbed()
                    .setAuthor({ name: 'Help', iconURL: client.user.displayAvatarURL({ dynamic : true }) })
                    .setTitle(client.user.username + ' commands')
                    .setColor('RANDOM')
                    .setThumbnail(client.user.displayAvatarURL({ dynamic : true }))
                    .addFields(
                        {name: `ping`, value: `Pong!`, inline: false},
                        {name: `clear`, value: `Remove message as you wish!\n \`${prefix}clear [amount]\``, inline: false},
                        {name: `crypto`, value: `Check the price of your favorite CryptoCurrency!\n \`${prefix}crypto [CryptoCurrency] [Currency]\``, inline: false},
                        {name: `news`, value: `Get all the news you want about any subject!\n \`${prefix}news [subject]\``, inline: false},
                        {name: `inflationrate`, value: `See the graphic of Inflation of your favorite country!\n \`${prefix}inflationrate [country] [Type of Graphic]\``, inline: false},
                        {name: `inflation`, value: `Returns the Inflation Rate of your favorite country!\n \`${prefix}infaltion [country] [StartDate] [EndDate]\``, inline: false},
                        {name: `help`, value: `Here you go!\n \`${prefix}help\``, inline: false},
                    )
                    .setImage(data)
                    .setTimestamp()
                    .setFooter({ name:`Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true })})

        }
    }
});

client.login(token);