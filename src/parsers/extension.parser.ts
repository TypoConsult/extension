import { ParserInterface } from "../types/parser.types";
import { InputInterface } from "../types/general.types";

class ExtensionParser implements ParserInterface {
    constructor(private readonly input: InputInterface) {
        console.log(input.extensionKey)
    }

    async parse(): Promise<void> {
        console.log(this.input)
    }
}

export default ExtensionParser
