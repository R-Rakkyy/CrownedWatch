"""
python -m crownedwatch.pipeline SRC OUTDIR

debug and test purposes.
"""

import asyncio
import json
import sys

from pathlib import Path

from . import process

meta = asyncio.run(process(Path(sys.argv[1]), Path(sys.argv[2])))

print(json.dumps(meta, indent=2))
