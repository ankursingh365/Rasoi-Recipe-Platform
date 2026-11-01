// Makes text safe to use inside a regular expression. Characters like ( * + ? have special
// meanings in a regex, so a search for "1/2 (half)" must treat them as plain characters.
export const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');