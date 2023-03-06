export const regex = {
    title_page: /^([^\n]+:)/gim,

    scene_heading: /^((?:\*{0,3}_?)?(?:(?:int|i)\.?\/(?:ext|e)|int|ext|est)[. ].*)|^\.(?!\.+)(.+)/i,
    scene_number: /( *#(.+)# *)/,

    transition: /^((?:FADE (?:TO BLACK|OUT)|CUT TO BLACK)\.|.+ TO:)|^> *(.+)/,

    dialogue: /^(?:([A-Z*_][0-9A-Z ._\-']*(?:\(.*\))? *)|@([A-Za-z*_][0-9A-Za-z (._\-')]*))(\^?)?\n(?!\n+)([\s\S]+)/,
    parenthetical: /^(\(.+\))$/,

    action: /^(.+)/g,
    centered: /^> *(.+) *<(\n.+)*/g,

    lyrics: /^~(?! ).+(?:\n.+)*/,

    section: /^(#+) *(.*)/,
    synopsis: /^=(?!=+) *(.*)/,

    note: /^\[{2}(?!\[+)(.+)]{2}(?!\[+)$/,
    note_inline: /\[{2}(?!\[+)([\s\S]+?)]{2}(?!\[+)/g,
    boneyard: /(^\/\*|^\*\/)$/g,

    page_break: /^={3,}$/,
    line_break: /^ {2}$/,

    bold_italic_underline: /(_\*{3}(?=[^\s*_].*\*{3}_)|\*{3}_(?=[^\s*_].*_\*{3}))(.+?)(?<=[^\s*_])(\*{3}_|_\*{3})/g,
    bold_underline: /(_\*{2}(?=[^\s*_].*\*{2}_)|\*{2}_(?=[^\s*_].*_\*{2}))(.+?)(?<=[^\s*_])(\*{2}_|_\*{2})/g,
    italic_underline: /(_\*(?=[^\s*_].*\*_)|\*_(?=[^\s*_].*_\*))(.+?)(?<=[^\s*_])(\*_|_\*)/g,
    bold_italic: /(\*{3}(?=[^\s*_].*\*{3}))(.+?)(?<=[^\s*_])(\*{3})/g,
    bold: /(\*{2}(?=[^\s*_].*\*{2}))(.+?)(?<=[^\s*_])(\*{2})/g,
    italic: /(\*(?=[^\s*_].*\*))(.+?)(?<=[^\s*_])(\*)/g,
    underline: /(_(?=[^\s*_].*_))(.+?)(?<=[^\s*_])(_)/g,

    splitter: /\n{2,}/g,
    capturingSplitter: /(\n{2,})/g,
    newlines: /^\n{2,}$/,
    newline: /\n/g,

    cleaner: /^\n+|\n+$/,
    standardizer: /\r\n|\r/g,
    whitespacer: /^\t+|^ {3,}/gm
  };
