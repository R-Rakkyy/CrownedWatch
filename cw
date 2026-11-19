#!/bin/sh

cd "$(dirname "$0")" || exit 1
case "$1" in
    
    setup) # ./cw setup [domain]: no domain = plain http on port 80 (local, or behind your own proxy)
        if [ -n "$2" ]; then printf 'DOMAIN=%s\nCROWNED_HTTPS=1\n' "$2" > .env; else : > .env; fi
        docker compose up -d --build && echo "up. next: ./cw user NAME admin" ;;
    
    up) # ./cw up
        docker compose up -d --build ;;
    
    down) # ./cw down
        docker compose down ;;
    
    update) # ./cw update
        docker compose up -d --build ;;
    
    logs) # ./cw logs
        docker compose logs -f --tail 100 ;;
    
    user) # ./cw user NAME admin|guest
        [ -z "$2" ] && echo "usage: ./cw user NAME admin|guest" && exit 1
        [ -z "$3" ] && echo "usage: ./cw user NAME admin|guest" && exit 1
        docker compose exec app python -m crownedwatch.auth "$2" "${3:-guest}" ;;
    
    backup) # ./cw backup
        tar czf "crownedwatch-$(date +%F).tar.gz" data --exclude=data/media && echo "saved without videos (data/media is the videos)" ;;
    
    reset) # ./cw reset
        printf 'Delete ALL data (users, library, videos)? type yes: '; read a
        [ "$a" = yes ] && docker compose down && rm -rf data && echo "empty" ;;
    
    *)
        echo "usage: ./cw setup [domain] | up | down | update | logs | user NAME admin|guest | backup | reset" ;;
esac
