
/*
 * Copyright 2021, Chris Ainsley
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const SEP = "\n";
const DI = "   ";

interface IPicoWriterItem { }

class IndentedLine implements IPicoWriterItem {

   protected _line: string;
   protected _indent: number;

   constructor(line: string, indent: number) {
      this._line = line;
      this._indent = indent;
   }

   public get line() {
      return this._line;
   }

   public get indent() {
      return this._indent;
   }

   public adjustIndent(delta: number) {
      this._indent += delta;
   }
}

class StringHolder {
   protected _text: string = "";

   get text() {
      return this._text;
   }

   set text(newText: string) {
      this._text = newText;
   }
}


export class PicoWriter implements IPicoWriterItem {

   protected _indents: number = -1;
   protected _numLines: number = 0;
   protected _generateIfEmpty: boolean = true;
   protected _generate: boolean = true;
   protected _normalizeAdjacentBlankRows: boolean = false;
   protected _isDirty: boolean = false;
   protected _textBuffer: string = "";
   protected _ic: string = DI;
   protected _rows: string[][] = [];
   protected _content: IPicoWriterItem[] = [];

   constructor(initialIndent: number, indentText: string) {
      this._indents = initialIndent < 0 ? 0 : initialIndent;
      this._ic = indentText == null ? DI : indentText;
   }

   public indentRight() {
      this.flushRows();
      this._indents++;
   }

   public indentLeft() {
      this.flushRows();
      this._indents--;
      if (this._indents < 0) {
         throw new Error("Local indent cannot be less than zero");
      }
   }

   public append(inner: PicoWriter) {
      if (this._textBuffer.length > 0) {
         this.flush();
         this._numLines++;
      }
      this.adjustIndents(inner, this._indents, this._ic);
      this._content.push(inner);
      this._numLines++;
      return this;
   }

   public writeln(text: string) {
      this._numLines++;
      this._textBuffer = this._textBuffer.concat(text);
      this.flush();
      return this;
   }

   public writeln_r(text: string) {
      this.writeln(text);
      this.indentRight();
      return this;
   }

   public writeln_l(text: string) {
      this.flushRows();
      this.indentLeft();
      this.writeln(text);
      return this;
   }

   public writeln_lr(text: string) {
      this.flushRows();
      this.indentLeft();
      this.writeln(text);
      this.indentRight();
      return this;
   }

   public writeRow(strings: string[]) {
      this._rows.push(strings);
      this._isDirty = true;
      this._numLines++;
      return this;
   }

   // public createDeferredWriter() {
   //    return this.createWriter();
   // }

   public createWriter() {
      if (this._textBuffer.length > 0) {
         this.flush();
         this._numLines++;
      }
      const inner = new PicoWriter(this._indents, this._ic);
      this._content.push(inner);
      this._numLines++;
      return inner;
   }

   public createInnerBlockWriter(startLine: string, endLine: string) {
      this.writeln(startLine);
      this.indentRight();
      const newWriter = this.createWriter(); // Don't relecate this line
      this.indentLeft();
      this.writeln(endLine);
      this._isDirty = true;
      this._numLines += 2;
      return newWriter;
   }

   public isEmpty() {
      return this._numLines == 0;
   }

   public write(text: string) {
      this._numLines++;
      this._isDirty = true;
      this._textBuffer = this._textBuffer.concat(text);
   }

   public isMethodBodyEmpty() {
      return this._content.length == 0 && this._textBuffer.length == 0;
   }

   public isGenerateIfEmpty() {
      return this._generateIfEmpty;
   }

   public setGenerateIfEmpty(generateIfEmpty: boolean) {
      this._generateIfEmpty = generateIfEmpty;
   }

   public isGenerate() {
      return this._generate;
   }

   public setGenerate(generate: boolean) {
      this._generate = generate;
   }


   public setNormalizeAdjacentBlankRows(normalizeAdjacentBlankRows: boolean) {
      this._normalizeAdjacentBlankRows = normalizeAdjacentBlankRows;
   }

   public toString() {
      return this.toStringWithIndent(0);
   }

   public adjustIndents(inner: PicoWriter, indents: number, ic: string) {
      if (inner != null) {
         for (var item of inner._content) {
            if (item instanceof PicoWriter) {
               this.adjustIndents(item as PicoWriter, indents, ic);
            } else if (item instanceof IndentedLine) {
               (item as IndentedLine).adjustIndent(indents);
            }
         }
         inner._ic = ic;
      }
   }

   public toStringWithIndent(indentBase: number) {
      var stringHolder = new StringHolder();
      this.render(stringHolder, indentBase, this._normalizeAdjacentBlankRows, false /* lastRowWasBlank */);
      return stringHolder.text;
   }

   private flush() {
      this.flushRows();
      this._content.push(new IndentedLine(this._textBuffer.toString(), this._indents));
      this._textBuffer = "";
      this._isDirty = false;
   }

   private flushRows() {
      if (this._rows.length > 0) {

         var maxWidth: number[] = [];

         for (var columns of this._rows) {
            const numColumns = columns.length;

            for (let i = 0; i < numColumns; i++) {
               var currentColumnStringValue = columns[i];
               var currentColumnStringValueLength = currentColumnStringValue == null ? 0 : currentColumnStringValue.length;
               if (maxWidth.length < i + 1) {
                  maxWidth.push(currentColumnStringValueLength);
               } else {
                  if (maxWidth[i] < currentColumnStringValueLength) {
                     maxWidth[i] = currentColumnStringValueLength;
                  }
               }
            }
         }

         var rowSB = "";

         for (var columns of this._rows) {
            var numColumns = columns.length;
            for (let i = 0; i < numColumns; i++) {
               var currentColumnStringValue = columns[i];
               var currentItemWidth = currentColumnStringValue == null ? 0 : currentColumnStringValue.length;
               var maxWidth1 = maxWidth[i];

               rowSB = rowSB.concat(currentColumnStringValue == null ? "" : currentColumnStringValue);

               if (currentItemWidth < maxWidth1) {
                  for (let j = currentItemWidth; j < maxWidth1; j++) {
                     rowSB = rowSB.concat(" ");
                  }
               }
            }
            this._content.push(new IndentedLine(rowSB.toString(), this._indents));
            rowSB = "";
         }
         this._rows = [];
      }
   }



   private render(holder: StringHolder, indentBase: number, normalizeAdjacentBlankRows: boolean, lastRowWasBlank: boolean) {

      if (this._isDirty) {
         this.flush();
      }

      // Some methods are flagged not to be generated if there is no body text inside the method, we don't add these to the class narrative
      if ((!this.isGenerate()) || ((!this.isGenerateIfEmpty()) && this.isMethodBodyEmpty())) {
         return lastRowWasBlank;
      }

      for (var item of this._content) {
         if (item instanceof IndentedLine) {
            var il = item as IndentedLine;
            const lineText = il.line;
            const indentLevelHere = indentBase + il.indent;
            var thisRowIsBlank = lineText.length == 0;

            if (normalizeAdjacentBlankRows && lastRowWasBlank && thisRowIsBlank) {
               // Don't write the line if we already had a blank line
            } else {
               for (let indentIndex = 0; indentIndex < indentLevelHere; indentIndex++) {
                  holder.text = holder.text.concat(this._ic);
               }
               holder.text = holder.text.concat(lineText);
               holder.text = holder.text.concat(SEP);
            }
            lastRowWasBlank = thisRowIsBlank;
         } else if (item instanceof PicoWriter) {
            lastRowWasBlank = (item as PicoWriter).render(holder, indentBase, normalizeAdjacentBlankRows, lastRowWasBlank);
         } else {
            var text = item.toString();
            holder.text = holder.text.concat(text);
         }
      }

      return lastRowWasBlank;
   }

}