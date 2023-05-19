export function getRoleColor(guild) {
  let roleHexColor = '';
  if (!guild.members.me.roles.color)
    roleHexColor = '#5865F2';
  else
    roleHexColor = '#' + guild.members.me.roles.color.color.toString(16);
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