"""Generate simple PNG icons for the extension."""
import struct, zlib, os

def make_png(size, color=(0, 212, 255)):
    def chunk(name, data):
        c = zlib.crc32(name + data) & 0xffffffff
        return struct.pack('>I', len(data)) + name + data + struct.pack('>I', c)

    IHDR = struct.pack('>IIBBBBB', size, size, 8, 2, 0, 0, 0)
    rows = []
    for y in range(size):
        row = b'\x00'
        for x in range(size):
            cx, cy = x - size/2, y - size/2
            dist = (cx**2 + cy**2) ** 0.5
            r_out, r_in = size/2, size/2 - size*0.12
            if dist < r_out:
                alpha = 1.0
                if dist < r_in:
                    t = dist / r_in
                    r = int(color[0] * t * 0.4 + 4 * (1-t))
                    g = int(color[1] * t * 0.4 + 4 * (1-t))
                    b = int(color[2] * t * 0.4 + 26 * (1-t))
                else:
                    t = (dist - r_in) / (r_out - r_in)
                    r = int(color[0] * (1-t*0.3))
                    g = int(color[1] * (1-t*0.3))
                    b = int(color[2] * (1-t*0.3))
                row += bytes([min(255,r), min(255,g), min(255,b)])
            else:
                row += bytes([0, 0, 0])
        rows.append(row)

    raw = b''.join(rows)
    compressed = zlib.compress(raw, 9)
    png = (b'\x89PNG\r\n\x1a\n' +
           chunk(b'IHDR', IHDR) +
           chunk(b'IDAT', compressed) +
           chunk(b'IEND', b''))
    return png

os.makedirs('icons', exist_ok=True)
for size in [16, 48, 128]:
    with open(f'icons/icon{size}.png', 'wb') as f:
        f.write(make_png(size))
    print(f'Created icon{size}.png')

print('Done!')
