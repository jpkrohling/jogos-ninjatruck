export const levels = [
  {
    number: 1,
    duration: 45,
    spawnInterval: 3,
    enemySpeed: 60,
    maxEnemies: 5,
    turboAvailable: false,
    shakeAvailable: false,
    unlockMessage: null
  },
  {
    number: 2,
    duration: 60,
    spawnInterval: 2,
    enemySpeed: 90,
    maxEnemies: 8,
    turboAvailable: true,
    shakeAvailable: false,
    unlockMessage: 'Turbo desbloqueado! Aperte ESPACO pra acelerar!'
  },
  {
    number: 3,
    duration: 75,
    spawnInterval: 1.5,
    enemySpeed: 120,
    maxEnemies: 12,
    turboAvailable: true,
    shakeAvailable: true,
    unlockMessage: 'Sacudir desbloqueado! Aperte E pra derrubar inimigos!'
  },
  {
    number: 4,
    duration: 90,
    spawnInterval: 1,
    enemySpeed: 150,
    maxEnemies: 16,
    turboAvailable: true,
    shakeAvailable: true,
    unlockMessage: null
  },
  {
    number: 5,
    duration: 120,
    spawnInterval: 0.7,
    enemySpeed: 180,
    maxEnemies: 20,
    turboAvailable: true,
    shakeAvailable: true,
    unlockMessage: null
  }
];

export function getLevel(number) {
  return levels[number - 1];
}
