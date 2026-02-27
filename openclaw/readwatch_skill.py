"""
ReadWatch OpenClaw Skill
========================
A Python skill for OpenClaw that integrates with WhatsApp and Discord.
Parses incoming messages and hits the ReadWatch API to manage your media list.

Commands:
  movie <title>       — Add a movie
  show <title>        — Add a TV show
  anime <title>       — Add an anime
  manga <title>       — Add a manga
  remove movie <title> — Remove a movie
  list anime          — List anime entries
  list all            — List all entries
"""

import httpx
import re
from typing import Optional

# Configuration — update this to your deployed ReadWatch URL
READWATCH_API_URL = "http://localhost:3000"

CATEGORY_MAP = {
    "movie": "movie",
    "movies": "movie",
    "film": "movie",
    "show": "show",
    "shows": "show",
    "tv": "show",
    "tvshow": "show",
    "anime": "anime",
    "manga": "manga",
}

STATUS_LABELS = {
    "plan_to_watch": "Plan to Watch",
    "watching": "Watching",
    "completed": "Completed",
    "dropped": "Dropped",
}


def parse_command(message: str) -> Optional[dict]:
    """Parse an incoming message into a command dict."""
    message = message.strip().lower()

    # Remove command
    remove_match = re.match(
        r"^remove\s+(movie|show|anime|manga|tv|film)\s+(.+)", message, re.IGNORECASE
    )
    if remove_match:
        raw_cat = remove_match.group(1).lower()
        title = remove_match.group(2).strip()
        category = CATEGORY_MAP.get(raw_cat)
        if category:
            return {"action": "remove", "category": category, "title": title}

    # List command
    list_match = re.match(
        r"^list\s+(movie|show|anime|manga|tv|film|all|movies|shows)$",
        message,
        re.IGNORECASE,
    )
    if list_match:
        raw_cat = list_match.group(1).lower()
        category = CATEGORY_MAP.get(raw_cat, raw_cat)
        return {"action": "list", "category": category}

    # Add command
    add_match = re.match(
        r"^(movie|show|anime|manga|tv|film|movies|shows)\s+(.+)", message, re.IGNORECASE
    )
    if add_match:
        raw_cat = add_match.group(1).lower()
        title = add_match.group(2).strip()
        category = CATEGORY_MAP.get(raw_cat)
        if category:
            return {"action": "add", "category": category, "title": title}

    return None


async def handle_add(category: str, title: str) -> str:
    """Add a media entry via the ReadWatch API."""
    async with httpx.AsyncClient(timeout=15) as client:
        res = await client.post(
            f"{READWATCH_API_URL}/api/add",
            json={
                "title": title,
                "category": category,
                "status": "plan_to_watch",
            },
        )

    if res.status_code == 200:
        data = res.json()
        entry = data.get("entry", {})
        poster = entry.get("poster_url", "")
        name = entry.get("title", title)
        return (
            f"Added '{name}' to your {category} list!\n{poster}"
            if poster
            else f"Added '{name}' to your {category} list!"
        )
    else:
        error = res.json().get("error", "Unknown error")
        return f"Failed to add '{title}': {error}"


async def handle_remove(category: str, title: str) -> str:
    """Remove a media entry via the ReadWatch API."""
    async with httpx.AsyncClient(timeout=15) as client:
        res = await client.post(
            f"{READWATCH_API_URL}/api/remove",
            json={
                "title": title,
                "category": category,
            },
        )

    if res.status_code == 200:
        data = res.json()
        removed = data.get("removed", [])
        if isinstance(removed, list):
            return f"Removed: {', '.join(removed)}"
        return f"Removed: {removed}"
    else:
        error = res.json().get("error", "Unknown error")
        return f"Failed to remove '{title}': {error}"


async def handle_list(category: str) -> str:
    """List media entries via the ReadWatch API."""
    params = {}
    if category != "all":
        params["category"] = category

    async with httpx.AsyncClient(timeout=15) as client:
        res = await client.get(
            f"{READWATCH_API_URL}/api/list",
            params=params,
        )

    if res.status_code == 200:
        data = res.json()
        entries = data.get("entries", [])

        if not entries:
            label = category if category != "all" else "media"
            return f"No {label} entries found."

        lines = []
        for e in entries:
            status = STATUS_LABELS.get(e.get("status", ""), e.get("status", ""))
            lines.append(f"• {e['title']} [{status}]")

        header = f"Your {category} list:" if category != "all" else "Your full list:"
        return f"{header}\n" + "\n".join(lines)
    else:
        error = res.json().get("error", "Unknown error")
        return f"Failed to fetch list: {error}"


async def readwatch_skill(message: str) -> str:
    """
    Main entry point for the OpenClaw skill.
    Call this function with the user's message from WhatsApp or Discord.

    Returns a response string to send back to the user.
    """
    command = parse_command(message)

    if command is None:
        return (
            "I didn't understand that. Try:\n"
            "• movie Inception\n"
            "• show Breaking Bad\n"
            "• anime Solo Leveling\n"
            "• manga Berserk\n"
            "• remove movie Inception\n"
            "• list anime\n"
            "• list all"
        )

    action = command["action"]

    if action == "add":
        return await handle_add(command["category"], command["title"])
    elif action == "remove":
        return await handle_remove(command["category"], command["title"])
    elif action == "list":
        return await handle_list(command["category"])

    return "Something went wrong."


# For testing locally
if __name__ == "__main__":
    import asyncio
    import sys

    if len(sys.argv) > 1:
        msg = " ".join(sys.argv[1:])
    else:
        msg = "list all"

    result = asyncio.run(readwatch_skill(msg))
    print(result)
