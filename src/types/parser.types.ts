import { InputInterface } from "./general.types";

export interface ParserInterface {
    parse: (input: InputInterface) => Promise<void>
}
