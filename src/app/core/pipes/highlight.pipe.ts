import { Pipe, PipeTransform } from '@angular/core';
import * as Prism from 'prismjs';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
/* import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-kotlin';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-scala'; */

@Pipe({
  name: 'highlight',
  standalone: true,
})
export class HighlightPipe implements PipeTransform {
  transform(code: string, language: string = 'plaintext'): string {
    if (!code || !language) return code; // Devuelve el texto sin formato si faltan datos
    try {
      // Usa Prism para resaltar el código
      return Prism.highlight(code, Prism.languages[language], language);
    } catch (error) {
      console.warn(
        `No se pudo resaltar el código para el lenguaje: ${language}`,
        error
      );
      return code;
    }
  }
}
