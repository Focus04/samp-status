import { EmbedBuilder, SlashCommandBuilder, MessageFlags } from 'discord.js';
import { getRoleColor } from '../../utils/getRoleColor.js';

const WEATHER_ICONS = {
  '01d': 'https://imgur.com/IP2y4yk',
  '01n': 'https://imgur.com/fJFxWCv',
  '02d': 'https://imgur.com/3W0KIIH',
  '02n': 'https://imgur.com/U1V15j7',
  '03d': 'https://imgur.com/MZTJBDX',
  '03n': 'https://imgur.com/mERm42d',
  '04d': 'https://imgur.com/3UDtHKz',
  '04n': 'https://imgur.com/04d9Csw',
  '09d': 'https://imgur.com/pyowl9c',
  '09n': 'https://imgur.com/8wCPSIV',
  '10d': 'https://imgur.com/TPsczXq',
  '10n': 'https://imgur.com/T8iMjEA',
  '11d': 'https://imgur.com/sddu7KK',
  '11n': 'https://imgur.com/6COrKvi',
  '13d': 'https://imgur.com/a1SNLYo',
  '13n': 'https://imgur.com/X1Yzfqi',
  '50d': 'https://imgur.com/61ogWDF',
  '50n': 'https://imgur.com/ObWRUTp',
};

export default {
  data: new SlashCommandBuilder()
    .setName('weather')
    .setDescription('Tells you information about the weather in a given location')
    .addStringOption((option) => option
      .setName('city')
      .setDescription('The city you want to search')
      .setRequired(true)),
  async execute(interaction) {
    const location = interaction.options.getString('city');
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${process.env.weatherid}`);
    const data = await response.json();

    if (data.message === 'city not found') {
      return interaction.reply({ content: `Couldn't find any data information for \`${location}\``, flags: MessageFlags.Ephemeral });
    }

    const icon = WEATHER_ICONS[data.weather[0].icon];
    const color = getRoleColor(interaction.guild);
    const weatherEmbed = new EmbedBuilder()
      .setColor(color.hex)
      .setTitle(`${Math.floor(data.main.temp)}°C in ${data.name}, ${data.sys.country}`)
      .addFields(
        { name: 'Weather Conditions', value: data.weather[0].main },
        { name: 'Cloudiness', value: `${data.clouds.all}%` },
        { name: 'Humidity', value: `${data.main.humidity}%` },
        { name: 'Pressure', value: `${Math.floor(data.main.pressure / 1.3)} mm Hg` },
        { name: 'Wind', value: `${Math.floor(data.wind.speed * 3.6)} km/h, ${data.wind.deg}°` },
      )
      .setThumbnail(`${icon}.png`)
      .setTimestamp();

    interaction.reply({ embeds: [weatherEmbed] });
  },
};