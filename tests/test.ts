import { PicoWriter } from "../src/index";

test("Test Basic Picocog Pattern", () => {
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
   
   var result = w.toString();
   expect(result).toBe("import java.util.*;\nimport java.concurrency.*;\nimport java.sql.*;\n\npublic class MyTableName {\n   \n   private int    _id   ;\n   private String _name ;\n   \n   public void setId(int id) {\n      this._id = id;\n   }\n   \n   public void setName(String name) {\n      this._name = name;\n   }\n   \n}\n");
   console.log(result);
});

