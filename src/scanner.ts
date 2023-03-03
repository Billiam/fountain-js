import { regex } from './regex';
import { Token } from './token';

import { Lexer } from './lexer';

export class Scanner {
    tokenize(script: string): Token[] {
        const tokens: Token[] = []
        // reverse the array so that dual dialog can be constructed bottom up
        const source: string[] = new Lexer().reconstruct(script).split(regex.capturingSplitter).reverse();

        let dual: boolean;
        let lineNumber: number = (script.match(regex.newline) || []).length + 1;
        const firstLine = source.length - 1

        for (const [index, line] of source.entries()) {
            let match: string[];

            const lineNewlines = (line.match(regex.newline) || []).length
            if (regex.newlines.test(line)) {
                lineNumber -= lineNewlines - 1;
                continue;
            }
            lineNumber -= lineNewlines + 1;

            /** title page */
            if (regex.title_page.test(line) && index === firstLine) {
                match = line.replace(regex.title_page, '\n$1').split(regex.splitter).reverse();
                let linePosition = lineNumber + lineNewlines
                for (const item of match) {
                    const [key, value] = item.split(/:/, 2);

                    linePosition -= (value.match(regex.newline) || []).length;

                    tokens.push({
                        type: key.trim().toLowerCase().replace(' ', '_'),
                        is_title: true,
                        text: value.trim(),
                        line_number: linePosition
                    });
                    linePosition--;
                }
                continue;
            }

            /** scene headings */
            if (match = line.match(regex.scene_heading)) {
                let text = match[1] || match[2];
                let meta: RegExpMatchArray;
                let num: string;

                if (text.indexOf('  ') !== text.length - 2) {
                    if (meta = text.match(regex.scene_number)) {
                        num = meta[2];
                        text = text.replace(regex.scene_number, '');
                    }

                    tokens.push({ type: 'scene_heading', text: text, scene_number: num || undefined, line_number: lineNumber });
                }
                continue;
            }

            /** centered */
            if (match = line.match(regex.centered)) {
                tokens.push({ type: 'centered', text: match[0].replace(/ *[><] */g, ''), line_number: lineNumber });
                continue;
            }

            /** transitions */
            if (match = line.match(regex.transition)) {
                tokens.push({ type: 'transition', text: match[1] || match[2], line_number: lineNumber });
                continue;
            }

            /** dialogue blocks - characters, parentheticals and dialogue */
            if (match = line.match(regex.dialogue)) {
                let name = match[1] || match[2];
                if (name.indexOf('  ') !== name.length - 2) {
                    let linePosition = lineNumber + lineNewlines

                    // iterating from the bottom up, so push dialogue blocks in reverse order
                    if (match[3]) {
                        tokens.push({ type: 'dual_dialogue_end', line_number: linePosition });
                    }

                    tokens.push({ type: 'dialogue_end', line_number: linePosition });

                    let parts: string[] = match[4].split(/(\(.+\))(?:\n+)/).reverse();

                    for (const part of parts) {
                        if (part.length > 0) {
                            linePosition -= (part.trim().match(regex.newline) || []).length
                            tokens.push({ type: regex.parenthetical.test(part) ? 'parenthetical' : 'dialogue', text: part, line_number: linePosition });
                            linePosition--;
                        }
                    }

                    tokens.push({ type: 'character', text: name.trim(), line_number: lineNumber });
                    tokens.push({ type: 'dialogue_begin', dual: match[3] ? 'right' : dual ? 'left' : undefined, line_number: lineNumber });

                    if (dual) {
                        tokens.push({ type: 'dual_dialogue_begin', line_number: lineNumber });
                    }

                    dual = !!match[3];
                    continue;
                }
            }

            /** section */
            if (match = line.match(regex.section)) {
                tokens.push({ type: 'section', text: match[2], depth: match[1].length, line_number: lineNumber });
                continue;
            }

            /** synopsis */
            if (match = line.match(regex.synopsis)) {
                tokens.push({ type: 'synopsis', text: match[1], line_number: lineNumber });
                continue;
            }

            /** notes */
            if (match = line.match(regex.note)) {
                tokens.push({ type: 'note', text: match[1], line_number: lineNumber });
                continue;
            }

            /** lyrics */
            if (match = line.match(regex.lyrics)) {
                tokens.push({ type: 'lyrics', text: match[0].replace(/^~(?! )/gm, ''), line_number: lineNumber });
                continue;
            }

            /** page breaks */
            if (regex.page_break.test(line)) {
                tokens.push({ type: 'page_break', line_number: lineNumber });
                continue;
            }

            /** line breaks */
            if (regex.line_break.test(line)) {
                tokens.push({ type: 'line_break', line_number: lineNumber });
                continue;
            }

            // everything else is action -- remove `!` for forced action
            const actionText = line.replace(/^!(?! )/gm, '');
            if (actionText) {
                tokens.push({type: 'action', text: actionText, line_number: lineNumber});
            }
        }
        return tokens.reverse();
    }
}
