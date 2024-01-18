import { PrompsAnswersInterface } from "./general.types";

export interface ParserInterface {
    parse: (input: PrompsAnswersInterface) => Promise<void>
}
