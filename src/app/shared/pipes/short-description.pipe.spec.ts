import { ShortDescriptionPipe } from './short-description.pipe';

describe('Pipe: ShortDescriptionPipe', () => {

  let pipeShortDescriptionPipe: ShortDescriptionPipe;
  const text: string = 'Vamos, camina, corre, salta y disfruta el momento.'; // len: 50.

  beforeEach(() => {
    pipeShortDescriptionPipe = new ShortDescriptionPipe();
  });

  it('debería  crearce la instancia del pipe.', () => {
    expect(pipeShortDescriptionPipe).toBeTruthy();
  });

  it('debería regresar una cadena vacía si el valor es null o indefinido.', () => {
    expect(pipeShortDescriptionPipe.transform(null)).toBe('');
    expect(pipeShortDescriptionPipe.transform(undefined)).toBe('');
  });

  it('debería valor por defecto y regresar texto acotado.', () => {
    const wordsResult = pipeShortDescriptionPipe.transform(text);
    console.log('Cantidad wordsResult: ', wordsResult.length);
    expect(wordsResult.length).toBeLessThanOrEqual(15);
  });

  it('debería regresar texto original si el maxLen es mayor que el texto.', () => {
    const wordsResult = pipeShortDescriptionPipe.transform(text, 60);
    expect(wordsResult).toBe(text);
  });

  it('debería cortar el texto original de manera correcta.', () => {
    const wordsResult = pipeShortDescriptionPipe.transform(text, 15);
    expect(wordsResult).toBe('Vamos, camina,');
    expect(wordsResult.length).toBe(14);
  });

  it('debería cortar la palabra si no haya espacios', () => {
    const text = 'Vamos,Salta,Corre,Disfruta';
    const wordsResult = pipeShortDescriptionPipe.transform(text, 10);
    expect(wordsResult).toBe('Vamos,Salt');
    expect(wordsResult.length).toBeLessThanOrEqual(10);
  });
  
});
