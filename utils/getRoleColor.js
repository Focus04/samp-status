export function getRoleColor(guild) {
  let highestRole = guild.members.me.roles.color;
  let roleHexColor, roleColor;
  if (!highestRole) roleHexColor = roleColor = '#5865F2';
  else {
    roleHexColor = '#' + highestRole.color.toString(16);
    roleColor = highestRole.color;
  }
  let r = parseInt(roleHexColor.slice(1, 3), 16);
  let g = parseInt(roleHexColor.slice(3, 5), 16);
  let b = parseInt(roleHexColor.slice(5, 7), 16);

  let color = {
    rgb: `rgb(${r}, ${g}, ${b})`,
    rgba: `rgba(${r}, ${g}, ${b}, 0.3)`,
    hex: roleColor
  };
  return color;
}