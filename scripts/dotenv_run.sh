#!/bin/sh
eval $(cat .env | grep -v "^#" | tr -s '\n' | awk -F= '{print $1"='\''"$2"'\''"}' | grep -v "^=" | tr '\n' ' ') "$*"