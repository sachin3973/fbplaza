import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: "decimalTruncate",
})
export class DecimalTruncatePipe implements PipeTransform {
    transform(value: number, decimalPlaces: number = 2): number {
        const factor = Math.pow(10, decimalPlaces);
        return Math.trunc(value * factor) / factor;
    }
}
