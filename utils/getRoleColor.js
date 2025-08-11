export function getRoleColor(guild) {
  const highestRole = guild.members.me?.roles.color;
  let roleHexColor;
  let roleColor;

  if (!highestRole) {
    roleHexColor = '#5865F2';
    roleColor = 5793266; // Decimal equivalent of #5865F2
  } else {
    roleHexColor = `#${highestRole.color.toString(16).padStart(6, '0')}`;
    roleColor = highestRole.color;
  }

  const r = parseInt(roleHexColor.slice(1, 3), 16);
  const g = parseInt(roleHexColor.slice(3, 5), 16);
  const b = parseInt(roleHexColor.slice(5, 7), 16);

  return {
    rgb: `rgb(${r}, ${g}, ${b})`,
    rgba: `rgba(${r}, ${g}, ${b}, 0.3)`,
    hex: roleColor,
  };
}