"""Edit-distance style similarity measures."""


def levenshtein_distance(s1: str, s2: str) -> int:
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    if not s2:
        return len(s1)
    previous = list(range(len(s2) + 1))
    for i, c1 in enumerate(s1):
        current = [i + 1]
        for j, c2 in enumerate(s2):
            current.append(min(previous[j + 1] + 1, current[j] + 1, previous[j] + (c1 != c2)))
        previous = current
    return previous[-1]


def jaccard_similarity(s1: str, s2: str) -> float:
    """Share of distinct lowercase words the two texts have in common (0 to 1)."""
    w1, w2 = set(s1.lower().split()), set(s2.lower().split())
    if not w1 and not w2:
        return 1.0
    return len(w1 & w2) / len(w1 | w2)
