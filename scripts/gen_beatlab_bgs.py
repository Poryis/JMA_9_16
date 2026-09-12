"""
Generate 5 concept backgrounds for the Beat Lab game screen.
Each is styled to match the JMA cartoon universe: flat colors, thick
black outlines, minimal / no shading, low detail.

Outputs saved to /app/frontend/public/assets/backgrounds/concepts/
so we can preview them in a lightweight React page.
"""

import asyncio
import base64
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

load_dotenv("/app/backend/.env")

API_KEY = os.getenv("EMERGENT_LLM_KEY")
if not API_KEY:
    print("Missing EMERGENT_LLM_KEY in /app/backend/.env")
    sys.exit(1)

OUT_DIR = Path("/app/frontend/public/assets/backgrounds/concepts")
OUT_DIR.mkdir(parents=True, exist_ok=True)

# Reference image = playground.png (existing JMA flat art style). We
# reuse it so Nano Banana can style-match.
STYLE_REF = Path("/app/frontend/public/assets/backgrounds/playground.png")
with open(STYLE_REF, "rb") as f:
    STYLE_REF_B64 = base64.b64encode(f.read()).decode("utf-8")

STYLE_PROMPT = (
    "Match the exact cartoon art style of the reference image: flat "
    "solid colors, thick bold black outlines, minimal or no shading, "
    "very low detail, no gradients, no photorealism. 16:9 widescreen "
    "landscape background suitable as a game screen backdrop. Leave "
    "generous empty space in the CENTER of the composition so a UI "
    "grid can overlay on top without visual clash. Muted / desaturated "
    "palette so the busy UI stays the focal point."
)

CONCEPTS = [
    (
        "a_faded_brick_tag",
        "A faded urban brick wall as a wide backdrop. One big cartoon "
        "spray-painted graffiti tag reading 'BEAT LAB' is centered near "
        "the top of the wall. The rest of the wall is calm and mostly "
        "empty. Muted red-brown brick, cream mortar lines. The tag uses "
        "cyan and yellow bubble letters with a thick black outline. "
        "No characters, no other decorations."
    ),
    (
        "b_subway_tile",
        "A wide dirty white subway tile wall backdrop. In the top-left "
        "corner there is a small stenciled tag reading 'JMA'. The tiles "
        "have thick black grout lines and a couple of tiny cartoon paint "
        "drip streaks near the corners. Otherwise the wall is calm and "
        "mostly empty. No characters."
    ),
    (
        "c_alley_night",
        "A wide dark alley at night as a backdrop. Deep muted navy and "
        "violet walls on either side. A soft cone of warm yellow "
        "streetlight glow shines down onto the center of the ground. "
        "Tiny hints of blurred graffiti paint on the walls at the far "
        "edges. Cartoon flat art, thick black outlines. Center of the "
        "image is calm and mostly empty, just softly lit ground. No "
        "characters."
    ),
    (
        "d_boombox_stoop",
        "A wide low-saturation cartoon backdrop of an oversized old-"
        "school boom box sitting on a stoop. The boom box is anchored to "
        "the very bottom of the frame with only the top half of it "
        "visible, twin cassette speakers on the left and right edges. "
        "The upper 70 percent of the image is a calm flat muted "
        "background color (dusty peach or muted teal). Thick black "
        "outlines, no shading. No characters."
    ),
    (
        "e_vinyl_turntable",
        "A wide cartoon backdrop showing a huge vinyl record from "
        "directly above, filling most of the frame. The record is "
        "monochrome charcoal grey with thick black concentric groove "
        "rings and a small red-and-cream center label reading 'JMA'. "
        "The record is centered. Background around the record is a "
        "single muted warm cream color. Flat art, thick black outlines, "
        "no shading, low detail."
    ),
]


async def gen_one(name: str, prompt: str):
    full_prompt = f"{STYLE_PROMPT}\n\nSCENE: {prompt}"
    chat = (
        LlmChat(
            api_key=API_KEY,
            session_id=f"beatlab-bg-{name}",
            system_message="You are a cartoon background illustrator.",
        )
        .with_model("gemini", "gemini-3.1-flash-image-preview")
        .with_params(modalities=["image", "text"])
    )
    msg = UserMessage(
        text=full_prompt,
        file_contents=[ImageContent(STYLE_REF_B64)],
    )
    try:
        _text, images = await chat.send_message_multimodal_response(msg)
    except Exception as e:
        print(f"[{name}] ERROR: {e}")
        return False
    if not images:
        print(f"[{name}] no image returned")
        return False
    img_bytes = base64.b64decode(images[0]["data"])
    out_path = OUT_DIR / f"{name}.png"
    with open(out_path, "wb") as f:
        f.write(img_bytes)
    print(f"[{name}] saved -> {out_path} ({len(img_bytes)} bytes)")
    return True


async def main():
    # Kick off all 5 in parallel
    results = await asyncio.gather(*(gen_one(n, p) for n, p in CONCEPTS))
    ok = sum(1 for r in results if r)
    print(f"\nDone. {ok}/{len(CONCEPTS)} succeeded.")


if __name__ == "__main__":
    asyncio.run(main())
