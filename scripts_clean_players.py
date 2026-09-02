import json
import re
from pathlib import Path

INPUT = Path("data/players/generated/world_players.json")
OUTPUT = Path("data/players/generated/world_players_clean.json")

with open(INPUT, encoding="utf-8") as f:
    players = json.load(f)

def clean_player(player):
    name = player.get("name", "").strip()

    # Retirer les informations physiques
    name = re.sub(
        r",\s*[DMFG],\s*[-0-9., ]*m?,?\s*b\.?.*$",
        "",
        name,
        flags=re.I
    )

    name = re.sub(
        r",\s*(D|M|F|G),.*$",
        "",
        name,
        flags=re.I
    )

    name = name.strip(" ,.")

    # Détection simple de position
    raw = player.get("name", "")

    position = player.get("position", "")

    if re.search(r",\s*G[, ]", raw, re.I):
        position = "Gardien"
    elif re.search(r",\s*D[, ]", raw, re.I):
        position = "Défenseur"
    elif re.search(r",\s*M[, ]", raw, re.I):
        position = "Milieu"
    elif re.search(r",\s*F[, ]", raw, re.I):
        position = "Attaquant"

    player["name"] = name
    player["position"] = position

    return player


cleaned = []

seen = set()

for player in players:

    player = clean_player(player)

    name = player["name"]

    if len(name) < 3:
        continue

    key = re.sub(
        r"[^a-z0-9]",
        "",
        name.lower()
    )

    if key in seen:
        continue

    seen.add(key)

    cleaned.append(player)


for i, player in enumerate(cleaned, 1):
    player["id"] = f"player-{i}"


with open(
    OUTPUT,
    "w",
    encoding="utf-8"
) as f:
    json.dump(
        cleaned,
        f,
        ensure_ascii=False,
        indent=2
    )


print("=" * 50)
print("✅ NETTOYAGE TERMINÉ")
print("=" * 50)
print("👤 Joueurs :", len(cleaned))
print("🌍 Pays :", len(set(p["country"] for p in cleaned)))
print("📁 :", OUTPUT)
print("=" * 50)
