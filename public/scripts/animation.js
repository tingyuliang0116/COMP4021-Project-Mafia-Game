const animateMovement = (keys, player, team) => {
  const runningKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
  if (
    keys.some((key) => runningKeys.includes(key)) &&
    !player.anims.isPlaying
  ) {
    team == 'mafia' ? player.play('mafia_running') : player.play('townPeople_running');
  } else if (
    !keys.some((key) => runningKeys.includes(key)) &&
    player.anims.isPlaying
  ) {
    team == 'mafia' ? player.stop('mafia_running') : player.stop('townPeople_running');
  }
};
