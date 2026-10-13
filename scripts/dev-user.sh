#!/usr/bin/env sh
# Заводит локальную учётку для разработки фронтенда.
# Только для бэкенда на localhost — в прод этим скриптом не ходить.
set -e

API="${API:-http://localhost:8080/api/v1}"
LOGIN="${LOGIN:-devfront}"
EMAIL="${EMAIL:-devfront@localhost.test}"
PASSWORD="${PASSWORD:-devfront-local-1}"

case "$API" in
  http://localhost:*|http://127.0.0.1:*) ;;
  *) echo "Отказ: скрипт работает только с localhost, а API=$API"; exit 1 ;;
esac

curl -s -X POST "$API/auth/register" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"username\":\"$LOGIN\",\"password\":\"$PASSWORD\",\"displayName\":\"Dev Frontend\"}"

echo
echo "Логин: $LOGIN / пароль: $PASSWORD"
