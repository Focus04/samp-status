module.exports = {
  getRoleColor: (guild) => {
    let roleHexColor;
    let highestRole = { position: -1 };
    guild.me.roles.cache.forEach((role) => {
      if (role.position > highestRole.position && role.color != 0) highestRole = role;
    });
    if (highestRole.position === -1) roleHexColor = '#b9bbbe';
    else roleHexColor = '#' + highestRole.color.toString(16);
    let r = parseInt(roleHexColor.slice(1, 3), 16);
    let g = parseInt(roleHexColor.slice(3, 5), 16);
    let b = parseInt(roleHexColor.slice(5, 7), 16);
    let color = {
      rgb: `rgb(${r}, ${g}, ${b})`,
      rgba: `rgba(${r}, ${g}, ${b}, 0.1)`,
      hex: roleHexColor
    };
    return color;
  }
}