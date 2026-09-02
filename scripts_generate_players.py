import json
import re
from pathlib import Path

SOURCE = Path("data/players/openfootball")
OUTPUT = Path("data/players/generated/world_players.json")

players = []
seen = set()

def clean_name(line):
    line = line.strip()

    if not line or line.startswith("#"):
        return None

    # Certaines bases utilisent | pour plusieurs variantes
    parts = [p.strip() for p in line.split("|") if p.strip()]

    if not parts:
        return None

    # On prend le nom le plus lisible
    name = parts[-1] if len(parts) > 1 else parts[0]

    # Supprime les informations de date de naissance
    name = re.sub(
        r",?\s*\d{1,2}\s+[A-Za-zÀ-ÿ]+\s+\d{4}.*$",
        "",
        name
    )

    name = re.sub(r"\([^)]*\)", "", name)
    name = re.sub(r"\[[^\]]*\]", "", name)

    name = re.sub(r"\s+", " ", name).strip()

    if len(name) < 3 or len(name) > 100:
        return None

    if "=" in name or ":" in name:
        return None

    return name


def get_country(file):
    parts = file.parts

    # Ignore complètement attic
    if "attic" in parts:
        return None

    # Cherche le dossier juste avant le fichier
    if len(parts) >= 2:
        country = parts[-2]

        return country.replace("-", " ").replace("_", " ").title()

    return None


for file in SOURCE.rglob("*.players.txt"):

    country = get_country(file)

    if not country:
        continue

    try:
        text = file.read_text(
            encoding="utf-8",
            errors="ignore"
        )
    except Exception:
        continue

    for line in text.splitlines():

        name = clean_name(line)

        if not name:
            continue

        key = re.sub(
            r"[^a-z0-9]",
            "",
            name.lower()
        )

        if not key or key in seen:
            continue

        seen.add(key)

        players.append({
            "id": f"player-{len(players)+1}",
            "name": name,
            "country": country,
            "position": "",
            "club": "",
            "era": "historical",
            "birthYear": None,
            "deathYear": None,
            "legend": False,
            "photo": ""
        })


players.sort(
    key=lambda player: player["name"].lower()
)

for index, player in enumerate(players, 1):
    player["id"] = f"player-{index}"


OUTPUT.parent.mkdir(
    parents=True,
    exist_ok=True
)

OUTPUT.write_text(
    json.dumps(
        players,
        ensure_ascii=False,
        indent=2
    ),
    encoding="utf-8"
)

print("=" * 50)
print("✅ BASE MONDIALE GÉNÉRÉE")
print("=" * 50)
print(f"👤 Joueurs : {len(players)}")
print(f"🌍 Pays : {len(set(p['country'] for p in players))}")
print(f"📁 Fichier : {OUTPUT}")
print("=" * 50)
