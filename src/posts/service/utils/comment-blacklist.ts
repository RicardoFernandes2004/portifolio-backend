const DEFAULT_BLACKLIST = [
    'merda',
    'porra',
    'caralho',
    'puta',
    'viado',
    'idiota',
    'imbecil',
    'fuck',
    'shit',
    'bitch',
    'asshole',
];

function normalize(text: string): string {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

function loadBlacklist(): string[] {
    const fromEnv = process.env.COMMENT_BLACKLIST?.trim();
    const source = fromEnv
        ? fromEnv.split(',').map((w) => w.trim()).filter((w) => w.length > 0)
        : DEFAULT_BLACKLIST;
    return source.map(normalize);
}

export function containsBlacklistedWord(text: string): boolean {
    const normalized = normalize(text);
    const tokens = new Set(normalized.split(/[^a-z0-9]+/).filter(Boolean));
    return loadBlacklist().some((word) => {
        if (word.includes(' ')) {
            return normalized.includes(word);
        }
        return tokens.has(word);
    });
}
