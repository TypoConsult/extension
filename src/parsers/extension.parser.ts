import { ParserInterface } from "../types/parser.types";
import { InputInterface } from "../types/general.types";

class ExtensionParser implements ParserInterface {
    async parse(input: InputInterface): Promise<void> {
        console.log(input)
    }
}

export default ExtensionParser
