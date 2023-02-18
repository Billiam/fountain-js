import { regex } from './regex';
import { Token } from './token';

import { Lexer } from './lexer';

export class Scanner {
    private tokens: Token[] = [];

    tokenize(script: string): Token[] {
        // reverse the array so that dual dialog can be constructed bottom up
        const source: string[] = new Lexer().reconstruct(script).split(regex.capturingSplitter).reverse();

        let line: string;
        let dual: boolean;
        let lineNumber: number = (script.match(regex.newline) || []).length + 1;

        for (line of source) {
            let match: string[];

            const lineNewlines = (line.match(regex.newline) || []).length
            if (regex.newlines.test(line)) {
                lineNumber -= lineNewlines - 1;
                continue;
            }
            lineNumber -= lineNewlines + 1;

            /** title page */
            if (regex.title_page.test(line)) {
                match = line.replace(regex.title_page, '\n$1').split(regex.splitter).reverse();
                let linePosition = lineNumber + lineNewlines
                for (const item of match) {
                    let pair = item.replace(regex.cleaner, '').split(/:\n*/);
                    linePosition -= (pair[1].match(regex.newline) || []).length + 1;
                    this.tokens.push({ type: pair[0].trim().toLowerCase().replace(' ', '_'), is_title: true, text: pair[1].trim(), line_number: linePosition });
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

                    this.tokens.push({ type: 'scene_heading', text: text, scene_number: num || undefined, line_number: lineNumber });
                }
                continue;
            }

            /** centered */
            if (match = line.match(regex.centered)) {
                this.tokens.push({ type: 'centered', text: match[0].replace(/[><]/g, ''), line_number: lineNumber });
                continue;
            }

            /** transitions */
            if (match = line.match(regex.transition)) {
                this.tokens.push({ type: 'transition', text: match[1] || match[2], line_number: lineNumber });
                continue;
            }

            /** dialogue blocks - characters, parentheticals and dialogue */
            if (match = line.match(regex.dialogue)) {
                let name = match[1] || match[2];
                if (name.indexOf('  ') !== name.length - 2) {
                    let linePosition = lineNumber + lineNewlines

                    // iterating from the bottom up, so push dialogue blocks in reverse order
                    if (match[3]) {
                        this.tokens.push({ type: 'dual_dialogue_end', line_number: linePosition });
                    }

                    this.tokens.push({ type: 'dialogue_end', line_number: linePosition });

                    let parts: string[] = match[4].split(/(\(.+\))(?:\n+)/).reverse();

                    for (const part of parts) {
                        if (part.length > 0) {
                            linePosition -= (part.trim().match(regex.newline) || []).length
                            this.tokens.push({ type: regex.parenthetical.test(part) ? 'parenthetical' : 'dialogue', text: part, line_number: linePosition });
                            linePosition--;
                        }
                    }

                    this.tokens.push({ type: 'character', text: name.trim(), line_number: lineNumber });
                    this.tokens.push({ type: 'dialogue_begin', dual: match[3] ? 'right' : dual ? 'left' : undefined, line_number: lineNumber });

                    if (dual) {
                        this.tokens.push({ type: 'dual_dialogue_begin', line_number: lineNumber });
                    }

                    dual = !!match[3];
                    continue;
                }
            }

            /** section */
            if (match = line.match(regex.section)) {
                this.tokens.push({ type: 'section', text: match[2], depth: match[1].length, line_number: lineNumber });
                continue;
            }

            /** synopsis */
            if (match = line.match(regex.synopsis)) {
                this.tokens.push({ type: 'synopsis', text: match[1], line_number: lineNumber });
                continue;
            }

            /** notes */
            if (match = line.match(regex.note)) {
                this.tokens.push({ type: 'note', text: match[1], line_number: lineNumber });
                continue;
            }

            /** boneyard */
            if (match = line.match(regex.boneyard)) {
                this.tokens.push({ type: match[0][0] === '/' ? 'boneyard_begin' : 'boneyard_end', line_number: lineNumber });
                continue;
            }

            /** lyrics */
            if (match = line.match(regex.lyrics)) {
                this.tokens.push({ type: 'lyrics', text: match[0].replace(/^~(?! )/gm, ''), line_number: lineNumber });
                continue;
            }

            /** page breaks */
            if (regex.page_break.test(line)) {
                this.tokens.push({ type: 'page_break', line_number: lineNumber });
                continue;
            }

            /** line breaks */
            if (regex.line_break.test(line)) {
                this.tokens.push({ type: 'line_break', line_number: lineNumber });
                continue;
            }

            // everything else is action -- remove `!` for forced action
            this.tokens.push({ type: 'action', text: line.replace(/^!(?! )/gm, ''), line_number: lineNumber });
        }
        return this.tokens.reverse();
    }
}
