"""Independent, fixed examples from the user-supplied question bank. No uploaded code runs."""
import math

assert 3 * 2 ** 2 == 12
assert set([1, 1, 2]) == {1, 2}
a = [1, 2, 3]
b = a
b.append(4)
assert a == [1, 2, 3, 4]

for length in (1, 2, 3, 10, 1000, 100000):
    remaining, steps = length, 0
    while remaining:
        remaining //= 2
        steps += 1
    assert steps == math.floor(math.log2(length)) + 1

def add_item(x, items=[]):  # Intentional example of the defect in the reference question.
    items.append(x)
    return items

first = add_item(1)
second = add_item(2)
assert first is second and second == [1, 2]

def longest_unique(text):
    last, start, best = {}, 0, 0
    for i, char in enumerate(text):
        start = max(start, last.get(char, -1) + 1)
        best = max(best, i - start + 1)
        last[char] = i
    return best

for text, expected in [("", 0), ("abcabcbb", 3), ("bbbbb", 1), ("pwwkew", 3), ("abcde" * 20000, 5)]:
    assert longest_unique(text) == expected

print("Six fixed Python/algorithm reference examples verified; no arbitrary source code executed.")
