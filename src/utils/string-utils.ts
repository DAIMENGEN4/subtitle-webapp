export class StringUtils {
    static hasValue(str: string | null | undefined): boolean {
        return str !== null && str !== undefined && str.trim() !== '';
    }
}