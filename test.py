import zlib
import itertools

target_crc32 = 0xca93f02f  # your target CRC32

# For demo, brute force all 3-byte strings (from b'\x00\x00\x00' to b'\xff\xff\xff')
for candidate in itertools.product(range(256), repeat=3):
    data = bytes(candidate)
    if zlib.crc32(data) == target_crc32:
        print(f"Found match: {data} with CRC32 {target_crc32:08X}")
        break
else:
    print("No match found.")
