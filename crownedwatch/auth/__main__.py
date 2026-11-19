import sys

from . import users

if len(sys.argv) != 3:
    sys.exit("usage: python -m crownedwatch.auth NAME admin|guest")

name, role = sys.argv[1:]

try:
    key = users.add(name, role)
except ValueError as error:
    sys.exit(str(error))

print(f"key for {name} (save it, not shown again): {key}")
