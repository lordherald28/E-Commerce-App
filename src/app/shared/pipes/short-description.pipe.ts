import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortDescriptionPipe',
  standalone: true,
  pure: true
})
export class ShortDescriptionPipe implements PipeTransform {

  transform(value: string | null | undefined, maxLen: number = 15): string {
    if (!value) return '';
    const valueNotSpace = value.trim();

    if (valueNotSpace.length < maxLen) {
      return valueNotSpace;
    }

    // Cortar hasta el limite definido por argumento.
    const cutDescription: string = valueNotSpace.slice(0, maxLen);

    // Evitar cortar palabras por la mitad buscando el ultimo espacio.
    const spaceBeforeWord: number = cutDescription.lastIndexOf(' ');
    const concatDescription: string = spaceBeforeWord > 0 ? cutDescription.slice(0, spaceBeforeWord) : cutDescription;

    return concatDescription;
  }

}
