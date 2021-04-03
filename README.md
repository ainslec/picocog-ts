# Picocog

Picocog is a tiny code generation library.

Picocog formats indented source code files and makes it easy to write to several locations inside a file simultaniously.

A Java Version of the library is available here:

https://github.com/ainslec/picocog

A Dart version of the library is available here:

https://github.com/ainslec/picocog-dart

An introduction to picocog is here:

https://medium.com/@model_train/introducing-picocog-68de4978eaf4

Sample usage

```typescript
   var w = new PicoWriter(0, "   ");

   w.writeln("import java.util.*;");
   w.writeln("import java.concurrency.*;");
   w.writeln("import java.sql.*;");
   w.writeln("");
   w.writeln_r("public class MyTableName {");
   {
      w.writeln("");
      var fieldsWriter  = w.createWriter();
      var methodsWriter = w.createWriter();
   
      {
         fieldsWriter.writeRow(["private ", "int ", "_id ", ";"]);
         var setterWriter = methodsWriter.createInnerBlockWriter("public void setId(int id) {", "}");
         methodsWriter.writeln("");
         setterWriter.writeln("this._id = id;")
      }
   
      {
         fieldsWriter.writeRow(["private ", "String ", "_name ", ";"]);
         var setterWriter = methodsWriter.createInnerBlockWriter("public void setName(String name) {", "}");
         methodsWriter.writeln("");
         setterWriter.writeln("this._name = name;")
      }
   
   }
   w.writeln_l("}");
   
   // Write out the 
   console.log(w.toString());
```

This code generates the following Java file:

```java
import java.util.*;
import java.concurrency.*;
import java.sql.*;

public class MyTableName {

    private int    _id   ;
    private String _name ;

    public void setId(int id) {
        this._id = id;
    }

    public void setName(String name) {
        this._name = name;
    }
}
```

## Author

Written by Chris Ainsley.