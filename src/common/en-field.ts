/**
 * Normaliza um campo de tradução opcional vindo do admin.
 *
 * - `undefined` → `undefined`: o Prisma ignora, a coluna não é tocada
 * - `''` / só espaços → `null`: limpa a tradução (volta a cair no português)
 */
export function trimEn(value?: string | null): string | null | undefined {
    if (value === undefined) return undefined;
    return value?.trim() || null;
}
