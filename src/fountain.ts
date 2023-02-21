import { Token } from './token';

import { Scanner } from './scanner';
import { InlineLexer } from './lexer';

export interface Script {
    title?: string,
    html: {
        title_page: string,
        script: string
    },
    tokens?: Token[]
}

export class Fountain {
    private tokens: Token[];
    private scanner: Scanner;
    private inlineLex: InlineLexer;

    constructor() {
        this.scanner = new Scanner;
        this.inlineLex = new InlineLexer;
    }

    parse(script: string, getTokens?: boolean, lineNumbers?: boolean): Script {
        // throw an error if given script source isn't a string
        if (typeof script === 'undefined' || script === null)
            throw new Error("Script is undefined or null.");
        if (typeof script !== 'string')
            throw new Error(
                `Script should be \`string\`, input was \`${Object.prototype.toString.call(script)}\`.`
            );

        try {
            this.tokens = this.scanner.tokenize(script);
            let title = this.tokens.find(token => token.type === 'title');

            return {
                title: title ? this.inlineLex.reconstruct(title.text)
                        .replace('<br />', ' ').replace(/<(?:.|\n)*?>/g, '') : undefined,
                html: {
                    title_page: this.tokens.filter(token => token.is_title).map(token => this.to_html(token, lineNumbers)).join(''),
                    script: this.tokens.filter(token => !token.is_title).map(token => this.to_html(token, lineNumbers)).join('')
                },
                tokens: getTokens ? this.tokens : undefined
            }
        } catch (error) {
            error.message +=
                '\nPlease submit an issue to https://github.com/jonnygreenwald/fountain-js/issues';
            throw error;
        }
    }

    to_html(token: Token, lineNumbers?: Boolean) {
        token.text = this.inlineLex.reconstruct(token.text);
        const lineNumber: String = lineNumbers ? ' data-line="' + token.line_number + '"' : ''
        switch (token.type) {
            case 'title': return '<h1' + lineNumber +'>' + token.text + '</h1>';
            case 'credit': return '<p class="credit"' + lineNumber +'>' + token.text + '</p>';
            case 'author': return '<p class="authors"' + lineNumber +'>' + token.text + '</p>';
            case 'authors': return '<p class="authors"' + lineNumber +'>' + token.text + '</p>';
            case 'source': return '<p class="source"' + lineNumber +'>' + token.text + '</p>';
            case 'notes': return '<p class="notes"' + lineNumber +'>' + token.text + '</p>';
            case 'draft_date': return '<p class="draft-date"' + lineNumber +'>' + token.text + '</p>';
            case 'date': return '<p class="date"' + lineNumber +'>' + token.text + '</p>';
            case 'contact': return '<p class="contact"' + lineNumber +'>' + token.text + '</p>';
            case 'copyright': return '<p class="copyright"' + lineNumber +'>' + token.text + '</p>';

            case 'scene_heading': return '<h3' + lineNumber + (token.scene_number ? ' id="' + token.scene_number + '">' : '>') + token.text + '</h3>';
            case 'transition': return '<h2' + lineNumber +'>' + token.text + '</h2>';

            case 'dual_dialogue_begin': return '<div class="dual-dialogue"' + lineNumber +'>';
            case 'dialogue_begin': return '<div class="dialogue' + (token.dual ? ' ' + token.dual : '') + '"' + lineNumber +'>';
            case 'character': return '<h4' + lineNumber +'>' + token.text + '</h4>';
            case 'parenthetical': return '<p class="parenthetical"' + lineNumber +'>' + token.text + '</p>';
            case 'dialogue': return '<p' + lineNumber +'>' + token.text + '</p>';
            case 'dialogue_end': return '</div>';
            case 'dual_dialogue_end': return '</div>';

            case 'section': return '';
            case 'synopsis': return '<p class="synopsis"' + lineNumber +'>' + token.text + '</p>';

            case 'note': return '<!-- ' + token.text + ' -->';
            case 'boneyard_begin': return '<!-- ';
            case 'boneyard_end': return ' -->';

            case 'action': return '<p' + lineNumber +'>' + token.text + '</p>';
            case 'centered': return '<p class="centered"' + lineNumber +'>' + token.text + '</p>';

            case 'lyrics': return '<p class="lyrics"' + lineNumber +'>' + token.text + '</p>';

            case 'page_break': return '<hr' + lineNumber +' />';
            case 'line_break': return '<br' + lineNumber +' />';
        }
    }
}
