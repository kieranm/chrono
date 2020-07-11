import { MONTH_DICTIONARY } from "../constants";
import { Parser, ParsingContext } from "../../../chrono";
import { findYearClosestToRef } from "../../../calculation/yearCalculation";
import { matchAnyPattern } from "../../../utils/pattern";
import { YEAR_PATTERN, parseYear } from "../constants";
import { AbstractParserWithWordBoundaryChecking } from "../../../common/parsers/AbstractParserWithWordBoundary";

const PATTERN = new RegExp(
    `(${matchAnyPattern(MONTH_DICTIONARY)})` +
        "\\s*" +
        "(?:" +
        `[,-]?\\s*(${YEAR_PATTERN})?` +
        ")?" +
        "(?=[^\\s\\w]|\\s+[^0-9]|\\s+$|$)",
    "i"
);

const MONTH_NAME_GROUP = 1;
const YEAR_GROUP = 2;

/**
 * The parser for parsing month name and year.
 * - January, 2012
 * - January 2012
 * - January
 */
export default class ENMonthNameParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern(): RegExp {
        return PATTERN;
    }

    innerExtract(context: ParsingContext, match: RegExpMatchArray) {
        if (match[0].length <= 3) {
            return null;
        }

        const components = context.createParsingComponents();
        components.imply("day", 1);

        const monthName = match[MONTH_NAME_GROUP];
        const month = MONTH_DICTIONARY[monthName.toLowerCase()];
        components.assign("month", month);

        if (match[YEAR_GROUP]) {
            const year = parseYear(match[YEAR_GROUP]);
            components.assign("year", year);
        } else {
            const year = findYearClosestToRef(context.refDate, 1, month);
            components.imply("year", year);
        }

        return components;
    }
}
