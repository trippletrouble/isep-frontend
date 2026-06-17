import { ApiError } from '@/api/client'

const ERROR_MESSAGES: Record<string, string> = {
  NOT_YOUR_TURN: 'Du bist gerade nicht an der Reihe.',
  DICE_ALREADY_ROLLED: 'Du hast bereits gewürfelt – bewege jetzt eine Figur.',
  DICE_NOT_ROLLED: 'Erst würfeln, dann ziehen.',
  LOBBY_FULL: 'Die Lobby ist leider voll.',
  GAME_ALREADY_STARTED: 'Das Spiel läuft bereits.',
  PLAYER_ALREADY_IN_GAME: 'Du bist bereits in dieser Session.',
  INVALID_INVITE_TOKEN: ***ENTFERNT*** Einladungslink ist ungültig oder abgelaufen.',
  INVALID_MOVE: 'Ungültiger Zug.',
  NOT_FOUND: 'Session nicht gefunden.',
  UNAUTHORIZED: 'Bitte melde dich erneut an.',
  RATE_LIMIT_EXCEEDED: 'Zu viele Anfragen – kurz warten.',
  NOT_ENOUGH_PLAYERS: 'Mindestens 2 Spieler werden benötigt.',
  GAME_NOT_FINISHED: 'Das Spiel ist noch nicht beendet.',
  GAME_NOT_IN_PROGRESS: 'Das Spiel läuft gerade nicht.',
  VALIDATION_ERROR: 'Ungültige Eingabe.',
  FORBIDDEN: 'Diese Aktion ist nur dem Host erlaubt.',
}

export function getErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    return ERROR_MESSAGES[err.code] ?? err.message
  }
  if (err instanceof Error) return err.message
  return 'Ein unbekannter Fehler ist aufgetreten.'
}
