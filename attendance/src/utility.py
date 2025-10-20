"""Editor-only stub for src.utility.parse_model_name and get_kernel
These stubs exist to satisfy the static analyzer; runtime will use the real functions from the original repo.
"""
from typing import Tuple

def parse_model_name(name: str) -> Tuple[int,int,str,str]:
    """Return (h_input, w_input, model_type, rest) -- best-effort parsing from filename like '2.7_80x80_MiniFASNetV2.pth'"""
    try:
        parts = name.split('_')
        if len(parts) >= 2:
            # try to parse something like '2.7' and '80x80'
            h_w = parts[1]
            if 'x' in h_w:
                h, w = h_w.split('x')
                h_i = int(h)
                w_i = int(w)
            else:
                h_i = 80
                w_i = 80
        else:
            h_i = 80
            w_i = 80
        model_type = 'MiniFASNetV2'
        return h_i, w_i, model_type, ''
    except Exception:
        return 80, 80, 'MiniFASNetV2', ''

def get_kernel(h, w):
    return 3
