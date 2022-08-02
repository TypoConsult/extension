import { ParserInterface } from "../types/parser.types";
import { InputInterface } from "../types/general.types";

class ObjectParser implements ParserInterface {
    constructor(private readonly input: InputInterface) {
    }

    async parse(): Promise<void> {
        console.log(this.input)
    }
}

export default ObjectParser
