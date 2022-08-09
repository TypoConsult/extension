import { SharedInputInterface } from "./general.types";

export interface ParserInterface {
    parse: (input: SharedInputInterface) => Promise<void>
}
